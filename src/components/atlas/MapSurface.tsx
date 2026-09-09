import type { ReactNode } from "react";

/** Shared game-board surface: paper grid + subtle vignette. */
export function MapSurface({
  children,
  className = "",
  plan,
}: {
  children: ReactNode;
  className?: string;
  plan: "louvre" | "city";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border bg-secondary ${className}`}
    >
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(oklch(0.9_0.012_85)_1px,transparent_1px),linear-gradient(90deg,oklch(0.9_0.012_85)_1px,transparent_1px)] [background-size:26px_26px]" />
      <svg
        className="absolute inset-0 h-full w-full text-border"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {plan === "louvre" ? (
          <g fill="none" stroke="currentColor" strokeWidth="0.6">
            {/* Louvre U-shape: Richelieu (left), Sully (right), Denon (bottom) */}
            <path d="M14 22 H40 V58 H14 Z" className="fill-background/70" />
            <path d="M60 22 H86 V58 H60 Z" className="fill-background/70" />
            <path d="M14 60 H86 V82 H14 Z" className="fill-background/70" />
            <path d="M43 34 L50 27 L57 34 L50 41 Z" className="fill-accent/25" />
            <path d="M50 41 V60" strokeDasharray="2 2" />
          </g>
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="0.6">
            {/* Seine + a few boulevards */}
            <path
              d="M0 62 C 20 56, 34 66, 50 60 S 78 48, 100 54"
              className="stroke-primary/25"
              strokeWidth="3"
            />
            <path d="M0 30 H100" strokeDasharray="3 3" />
            <path d="M30 0 V100" strokeDasharray="3 3" />
            <path d="M72 0 V100" strokeDasharray="3 3" />
          </g>
        )}
      </svg>
      {children}
    </div>
  );
}

export function MapPin({
  label,
  x,
  y,
  state,
  onClick,
  title,
}: {
  label: string;
  x: number;
  y: number;
  state: "collected" | "next" | "locked";
  onClick: () => void;
  title: string;
}) {
  const base =
    "absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full text-[12px] font-semibold shadow-frame transition-transform active:scale-95";
  const tone =
    state === "collected"
      ? "bg-accent text-accent-foreground"
      : state === "next"
        ? "bg-primary text-primary-foreground ring-4 ring-accent/30"
        : "bg-background text-muted-foreground border border-border";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={`${base} ${tone} h-9 w-9`}
    >
      {label}
      {state === "next" && (
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/25" />
      )}
    </button>
  );
}
