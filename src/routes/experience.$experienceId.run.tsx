import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  Check,
  Crosshair,
  Footprints,
  MapPin,
  Navigation,
  Pause,
  Play,
  PlayCircle,
  Radar,
} from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { CheckInOverlay } from "@/components/atlas/CheckInOverlay";
import { GeoMap } from "@/components/atlas/GeoMap";
import type { LiveMarker } from "@/components/atlas/LiveMap";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENTS, getExperience } from "@/lib/atlas/data";
import { distanceMeters, formatDistance, stopGeo, venueGeo } from "@/lib/atlas/geo";
import { useGeo } from "@/lib/atlas/useGeo";
import { checkIn, nextStopIndex, useAtlas, type CheckInResult } from "@/lib/atlas/store";

export const Route = createFileRoute("/experience/$experienceId/run")({
  validateSearch: (search: Record<string, unknown>): { stop?: string } =>
    typeof search["stop"] === "string" ? { stop: search["stop"] } : {},
  head: () => ({
    meta: [
      { title: "On route — Atlas" },
      {
        name: "description",
        content: "Walk the route, check in at each stop, and collect what you discover.",
      },
      { property: "og:title", content: "On route — Atlas" },
      {
        property: "og:description",
        content: "Check in at each stop and collect what you discover.",
      },
    ],
  }),
  component: RunPage,
});

type Phase = "travel" | "content" | "complete";

function RunPage() {
  const { experienceId } = Route.useParams();
  const experience = getExperience(experienceId);
  const { stop: stopParam } = Route.useSearch();
  const state = useAtlas();

  const geo = useGeo();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("travel");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [forcedArrival, setForcedArrival] = useState(false);

  const total = experience?.stops.length ?? 0;
  const doneStops = useMemo(
    () => state.progress[experienceId]?.completedStops ?? [],
    [state.progress, experienceId],
  );

  // --- real-world geo for the current stop ---
  const currentStop = experience?.stops[Math.min(index, Math.max(total - 1, 0))];
  const fence = currentStop ? stopGeo(currentStop.id) : null;
  const distance = geo.position && fence ? distanceMeters(geo.position, fence) : null;
  const inRange = distance !== null && fence !== null && distance <= fence.radius;
  const arrived = inRange || forcedArrival;
  const anchor = venueGeo(experienceId);

  const markers = useMemo<LiveMarker[]>(() => {
    if (!experience) return [];
    return experience.stops.map((s, i) => {
      const g = stopGeo(s.id);
      const collected = doneStops.includes(s.id);
      const isCurrent = i === index;
      return {
        id: s.id,
        label: collected ? "✓" : String(i + 1),
        title: `${s.title} — ${g.area}`,
        lat: g.lat,
        lng: g.lng,
        radius: g.radius,
        state: collected ? "collected" : isCurrent && inRange ? "inRange" : "locked",
      };
    });
  }, [experience, doneStops, index, inRange]);

  // Any real / simulated move resets the manual "simulate arrival" flag.
  useEffect(() => {
    setForcedArrival(false);
  }, [index]);

  const geoLabel =
    geo.status === "live"
      ? `GPS live · ±${geo.accuracy} m`
      : geo.status === "locating"
        ? "Finding you…"
        : geo.status === "denied"
          ? "Location blocked"
          : geo.status === "simulated"
            ? "Demo walk mode"
            : geo.status === "unsupported"
              ? "No GPS on this device"
              : "Location off";

  useEffect(() => {
    if (!experience || synced) return;
    const fromMap = stopParam ? experience.stops.findIndex((s) => s.id === stopParam) : -1;
    if (fromMap !== -1) {
      setIndex(fromMap);
      setPhase("travel");
    } else if (doneStops.length === experience.stops.length && doneStops.length > 0) {
      setPhase("complete");
    } else {
      setIndex(nextStopIndex(state, experienceId));
    }
    setSynced(true);
  }, [experience, synced, state, experienceId, doneStops.length, stopParam]);

  if (!experience) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">
          Experience not found.
        </div>
      </AppShell>
    );
  }

  const stop = experience.stops[Math.min(index, total - 1)]!;
  const discovered = doneStops.length;
  const pct = Math.round((discovered / total) * 100);

  function handleCheckIn() {
    const res = checkIn(experienceId, stop.id);
    setResult(res);
  }

  function continueFromOverlay() {
    const wasComplete = result?.experienceComplete;
    setResult(null);
    setPhase(wasComplete ? "content" : "content");
  }

  function nextStop() {
    if (index + 1 >= total) {
      setPhase("complete");
      return;
    }
    setIndex(index + 1);
    setPhase("travel");
    setPlaying(false);
    setForcedArrival(false);
  }

  const nextLabel = experience.category === "Art" ? "Next artwork" : "Next place";

  if (phase === "complete") {
    const achievement = ACHIEVEMENTS[experience.completionAchievement]!;
    return (
      <AppShell>
        <div className="px-5 pt-10 pb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-accent">
            Experience Complete
          </p>
          <h1 className="mt-3 font-display text-[30px] leading-tight text-foreground">
            {experience.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {total} / {total} discovered
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-3xl bg-ink p-4 text-left text-inverse">
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Achievement
              </p>
              <p className="mt-1 text-sm font-semibold text-inverse">{achievement.title}</p>
              <p className="text-xs text-inverse/60">{achievement.description}</p>
              <p className="mt-2 text-xs font-semibold text-accent">+500 XP</p>
            </div>
          </div>

          <div className="mt-7 space-y-3 text-left">
            {experience.stops.map((s) => (
              <div key={s.id} className="card-soft flex items-center gap-3 p-3">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.venue} — {s.city}
                  </p>
                </div>
                <span className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Button variant="hero" size="xl" className="w-full" asChild>
              <Link to="/collection">View Collection</Link>
            </Button>
            <Button
              variant="accent"
              size="xl"
              className="w-full"
              onClick={() => window.alert("Achievement shared to your Atlas profile.")}
            >
              Share Achievement
            </Button>
            <Button variant="quiet" size="xl" className="w-full" asChild>
              <Link to="/">Discover another Experience</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {result ? <CheckInOverlay result={result} onContinue={continueFromOverlay} /> : null}

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <Link
            to="/experience/$experienceId"
            params={{ experienceId }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {experience.title}
          </Link>
          <span className="text-xs font-semibold text-foreground">
            Stop {Math.min(index, total - 1) + 1} of {total}
          </span>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {discovered} of {total} complete · {pct}%
        </p>
      </div>

      {phase !== "content" ? (
        <div className="px-5 pt-6 pb-8">
          <div className="card-soft overflow-hidden">
            <div className="relative h-60 p-2">
              <GeoMap
                className="h-full"
                center={geo.position ?? fence ?? anchor}
                zoom={anchor.zoom}
                user={geo.position}
                accuracy={geo.accuracy}
                markers={markers}
                selectedId={stop.id}
                fitKey={stop.id}
                follow
              />
              <span className="pointer-events-none absolute bottom-5 left-5 z-[500] inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-sm">
                <Navigation className="h-3.5 w-3.5 text-accent" />
                {arrived
                  ? "You're here"
                  : distance === null
                    ? "Turn on location"
                    : `${formatDistance(distance)} away · fence ${fence?.radius ?? 0} m`}
              </span>
              <span className="pointer-events-none absolute top-5 left-5 z-[500] inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-sm">
                <Radar className="h-3.5 w-3.5 text-accent" /> {geoLabel}
              </span>
            </div>

            <div className="flex items-center gap-3 p-4">
              <img
                src={stop.image}
                alt={stop.title}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Stop {Math.min(index, total - 1) + 1} of {total}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{stop.title}</p>
                <p className="truncate text-xs text-muted-foreground">{stop.subtitle}</p>
              </div>
            </div>
          </div>

          {fence?.area ? (
            <p className="mt-3 text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3.5 w-3.5 text-accent" />
              {fence.area}
            </p>
          ) : null}

          {arrived ? (
            <Button variant="accent" size="xl" className="mt-5 w-full" onClick={handleCheckIn}>
              <MapPin className="h-4 w-4" /> CHECK IN
            </Button>
          ) : (
            <Button variant="hero" size="xl" className="mt-5 w-full" disabled>
              {distance === null
                ? "Turn on location to check in"
                : `Get within ${fence?.radius ?? 0} m — ${formatDistance(distance)} to go`}
            </Button>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={geo.requestLive}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground active:scale-[0.98]"
            >
              <Crosshair className="h-3.5 w-3.5" /> Use my GPS
            </button>
            <button
              onClick={() => fence && geo.walkTo({ lat: fence.lat, lng: fence.lng })}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground active:scale-[0.98]"
            >
              <Footprints className="h-3.5 w-3.5" /> Demo: walk there
            </button>
          </div>

          {geo.status === "denied" ? (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Location is blocked in your browser. Allow it to play for real, or use the demo walk
              to test the loop from here.
            </p>
          ) : null}

          <button
            onClick={() => setForcedArrival(true)}
            className="mt-3 w-full py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70"
          >
            Simulate arrival · dev shortcut
          </button>
        </div>
      ) : (
        <div className="pb-8">
          <img
            src={stop.image}
            alt={stop.title}
            loading="lazy"
            width={1024}
            height={1024}
            className="mt-5 h-64 w-full object-cover"
          />
          <div className="px-5 pt-5">
            <h1 className="font-display text-[26px] leading-tight text-foreground">{stop.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{stop.subtitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stop.meta}</p>

            <div className="mt-5 flex items-center gap-3 card-soft p-3">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                aria-label={playing ? "Pause audio" : "Play audio"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Listen — {stop.audioLength}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-[2000ms]"
                    style={{ width: playing ? "62%" : "6%" }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => window.alert("Video player is mocked in this demo.")}
              className="mt-3 flex w-full items-center gap-3 rounded-3xl border border-border bg-surface p-4 text-left"
            >
              <PlayCircle className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
              <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                {stop.videoCta}
              </span>
            </button>

            <div className="mt-7 space-y-5">
              {stop.blocks.map((block) => (
                <section key={block.heading}>
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                    {block.heading}
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-foreground">{block.body}</p>
                </section>
              ))}
            </div>

            <Button variant="hero" size="xl" className="mt-8 w-full" onClick={nextStop}>
              {index + 1 >= total ? "Finish experience" : nextLabel}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
