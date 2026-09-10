import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, MapPin as PinIcon, Navigation } from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { MapPin as Pin, MapSurface } from "@/components/atlas/MapSurface";
import { Button } from "@/components/ui/button";
import { getExperience } from "@/lib/atlas/data";
import { stopPoint } from "@/lib/atlas/map";
import { nextStopIndex, useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/map/$experienceId")({
  head: () => ({
    meta: [
      { title: "Venue map — Atlas" },
      {
        name: "description",
        content:
          "The plan of the venue with every stop as a pin. Walk to a pin, check in, and collect it.",
      },
      { property: "og:title", content: "Venue map — Atlas" },
      {
        property: "og:description",
        content: "Every stop as a pin on the venue plan.",
      },
    ],
  }),
  component: VenueMap,
});

function VenueMap() {
  const { experienceId } = Route.useParams();
  const experience = getExperience(experienceId);
  const state = useAtlas();
  const navigate = useNavigate();
  const [openStop, setOpenStop] = useState<string | null>(null);

  if (!experience) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">
          Venue not found.
        </div>
      </AppShell>
    );
  }

  const doneStops = state.progress[experienceId]?.completedStops ?? [];
  const nextIdx = nextStopIndex(state, experienceId);
  const nextId = experience.stops[nextIdx]?.id;
  const selected =
    experience.stops.find((s) => s.id === (openStop ?? nextId)) ?? experience.stops[0]!;
  const selectedDone = doneStops.includes(selected.id);
  const pct = Math.round((doneStops.length / experience.stops.length) * 100);

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Paris map
          </Link>
          <span className="text-xs font-semibold text-foreground">
            {doneStops.length} / {experience.stops.length} collected
          </span>
        </div>

        <h1 className="mt-3 font-display text-[24px] leading-tight text-foreground">
          {experience.venue}
        </h1>
        <p className="text-xs text-muted-foreground">{experience.title}</p>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="px-5 pt-4">
        <MapSurface
          plan={experience.category === "Art" ? "louvre" : "city"}
          className="h-[390px]"
        >
          {experience.stops.map((stop, i) => {
            const p = stopPoint(stop.id);
            const collected = doneStops.includes(stop.id);
            return (
              <Pin
                key={stop.id}
                x={p.x}
                y={p.y}
                label={collected ? "✓" : String(i + 1)}
                title={`${stop.title} — ${p.area}`}
                state={collected ? "collected" : stop.id === selected.id ? "next" : "locked"}
                onClick={() => setOpenStop(stop.id)}
              />
            );
          })}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-foreground">
            <Navigation className="h-3.5 w-3.5 text-accent" /> {selected.distance}
          </span>
        </MapSurface>

        <div className="card-soft mt-4 flex items-start gap-3 p-3">
          <img
            src={selected.image}
            alt={selected.title}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {stopPoint(selected.id).area}
            </p>
            <p className="truncate text-sm font-semibold text-foreground">{selected.title}</p>
            <p className="truncate text-xs text-muted-foreground">{selected.subtitle}</p>
          </div>
          {selectedDone && (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <Check className="h-4 w-4" />
            </span>
          )}
        </div>

        <Button
          variant={selectedDone ? "quiet" : "accent"}
          size="xl"
          className="mt-3 w-full"
          onClick={() =>
            navigate({
              to: "/experience/$experienceId/run",
              params: { experienceId },
              search: { stop: selected.id },
            })
          }
        >
          <PinIcon className="h-4 w-4" />
          {selectedDone ? "Revisit this stop" : "Go to this stop"}
        </Button>

        <p className="mt-3 pb-4 text-xs leading-relaxed text-muted-foreground">
          Tap any numbered pin to jump to that stop. Pins turn brass once collected.
        </p>
      </div>
    </AppShell>
  );
}
