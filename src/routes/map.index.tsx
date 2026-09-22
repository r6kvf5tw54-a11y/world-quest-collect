import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ScreenHeader } from "@/components/atlas/AppShell";
import { GeoRadar } from "@/components/atlas/GeoRadar";
import { useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/map/")({
  head: () => ({
    meta: [
      { title: "Live map — Atlas" },
      {
        name: "description",
        content:
          "Your real GPS position on the Atlas map: walk to a geo-fenced stop and check in when you are inside its radius.",
      },
      { property: "og:title", content: "Live map — Atlas" },
      {
        property: "og:description",
        content: "Walk to a real location, step inside the radius, check in.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const state = useAtlas();
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Live · Paris"
        title="Map"
        action={
          <span className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground">
            {state.xp} XP
          </span>
        }
      />
      <GeoRadar />
    </AppShell>
  );
}
