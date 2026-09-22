import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Camera, Check, Crosshair, Footprints, Navigation, Radar } from "lucide-react";
import { GeoMap } from "@/components/atlas/GeoMap";
import type { LiveMarker } from "@/components/atlas/LiveMap";
import { CameraCapture } from "@/components/atlas/CameraCapture";
import { CheckInOverlay } from "@/components/atlas/CheckInOverlay";
import { Button } from "@/components/ui/button";
import { EXPERIENCES, getExperience, type Stop } from "@/lib/atlas/data";
import { distanceMeters, formatDistance, stopGeo, venueGeo } from "@/lib/atlas/geo";
import { useGeo } from "@/lib/atlas/useGeo";
import { checkIn, useAtlas, type CheckInResult } from "@/lib/atlas/store";

type Target = {
  stop: Stop;
  experienceId: string;
  lat: number;
  lng: number;
  radius: number;
  area: string;
  distance: number | null;
  collected: boolean;
  inRange: boolean;
};

/** The live geo game board: your GPS position, geo-fenced stops, proximity check-in. */
export function GeoRadar({ experienceId }: { experienceId?: string }) {
  const state = useAtlas();
  const navigate = useNavigate();
  const geo = useGeo();
  const [openId, setOpenId] = useState<string | null>(null);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [cameraFor, setCameraFor] = useState<Target | null>(null);

  const experiences = experienceId ? [getExperience(experienceId)].filter(Boolean) : EXPERIENCES;
  const anchor = venueGeo(experienceId ?? EXPERIENCES[0]!.id);

  const targets = useMemo<Target[]>(() => {
    const list: Target[] = [];
    experiences.forEach((exp) => {
      if (!exp) return;
      const done = state.progress[exp.id]?.completedStops ?? [];
      exp.stops.forEach((stop) => {
        const g = stopGeo(stop.id);
        const distance = geo.position ? distanceMeters(geo.position, g) : null;
        list.push({
          stop,
          experienceId: exp.id,
          lat: g.lat,
          lng: g.lng,
          radius: g.radius,
          area: g.area,
          distance,
          collected: done.includes(stop.id),
          inRange: distance !== null && distance <= g.radius,
        });
      });
    });
    return list.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
  }, [experiences, state.progress, geo.position]);

  const selected = targets.find((t) => t.stop.id === openId) ?? targets[0];

  const markers: LiveMarker[] = targets.map((t, i) => ({
    id: t.stop.id,
    label: t.collected ? "✓" : String(i + 1),
    title: `${t.stop.title} — ${t.area}`,
    lat: t.lat,
    lng: t.lng,
    radius: t.radius,
    state: t.collected ? "collected" : t.inRange ? "inRange" : "locked",
  }));

  function handleCheckIn(t: Target, photo?: string) {
    setCameraFor(null);
    setResult(checkIn(t.experienceId, t.stop.id, photo));
  }

  const statusLabel =
    geo.status === "live"
      ? `GPS live · ±${geo.accuracy} m`
      : geo.status === "locating"
        ? "Finding you…"
        : geo.status === "denied"
          ? "Location blocked"
          : geo.status === "simulated"
            ? "Demo walk mode"
            : geo.status === "unsupported"
              ? "No GPS on this device"
              : "Location off";

  return (
    <>
      {result && selected ? (
        <CheckInOverlay
          result={result}
          onContinue={() => {
            const target = selected;
            setResult(null);
            navigate({
              to: "/experience/$experienceId/run",
              params: { experienceId: target.experienceId },
              search: { stop: target.stop.id },
            });
          }}
        />
      ) : null}

      {cameraFor ? (
        <CameraCapture
          title={cameraFor.stop.title}
          subtitle="Point the camera at it and take a photo to collect it."
          hint={cameraFor.stop.image}
          onCapture={(photo) => handleCheckIn(cameraFor, photo)}
          onCancel={() => setCameraFor(null)}
        />
      ) : null}

      <div className="px-5">
        <GeoMap
          className="h-[380px]"
          center={geo.position ?? anchor}
          zoom={anchor.zoom}
          user={geo.position}
          accuracy={geo.accuracy}
          markers={markers}
          selectedId={selected?.stop.id}
          onSelect={(id) => setOpenId(id)}
          follow={!openId}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground">
            <Radar className="h-3.5 w-3.5 text-accent" /> {statusLabel}
          </span>
          <button
            onClick={geo.requestLive}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground active:scale-95"
          >
            <Crosshair className="h-3.5 w-3.5" /> Use my GPS
          </button>
          {selected ? (
            <button
              onClick={() => geo.walkTo({ lat: selected.lat, lng: selected.lng })}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground active:scale-95"
            >
              <Footprints className="h-3.5 w-3.5" /> Demo: walk there
            </button>
          ) : null}
        </div>

        {geo.status === "denied" ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Location is blocked in your browser. Allow it to play for real, or use demo walk mode to
            test the loop from here.
          </p>
        ) : null}

        {selected ? (
          <div className="card-soft mt-4 p-4">
            <div className="flex items-start gap-3">
              <img
                src={selected.stop.image}
                alt={selected.stop.title}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {selected.area || selected.stop.venue}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {selected.stop.title}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5 text-accent" />
                  {selected.distance === null
                    ? "Turn on location to measure"
                    : `${formatDistance(selected.distance)} away · fence ${selected.radius} m`}
                </p>
              </div>
              {selected.collected ? (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-4 w-4" />
                </span>
              ) : null}
            </div>

            {selected.inRange ? (
              <Button
                variant="accent"
                size="xl"
                className="mt-4 w-full"
                onClick={() => setCameraFor(selected)}
              >
                <Camera className="h-4 w-4" />
                {selected.collected ? "Check in again" : "CHECK IN WITH CAMERA"}
              </Button>
            ) : (
              <Button variant="hero" size="xl" className="mt-4 w-full" disabled>
                {selected.distance === null
                  ? "Location needed to check in"
                  : `Get within ${selected.radius} m — ${formatDistance(selected.distance)} to go`}
              </Button>
            )}

            <Link
              to="/experience/$experienceId"
              params={{ experienceId: selected.experienceId }}
              className="mt-3 block text-center text-xs font-semibold text-muted-foreground"
            >
              About this experience
            </Link>
          </div>
        ) : null}

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          Nearby stops
        </p>
        <ul className="mt-2 space-y-2 pb-4">
          {targets.map((t) => (
            <li key={t.stop.id}>
              <button
                onClick={() => setOpenId(t.stop.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${
                  t.stop.id === selected?.stop.id
                    ? "border-accent bg-surface"
                    : "border-border bg-background"
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                    t.collected
                      ? "bg-accent text-accent-foreground"
                      : t.inRange
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground"
                  }`}
                >
                  {t.collected ? "✓" : t.inRange ? "!" : "·"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {t.stop.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t.stop.venue} · {t.area}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {t.distance === null ? "—" : formatDistance(t.distance)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
