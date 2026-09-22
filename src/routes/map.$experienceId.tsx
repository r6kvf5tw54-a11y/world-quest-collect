import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { GeoRadar } from "@/components/atlas/GeoRadar";
import { getExperience } from "@/lib/atlas/data";
import { useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/map/$experienceId")({
  head: () => ({
    meta: [
      { title: "Venue radar — Atlas" },
      {
        name: "description",
        content:
          "Every stop of this experience as a geo-fenced point around you. Walk in, check in, collect.",
      },
      { property: "og:title", content: "Venue radar — Atlas" },
      {
        property: "og:description",
        content: "Geo-fenced stops of this experience around your position.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VenueMap,
});

function VenueMap() {
  const { experienceId } = Route.useParams();
  const experience = getExperience(experienceId);
  const state = useAtlas();

  if (!experience) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">
          Venue not found.
        </div>
      </AppShell>
    );
  }

  const done = state.progress[experienceId]?.completedStops ?? [];
  const pct = Math.round((done.length / experience.stops.length) * 100);

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Live map
          </Link>
          <span className="text-xs font-semibold text-foreground">
            {done.length} / {experience.stops.length} collected
          </span>
        </div>

        <h1 className="mt-3 font-display text-[24px] leading-tight text-foreground">
          {experience.venue}
        </h1>
        <p className="text-xs text-muted-foreground">{experience.title}</p>

        <div className="mt-3 mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <GeoRadar experienceId={experienceId} />
    </AppShell>
  );
}
