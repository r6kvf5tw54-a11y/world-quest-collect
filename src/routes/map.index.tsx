import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, MapPin, Navigation } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/atlas/AppShell";
import { MapPin as Pin, MapSurface } from "@/components/atlas/MapSurface";
import { Button } from "@/components/ui/button";
import { EXPERIENCES } from "@/lib/atlas/data";
import { cityPoint } from "@/lib/atlas/map";
import { completedCount, useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/map/")({
  head: () => ({
    meta: [
      { title: "Map — Atlas" },
      {
        name: "description",
        content:
          "The Atlas game board: open the map of Paris, pick a venue and walk its stops one by one.",
      },
      { property: "og:title", content: "Map — Atlas" },
      {
        property: "og:description",
        content: "Open the map, pick a venue, collect its stops.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const state = useAtlas();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>(EXPERIENCES[0]!.id);
  const active = EXPERIENCES.find((e) => e.id === selected)!;
  const done = completedCount(state, active.id);

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Paris · Game board"
        title="Map"
        action={
          <span className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground">
            {state.xp} XP
          </span>
        }
      />

      <div className="px-5">
        <MapSurface plan="city" className="h-[340px]">
          {EXPERIENCES.map((exp) => {
            const p = cityPoint(exp.id);
            const count = completedCount(state, exp.id);
            return (
              <Pin
                key={exp.id}
                x={p.x}
                y={p.y}
                label={String(exp.stops.length)}
                title={exp.title}
                state={
                  count === exp.stops.length ? "collected" : exp.id === selected ? "next" : "locked"
                }
                onClick={() => setSelected(exp.id)}
              />
            );
          })}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-foreground">
            <Navigation className="h-3.5 w-3.5 text-accent" /> You are near the Louvre
          </span>
        </MapSurface>

        <div className="card-soft mt-4 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            {active.categoryLabel}
          </p>
          <h2 className="mt-1 font-display text-[22px] leading-tight text-foreground">
            {active.title}
          </h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {cityPoint(active.id).area} ·{" "}
            {done}/{active.stops.length} collected
          </p>
          <Button
            variant="hero"
            size="xl"
            className="mt-4 w-full"
            onClick={() =>
              navigate({ to: "/map/$experienceId", params: { experienceId: active.id } })
            }
          >
            <Compass className="h-4 w-4" /> Open venue map
          </Button>
        </div>

        <p className="mt-4 pb-4 text-xs leading-relaxed text-muted-foreground">
          Tap a pin to select a venue, then open its map to see every stop inside it.
        </p>
      </div>
    </AppShell>
  );
}
