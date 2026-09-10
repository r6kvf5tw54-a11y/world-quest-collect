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
      className={`relative overflow-hidden rounded-3xl border border-border bg-secondary shadow-frame ${className}`}
    >
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:24px_24px]" />
      <svg
        className="absolute inset-0 h-full w-full text-border"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {plan === "louvre" ? (
          <g>
            {/* Palace depth gives the plan a restrained architectural-isometric feel. */}
            <g className="fill-muted stroke-border" strokeWidth="0.45">
              <path d="M12 27 H67 V39 H59 V36 H12 Z" transform="translate(1.4 2.4)" />
              <path d="M8 68 H67 V81 H8 Z" transform="translate(1.4 2.4)" />
              <path
                d="M64 27 H91 V75 H64 V66 H70 V38 H64 Z"
                transform="translate(1.4 2.4)"
              />
            </g>

            {/* The three historic wings and the eastern Cour Carrée. */}
            <g className="fill-background stroke-muted-foreground/55" strokeWidth="0.65">
              <path d="M12 27 H67 V39 H59 V36 H12 Z" />
              <path d="M8 68 H67 V81 H8 Z" />
              <path d="M64 27 H91 V75 H64 V66 H70 V38 H64 Z" />
              <path d="M70 38 H85 V64 H70 Z" className="fill-secondary" strokeWidth="0.45" />
              <path d="M14 30 H56 M16 34 H60 M12 72 H62 M12 77 H60" strokeWidth="0.28" />
              <path d="M68 31 H87 M67 70 H87 M75 28 V36 M84 28 V36" strokeWidth="0.28" />
            </g>

            {/* Cour Napoléon, pyramid and the visitor route. */}
            <path
              d="M57 43 L45 51 L58 64"
              className="fill-none stroke-accent/70"
              strokeWidth="0.75"
              strokeDasharray="1.4 1.7"
              strokeLinecap="round"
            />
            <path d="M38 53 L45 46 L52 53 L45 60 Z" className="fill-accent/15 stroke-accent/70" strokeWidth="0.65" />
            <path d="M38 53 H52 M45 46 V60 M40 49 L50 57 M50 49 L40 57" className="stroke-accent/45" strokeWidth="0.28" />
            <circle cx="45" cy="53" r="1.1" className="fill-accent" />

            {/* Seine edge and cartographic labels. */}
            <path d="M4 89 C24 86 45 91 66 87 S88 84 97 86" className="fill-none stroke-primary/20" strokeWidth="1.8" />
            <g className="fill-muted-foreground text-[3px] font-semibold uppercase tracking-[0.12em]">
              <text x="28" y="33">Richelieu</text>
              <text x="29" y="77">Denon</text>
              <text x="76" y="34">Sully</text>
            </g>
            <g className="fill-muted-foreground/70 text-[2.25px] uppercase tracking-[0.08em]">
              <text x="36" y="44">Cour Napoléon</text>
              <text x="73" y="52" transform="rotate(90 73 52)">Cour Carrée</text>
              <text x="72" y="90">La Seine</text>
            </g>
            <g className="fill-none stroke-muted-foreground/40" strokeWidth="0.35">
              <path d="M5 12 V19 M5 12 H12" />
              <path d="M95 81 V88 M88 88 H95" />
            </g>
            <g className="fill-muted-foreground/55 text-[2px] font-semibold uppercase tracking-[0.12em]">
              <text x="7" y="16">Palais du Louvre</text>
              <text x="80" y="95">Paris · 1er</text>
            </g>
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
