import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, MapPin, Palette } from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { Button } from "@/components/ui/button";
import { getExperience } from "@/lib/atlas/data";
import { completedCount, purchase, toggleFollow, useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/experience/$experienceId")({
  head: () => ({
    meta: [
      { title: "Experience — Atlas" },
      {
        name: "description",
        content:
          "A guided route of real-world stops. Check in, learn, and collect each stop as you go.",
      },
      { property: "og:title", content: "Experience — Atlas" },
      {
        property: "og:description",
        content: "A guided route of real-world stops you can collect.",
      },
    ],
  }),
  component: ExperienceDetail,
});

function ExperienceDetail() {
  const { experienceId } = Route.useParams();
  const experience = getExperience(experienceId);
  const state = useAtlas();
  const navigate = useNavigate();

  if (!experience) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">
          Experience not found.
        </div>
      </AppShell>
    );
  }

  const owned = state.purchased.includes(experience.id);
  const done = completedCount(state, experience.id);
  const following = state.following.includes(experience.creatorId);

  return (
    <AppShell>
      <div className="relative">
        <img
          src={experience.hero}
          alt={experience.title}
          width={1280}
          height={960}
          className="h-72 w-full object-cover"
        />
        <div className="scrim absolute inset-0" />
        <Link
          to="/"
          className="absolute left-4 top-5 grid h-9 w-9 place-items-center rounded-full bg-inverse/90 text-ink"
          aria-label="Back to Explore"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="absolute inset-x-5 bottom-5">
          <h1 className="font-display text-[30px] leading-tight text-inverse">
            {experience.title}
          </h1>
          <p className="mt-1 text-sm text-inverse/75">By {experience.creatorName}</p>
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {experience.stops.length} stops
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {experience.duration}
          </span>
          <span>{experience.venue}</span>
          <span className="inline-flex items-center gap-1">
            <Palette className="h-3.5 w-3.5" /> {experience.category}
          </span>
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-foreground">
          {experience.blurb}
        </p>

        {owned ? (
          <Button
            variant="hero"
            size="xl"
            className="mt-5 w-full"
            onClick={() =>
              navigate({
                to: "/experience/$experienceId/run",
                params: { experienceId: experience.id },
              })
            }
          >
            {done > 0 ? `Continue — ${done}/${experience.stops.length}` : "Start Experience"}
          </Button>
        ) : (
          <Button
            variant="hero"
            size="xl"
            className="mt-5 w-full"
            onClick={() => purchase(experience.id)}
          >
            Buy Experience — €{experience.price.toFixed(2)}
          </Button>
        )}

        <Button
          variant="quiet"
          size="xl"
          className="mt-3 w-full"
          onClick={() => toggleFollow(experience.creatorId)}
        >
          {following ? `Following ${experience.creatorName}` : `Follow ${experience.creatorName.split(" ")[0]}`}
        </Button>

        <h2 className="mt-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          The route
        </h2>
        <ol className="mt-3 space-y-3 pb-6">
          {experience.stops.map((stop, i) => {
            const collected = (state.progress[experience.id]?.completedStops ?? []).includes(
              stop.id,
            );
            return (
              <li key={stop.id} className="card-soft flex items-center gap-3 p-3">
                <img
                  src={stop.image}
                  alt={stop.title}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Stop {i + 1}
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {stop.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{stop.subtitle}</p>
                </div>
                {collected && (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </AppShell>
  );
}
