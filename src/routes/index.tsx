import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/atlas/AppShell";
import { Button } from "@/components/ui/button";
import { EXPERIENCES, CREATORS } from "@/lib/atlas/data";
import {
  completedCount,
  inProgressExperiences,
  toggleFollow,
  useAtlas,
} from "@/lib/atlas/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas — Collect the world" },
      {
        name: "description",
        content:
          "Atlas turns the real world into a game board. Discover experiences, check in at stops, and collect the places you visit.",
      },
      { property: "og:title", content: "Atlas — Collect the world" },
      {
        property: "og:description",
        content: "Don't just visit places. Collect them.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const state = useAtlas();
  const continuing = inProgressExperiences(state);

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Paris · Live"
        title="Explore Paris"
        action={
          <span className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground">
            {state.xp} XP
          </span>
        }
      />

      <p className="px-5 text-sm leading-relaxed text-muted-foreground">
        Don't just visit places. Collect them.
      </p>

      {continuing.length > 0 && (
        <section className="mt-7 px-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Continue
          </h2>
          <div className="mt-3 space-y-3">
            {continuing.map((exp) => {
              const done = completedCount(state, exp.id);
              const pct = Math.round((done / exp.stops.length) * 100);
              return (
                <Link
                  key={exp.id}
                  to="/experience/$experienceId/run"
                  params={{ experienceId: exp.id }}
                  className="block card-soft p-4 transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={exp.hero}
                      alt={exp.title}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {exp.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {done} of {exp.stops.length} complete · {pct}%
                      </p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8 space-y-5 px-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Featured experiences
        </h2>
        {EXPERIENCES.map((exp) => (
          <article key={exp.id} className="card-soft overflow-hidden">
            <div className="relative">
              <img
                src={exp.hero}
                alt={exp.title}
                width={1280}
                height={960}
                className="h-48 w-full object-cover"
              />
              <div className="scrim absolute inset-0" />
              <div className="absolute inset-x-4 bottom-4">
                <span className="rounded-full bg-inverse/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
                  {exp.categoryLabel}
                </span>
                <h3 className="mt-2 font-display text-[22px] leading-tight text-inverse">
                  {exp.shortTitle}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{exp.creatorName}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{exp.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {exp.stops.length} stops
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {exp.duration}
                </span>
                <span className="font-semibold text-foreground">
                  €{exp.price.toFixed(2)}
                </span>
              </div>
              <Button variant="hero" size="xl" className="mt-4 w-full" asChild>
                <Link to="/experience/$experienceId" params={{ experienceId: exp.id }}>
                  View Experience
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-9 px-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Creators
        </h2>
        <div className="mt-3 space-y-3">
          {CREATORS.map((creator) => (
            <div key={creator.id} className="card-soft flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {creator.initials}
              </div>
              <Link
                to="/creator/$creatorId"
                params={{ creatorId: creator.id }}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-sm font-semibold text-foreground">
                  {creator.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {creator.tagline} · {creator.followers}
                </p>
              </Link>
              <Button
                variant={state.following.includes(creator.id) ? "quiet" : "accent"}
                size="pill"
                className="shrink-0"
                onClick={() => toggleFollow(creator.id)}
              >
                {state.following.includes(creator.id) ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-9 px-5">
        <div className="rounded-3xl bg-ink p-5 text-inverse shadow-elevated">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Atlas Explorer
            </p>
          </div>
          <h3 className="mt-3 font-display text-[24px] leading-tight text-inverse">
            Explorer — €9.99 / month
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-inverse/70">
            <li>Access to selected experiences</li>
            <li>Unlimited collection</li>
            <li>Exclusive creator drops</li>
            <li>Subscriber achievements</li>
          </ul>
          <Button variant="onDark" size="xl" className="mt-5 w-full" asChild>
            <Link to="/profile">See subscription</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
