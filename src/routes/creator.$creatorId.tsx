import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { Button } from "@/components/ui/button";
import { getCreator } from "@/lib/atlas/data";
import { toggleFollow, useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/creator/$creatorId")({
  head: () => ({
    meta: [
      { title: "Creator — Atlas" },
      {
        name: "description",
        content: "Experiences built by Atlas creators who know their city block by block.",
      },
      { property: "og:title", content: "Creator — Atlas" },
      {
        property: "og:description",
        content: "Experiences built by Atlas creators.",
      },
    ],
  }),
  component: CreatorPage,
});

function CreatorPage() {
  const { creatorId } = Route.useParams();
  const creator = getCreator(creatorId);
  const state = useAtlas();

  if (!creator) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">
          Creator not found.
        </div>
      </AppShell>
    );
  }

  const following = state.following.includes(creator.id);

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Explore
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {creator.initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[26px] leading-tight text-foreground">
              {creator.name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{creator.tagline}</p>
            <p className="text-xs text-muted-foreground">{creator.followers}</p>
          </div>
        </div>

        <Button
          variant={following ? "quiet" : "accent"}
          size="xl"
          className="mt-5 w-full"
          onClick={() => toggleFollow(creator.id)}
        >
          {following ? "Following" : "Follow"}
        </Button>

        <h2 className="mt-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Experiences
        </h2>
        <div className="mt-3 space-y-3 pb-6">
          {creator.experiences.map((item) =>
            item.experienceId ? (
              <Link
                key={item.title}
                to="/experience/$experienceId"
                params={{ experienceId: item.experienceId }}
                className="flex items-center justify-between gap-3 card-soft p-4"
              >
                <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="shrink-0 text-sm font-semibold text-accent">
                  {item.note}
                </span>
              </Link>
            ) : (
              <div
                key={item.title}
                className="flex items-center justify-between gap-3 rounded-3xl border border-dashed border-border p-4"
              >
                <span className="min-w-0 truncate text-sm font-medium text-muted-foreground">
                  {item.title}
                </span>
                <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {item.note}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </AppShell>
  );
}
