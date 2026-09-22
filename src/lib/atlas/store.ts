import { useSyncExternalStore } from "react";
import { formatDate } from "date-fns";
import {
  ACHIEVEMENTS,
  BASE_XP,
  EXPERIENCES,
  XP_PER_COMPLETION,
  XP_PER_STOP,
  getExperience,
} from "./data";

export type CollectedItem = {
  stopId: string;
  experienceId: string;
  title: string;
  venue: string;
  city: string;
  category: string;
  date: string;
  image: string;
  /** The player's own photo of the object (JPEG data URL), when captured. */
  photo?: string | undefined;
};

export type AtlasState = {
  purchased: string[];
  progress: Record<string, { completedStops: string[]; completedAt?: string | undefined }>;
  collection: CollectedItem[];
  achievements: string[];
  following: string[];
  subscribed: boolean;
  xp: number;
};

const KEY = "atlas-demo-v1";

const initialState: AtlasState = {
  purchased: [],
  progress: {},
  collection: [],
  achievements: [],
  following: [],
  subscribed: false,
  xp: BASE_XP,
};

let state: AtlasState = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initialState, ...(JSON.parse(raw) as AtlasState) };
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
}

function set(updater: (prev: AtlasState) => AtlasState) {
  state = updater(state);
  persist();
  emit();
}

export function useAtlas() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  );
}

/** Today, formatted like "22 Sep 2026". */
function today() {
  return formatDate(new Date(), "d MMM yyyy");
}

/* ---------- actions ---------- */

export function purchase(experienceId: string) {
  set((s) =>
    s.purchased.includes(experienceId) ? s : { ...s, purchased: [...s.purchased, experienceId] },
  );
}

export function toggleFollow(creatorId: string) {
  set((s) => ({
    ...s,
    following: s.following.includes(creatorId)
      ? s.following.filter((c) => c !== creatorId)
      : [...s.following, creatorId],
  }));
}

export function subscribe_premium() {
  set((s) => ({
    ...s,
    subscribed: true,
    achievements: s.achievements.includes("explorer-subscriber")
      ? s.achievements
      : [...s.achievements, "explorer-subscriber"],
  }));
}

export type CheckInResult = {
  stopTitle: string;
  discovered: number;
  total: number;
  xp: number;
  newAchievements: string[];
  experienceComplete: boolean;
  photo?: string | undefined;
};

export function checkIn(experienceId: string, stopId: string, photo?: string): CheckInResult {
  const experience = getExperience(experienceId)!;
  const stop = experience.stops.find((s) => s.id === stopId)!;
  let result: CheckInResult = {
    stopTitle: stop.title,
    discovered: 0,
    total: experience.stops.length,
    xp: XP_PER_STOP,
    newAchievements: [],
    experienceComplete: false,
    photo,
  };

  set((s) => {
    const prev = s.progress[experienceId]?.completedStops ?? [];
    if (prev.includes(stopId)) {
      result = { ...result, discovered: prev.length };
      return s;
    }
    const completedStops = [...prev, stopId];
    const complete = completedStops.length === experience.stops.length;
    const isFirstEver = s.collection.length === 0;

    const unlocked: string[] = [];
    if (isFirstEver) unlocked.push("first-discovery");
    if (
      experience.category === "Art" &&
      completedStops.length === 2 &&
      !s.achievements.includes("museum-starter")
    )
      unlocked.push("museum-starter");
    if (complete && !s.achievements.includes(experience.completionAchievement))
      unlocked.push(experience.completionAchievement);

    const gained = XP_PER_STOP + (complete ? XP_PER_COMPLETION : 0);

    result = {
      stopTitle: stop.title,
      discovered: completedStops.length,
      total: experience.stops.length,
      xp: gained,
      newAchievements: unlocked.filter((id) => ACHIEVEMENTS[id]),
      experienceComplete: complete,
      photo,
    };

    return {
      ...s,
      purchased: s.purchased.includes(experienceId) ? s.purchased : [...s.purchased, experienceId],
      progress: {
        ...s.progress,
        [experienceId]: {
          completedStops,
          completedAt: complete ? today() : s.progress[experienceId]?.completedAt,
        },
      },
      collection: [
        ...s.collection,
        {
          stopId: stop.id,
          experienceId,
          title: stop.title,
          venue: stop.venue,
          city: stop.city,
          category: experience.category,
          date: today(),
          image: stop.image,
          photo,
        },
      ],
      achievements: [...s.achievements, ...unlocked],
      xp: s.xp + gained,
    };
  });

  return result;
}

export function resetDemo() {
  state = initialState;
  persist();
  emit();
}

/* ---------- selectors ---------- */

export function completedCount(s: AtlasState, experienceId: string) {
  return s.progress[experienceId]?.completedStops.length ?? 0;
}

export function nextStopIndex(s: AtlasState, experienceId: string) {
  const exp = getExperience(experienceId)!;
  const done = s.progress[experienceId]?.completedStops ?? [];
  const idx = exp.stops.findIndex((stop) => !done.includes(stop.id));
  return idx === -1 ? exp.stops.length - 1 : idx;
}

export function inProgressExperiences(s: AtlasState) {
  return EXPERIENCES.filter((e) => {
    const done = completedCount(s, e.id);
    return done > 0 && done < e.stops.length;
  });
}

export function completedExperiences(s: AtlasState) {
  return EXPERIENCES.filter((e) => completedCount(s, e.id) === e.stops.length);
}

export function level(xp: number) {
  return Math.max(3, Math.floor(xp / 500));
}
