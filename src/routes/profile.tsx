import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, RotateCcw, Sparkles } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/atlas/AppShell";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENTS } from "@/lib/atlas/data";
import {
  completedExperiences,
  level,
  resetDemo,
  subscribe_premium,
  useAtlas,
} from "@/lib/atlas/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Atlas" },
      {
        name: "description",
        content: "Your level, XP, achievements and Atlas Explorer subscription.",
      },
      { property: "og:title", content: "Profile — Atlas" },
      { property: "og:description", content: "Your Atlas level and achievements." },
    ],
  }),
  component: ProfilePage,
});

const SHOWN = ["first-discovery", "museum-starter", "louvre-explorer", "coffee-explorer"];

function ProfilePage() {
  const state = useAtlas();
  const lvl = level(state.xp);
  const progressToNext = ((state.xp % 500) / 500) * 100;

  return (
    <AppShell>
      <ScreenHeader eyebrow="Atlas" title="Your Profile" />

      <div className="px-5">
        <div className="rounded-3xl bg-ink p-5 text-inverse shadow-elevated">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Level {lvl} — Explorer
          </p>
          <p className="mt-2 font-display text-[32px] leading-none text-inverse">
            {state.xp} XP
          </p>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-inverse/15">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-1000"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-inverse/[0.06] p-3">
              <p className="font-display text-[22px] text-inverse">
                {completedExperiences(state).length}
              </p>
              <p className="text-[11px] text-inverse/60">Completed Experiences</p>
            </div>
            <div className="rounded-2xl bg-inverse/[0.06] p-3">
              <p className="font-display text-[22px] text-inverse">
                {state.collection.length}
              </p>
              <p className="text-[11px] text-inverse/60">Discovered Places</p>
            </div>
          </div>
        </div>

        <h2 className="mt-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Achievements
        </h2>
        <div className="mt-3 space-y-3">
          {SHOWN.map((id) => {
            const unlocked = state.achievements.includes(id);
            const a = ACHIEVEMENTS[id]!;
            return (
              <div
                key={id}
                className={
                  unlocked
                    ? "card-soft flex items-start gap-3 p-4"
                    : "flex items-start gap-3 rounded-3xl border border-dashed border-border p-4 opacity-60"
                }
              >
                <Award
                  className={
                    unlocked
                      ? "mt-0.5 h-5 w-5 shrink-0 text-accent"
                      : "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  }
                  strokeWidth={1.75}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mt-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Subscription
        </h2>
        <div className="mt-3 card-soft p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Explorer — €9.99 / month</p>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>Access to selected experiences</li>
            <li>Unlimited collection</li>
            <li>Exclusive creator drops</li>
            <li>Subscriber achievements</li>
          </ul>
          <Button
            variant={state.subscribed ? "quiet" : "hero"}
            size="xl"
            className="mt-4 w-full"
            disabled={state.subscribed}
            onClick={() => subscribe_premium()}
          >
            {state.subscribed ? "Subscription active" : "Start Subscription"}
          </Button>
        </div>

        <div className="mt-9 pb-8">
          <Button
            variant="quiet"
            size="xl"
            className="w-full"
            onClick={() => resetDemo()}
          >
            <RotateCcw className="h-4 w-4" /> Reset demo
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Atlas — collect the world.{" "}
            <Link to="/" className="underline">
              Explore
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
