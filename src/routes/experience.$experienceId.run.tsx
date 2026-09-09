import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Check,
  MapPin,
  Navigation,
  Pause,
  Play,
  PlayCircle,
} from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { CheckInOverlay } from "@/components/atlas/CheckInOverlay";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENTS, getExperience } from "@/lib/atlas/data";
import {
  checkIn,
  nextStopIndex,
  useAtlas,
  type CheckInResult,
} from "@/lib/atlas/store";

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

type Phase = "travel" | "arrived" | "content" | "complete";

function RunPage() {
  const { experienceId } = Route.useParams();
  const experience = getExperience(experienceId);
  const { stop: stopParam } = Route.useSearch();
  const state = useAtlas();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("travel");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);

  const total = experience?.stops.length ?? 0;
  const doneStops = state.progress[experienceId]?.completedStops ?? [];

  useEffect(() => {
    if (!experience || synced) return;
    const fromMap = stopParam
      ? experience.stops.findIndex((s) => s.id === stopParam)
      : -1;
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
            <div className="relative h-40 bg-secondary">
              <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(oklch(0.9_0.012_85)_1px,transparent_1px),linear-gradient(90deg,oklch(0.9_0.012_85)_1px,transparent_1px)] [background-size:26px_26px]" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 160" fill="none">
                <path
                  d="M40 130 C 90 120, 100 60, 160 60 S 240 40, 262 30"
                  stroke="currentColor"
                  className="text-accent"
                  strokeWidth="2.5"
                  strokeDasharray="7 7"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="130" r="6" className="fill-current text-primary" />
                <circle cx="262" cy="30" r="7" className="fill-current text-accent" />
              </svg>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-foreground">
                <Navigation className="h-3.5 w-3.5 text-accent" />
                {phase === "arrived" ? "You're here" : stop.distance}
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

          {phase === "arrived" ? (
            <Button variant="accent" size="xl" className="mt-5 w-full" onClick={handleCheckIn}>
              <MapPin className="h-4 w-4" /> CHECK IN
            </Button>
          ) : (
            <Button variant="hero" size="xl" className="mt-5 w-full" disabled>
              Check in when you're nearby
            </Button>
          )}

          <button
            onClick={() => setPhase("arrived")}
            className="mt-3 w-full rounded-2xl border border-dashed border-border py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Simulate arrival · demo
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
            <h1 className="font-display text-[26px] leading-tight text-foreground">
              {stop.title}
            </h1>
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
                <p className="text-sm font-semibold text-foreground">
                  Listen — {stop.audioLength}
                </p>
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
                  <p className="mt-2 text-[15px] leading-relaxed text-foreground">
                    {block.body}
                  </p>
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
