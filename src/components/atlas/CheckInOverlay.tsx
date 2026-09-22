import { Award, Check } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/atlas/data";
import type { CheckInResult } from "@/lib/atlas/store";
import { Button } from "@/components/ui/button";

export function CheckInOverlay({
  result,
  onContinue,
}: {
  result: CheckInResult;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink/95 px-6 backdrop-blur-md">
      <div className="w-full max-w-[340px] animate-fade-in text-center">
        {result.photo ? (
          <div className="relative mx-auto h-44 w-44 animate-scale-in">
            <img
              src={result.photo}
              alt={result.stopTitle}
              className="h-full w-full rounded-[28px] object-cover ring-2 ring-accent/60 shadow-elevated"
            />
            <span className="absolute -bottom-3 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-accent text-ink ring-4 ring-ink">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </span>
          </div>
        ) : (
          <div className="mx-auto grid h-20 w-20 animate-scale-in place-items-center rounded-full bg-accent/15 ring-1 ring-accent/40">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-accent text-ink">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </div>
          </div>
        )}

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.42em] text-accent">
          Found
        </p>
        <h2 className="mt-3 font-display text-[30px] leading-tight text-inverse">
          {result.stopTitle}
        </h2>
        <p className="mt-3 text-sm text-inverse/60">
          {result.discovered} / {result.total} discovered
        </p>

        <div className="mt-6 inline-flex items-center rounded-full border border-inverse/15 px-4 py-1.5 text-sm font-medium text-inverse">
          +{result.xp} XP
        </div>

        <div className="mt-6 h-1 overflow-hidden rounded-full bg-inverse/15">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out"
            style={{ width: `${(result.discovered / result.total) * 100}%` }}
          />
        </div>

        {result.newAchievements.map((id) => (
          <div
            key={id}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-inverse/12 bg-inverse/[0.06] p-4 text-left"
          >
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Achievement unlocked
              </p>
              <p className="mt-1 text-sm font-semibold text-inverse">{ACHIEVEMENTS[id]?.title}</p>
              <p className="text-xs text-inverse/60">{ACHIEVEMENTS[id]?.description}</p>
            </div>
          </div>
        ))}

        <Button variant="onDark" size="xl" className="mt-8 w-full" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
