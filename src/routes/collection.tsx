import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/atlas/AppShell";
import { Button } from "@/components/ui/button";
import { useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Your Collection — Atlas" },
      {
        name: "description",
        content: "Every stop you check in at is collected here, sorted by category.",
      },
      { property: "og:title", content: "Your Collection — Atlas" },
      {
        property: "og:description",
        content: "Every place you have collected with Atlas.",
      },
    ],
  }),
  component: CollectionPage,
});

const CATEGORIES = ["Art", "Coffee"] as const;

function CollectionPage() {
  const state = useAtlas();

  return (
    <AppShell>
      <ScreenHeader eyebrow="Collected" title="Your Collection" />

      {state.collection.length === 0 ? (
        <div className="px-5 pt-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary">
            <Layers className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <p className="mt-4 font-display text-[20px] text-foreground">Nothing collected yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check in at your first stop and it lands here.
          </p>
          <Button variant="hero" size="xl" className="mt-6 w-full" asChild>
            <Link to="/">Explore Paris</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8 px-5 pt-2">
          {CATEGORIES.map((category) => {
            const items = state.collection.filter((c) => c.category === category);
            if (items.length === 0) return null;
            const noun = category === "Art" ? "artwork" : "place";
            return (
              <section key={category}>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-[22px] text-foreground">{category}</h2>
                  <p className="text-xs text-muted-foreground">
                    {items.length} {noun}
                    {items.length === 1 ? "" : "s"} discovered
                  </p>
                </div>
                <div className="mt-3 space-y-3">
                  {items.map((item) => (
                    <article
                      key={`${item.experienceId}-${item.stopId}`}
                      className="card-soft flex items-center gap-3 p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.venue} — {item.city}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-accent">
                          {item.date}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
