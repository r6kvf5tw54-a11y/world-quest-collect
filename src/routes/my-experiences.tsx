import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, ScreenHeader } from "@/components/atlas/AppShell";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/atlas/data";
import {
  completedCount,
  completedExperiences,
  inProgressExperiences,
  useAtlas,
  type AtlasState,
} from "@/lib/atlas/store";

export const Route = createFileRoute("/my-experiences")({
  head: () => ({
    meta: [
      { title: "My Experiences — Atlas" },
      {
        name: "description",
        content: "Track the routes you have started and finished across the city.",
      },
      { property: "og:title", content: "My Experiences — Atlas" },
      {
        property: "og:description",
        content: "Your in-progress and completed Atlas routes.",
      },
    ],
  }),
  component: MyExperiencesPage,
});

function Card({ exp, state }: { exp: Experience; state: AtlasState }) {
  const done = completedCount(state, exp.id);
  const pct = Math.round((done / exp.stops.length) * 100);
  const complete = done === exp.stops.length;

  return (
    <Link
      to={complete ? "/experience/$experienceId" : "/experience/$experienceId/run"}
      params={{ experienceId: exp.id }}
      className="block card-soft overflow-hidden transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 p-3">
        <img
          src={exp.hero}
          alt={exp.title}
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{exp.title}</p>
          <p className="truncate text-xs text-muted-foreground">{exp.creatorName}</p>
          <p className="mt-1 text-xs font-medium text-foreground">
            {done}/{exp.stops.length} {complete ? "· Complete" : `· ${pct}%`}
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function MyExperiencesPage() {
  const state = useAtlas();
  const active = inProgressExperiences(state);
  const finished = completedExperiences(state);
  const notStarted = state.purchased.filter(
    (id) => completedCount(state, id) === 0,
  );

  return (
    <AppShell>
      <ScreenHeader eyebrow="Your routes" title="My Experiences" />

      <div className="space-y-8 px-5 pt-2">
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            In Progress
          </h2>
          <div className="mt-3 space-y-3">
            {active.length === 0 && notStarted.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing in progress. Pick an experience to begin.
              </p>
            ) : null}
            {active.map((exp) => (
              <Card key={exp.id} exp={exp} state={state} />
            ))}
            {notStarted.map((id) => {
              const exp = [...active, ...finished].find((e) => e.id === id);
              return exp ? null : (
                <Link
                  key={id}
                  to="/experience/$experienceId/run"
                  params={{ experienceId: id }}
                  className="block card-soft p-4 text-sm font-semibold text-foreground"
                >
                  Start your purchased experience
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Completed
          </h2>
          <div className="mt-3 space-y-3">
            {finished.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed routes yet.</p>
            ) : (
              finished.map((exp) => <Card key={exp.id} exp={exp} state={state} />)
            )}
          </div>
        </section>

        <Button variant="quiet" size="xl" className="w-full" asChild>
          <Link to="/">Discover another Experience</Link>
        </Button>
      </div>
    </AppShell>
  );
}
