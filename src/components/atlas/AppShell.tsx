import { Link } from "@tanstack/react-router";
import { Compass, Map, Layers, User } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Explore", icon: Compass, exact: true },
  { to: "/my-experiences", label: "My Experiences", icon: Map },
  { to: "/collection", label: "Collection", icon: Layers },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas px-0 py-0 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden bg-background sm:rounded-[2.75rem] sm:shadow-frame sm:ring-1 sm:ring-border">
        <div className="relative flex min-h-screen flex-col sm:min-h-[880px]">
          <main className="flex-1 overflow-y-auto pb-28">{children}</main>
          <nav className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/85 px-2 pb-5 pt-2 backdrop-blur-xl">
            <ul className="grid grid-cols-4">
              {NAV.map(({ to, label, icon: Icon, exact }) => (
                <li key={to}>
                  <Link
                    to={to}
                    activeOptions={{ exact: Boolean(exact) }}
                    className="group flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium tracking-wide text-muted-foreground transition-colors data-[status=active]:text-primary"
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function ScreenHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-5 pb-4 pt-8">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 truncate font-display text-[28px] leading-tight tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}
