import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/atlas/geo";

export type LiveMarker = {
  id: string;
  label: string;
  title: string;
  lat: number;
  lng: number;
  radius: number;
  state: "collected" | "inRange" | "locked";
};

export type LiveMapProps = {
  center: GeoPoint;
  zoom: number;
  user: GeoPoint | null;
  accuracy: number;
  markers: LiveMarker[];
  selectedId?: string | undefined;
  onSelect?: ((id: string) => void) | undefined;
  follow?: boolean | undefined;
  /** When set, the view fits the player and the selected marker together (re-fits when it changes). */
  fitKey?: string | undefined;
};

const TONE: Record<LiveMarker["state"], { bg: string; fg: string; ring: string }> = {
  collected: { bg: "var(--accent)", fg: "var(--accent-foreground)", ring: "var(--accent)" },
  inRange: { bg: "var(--primary)", fg: "var(--primary-foreground)", ring: "var(--accent)" },
  locked: { bg: "var(--background)", fg: "var(--muted-foreground)", ring: "var(--border)" },
};

/** Leaflet map with the player's real position and geo-fenced stop pins. */
export default function LiveMap({
  center,
  zoom,
  user,
  accuracy,
  markers,
  selectedId,
  onSelect,
  follow = true,
  fitKey,
}: LiveMapProps) {
  const holder = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const userLayer = useRef<L.LayerGroup | null>(null);
  const centred = useRef(false);
  const lastFit = useRef<string | undefined>(undefined);

  // Create the map once.
  useEffect(() => {
    if (!holder.current || map.current) return;
    const m = L.map(holder.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    userLayer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop pins + their check-in radius circles.
  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    markers.forEach((mk) => {
      const tone = TONE[mk.state];
      L.circle([mk.lat, mk.lng], {
        radius: mk.radius,
        color: tone.ring,
        weight: mk.id === selectedId ? 2 : 1,
        opacity: mk.state === "locked" ? 0.35 : 0.7,
        fillColor: tone.ring,
        fillOpacity: mk.state === "locked" ? 0.06 : 0.14,
      }).addTo(g);

      const icon = L.divIcon({
        className: "",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        html: `<div style="width:34px;height:34px;border-radius:999px;display:grid;place-items:center;
          font:600 13px/1 var(--font-sans,system-ui);background:${tone.bg};color:${tone.fg};
          border:1px solid ${tone.ring};box-shadow:0 6px 16px rgba(24,20,16,.22);
          outline:${mk.id === selectedId ? `4px solid color-mix(in oklab, var(--accent) 35%, transparent)` : "none"}">
          ${mk.label}</div>`,
      });
      L.marker([mk.lat, mk.lng], { icon, title: mk.title })
        .addTo(g)
        .on("click", () => onSelect?.(mk.id));
    });
  }, [markers, selectedId, onSelect]);

  // Player marker + GPS accuracy halo.
  useEffect(() => {
    const g = userLayer.current;
    if (!g) return;
    g.clearLayers();
    if (!user) return;
    L.circle([user.lat, user.lng], {
      radius: Math.max(accuracy, 8),
      color: "var(--primary)",
      weight: 1,
      opacity: 0.4,
      fillColor: "var(--primary)",
      fillOpacity: 0.12,
    }).addTo(g);
    const icon = L.divIcon({
      className: "",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html: `<div style="width:18px;height:18px;border-radius:999px;background:var(--primary);
        border:3px solid var(--background);box-shadow:0 0 0 6px color-mix(in oklab, var(--primary) 22%, transparent)"></div>`,
    });
    L.marker([user.lat, user.lng], { icon, title: "You", zIndexOffset: 500 }).addTo(g);

    if (follow && map.current) {
      const target = fitKey ? markers.find((mk) => mk.id === selectedId) : undefined;
      if (target && lastFit.current !== fitKey) {
        lastFit.current = fitKey;
        centred.current = true;
        map.current.fitBounds(
          L.latLngBounds([user.lat, user.lng], [target.lat, target.lng]).pad(0.35),
          { animate: true, maxZoom: 19 },
        );
      } else if (!centred.current) {
        map.current.setView([user.lat, user.lng], zoom);
        centred.current = true;
      } else {
        map.current.panTo([user.lat, user.lng], { animate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accuracy, follow, zoom, fitKey]);

  return <div ref={holder} className="h-full w-full" />;
}
