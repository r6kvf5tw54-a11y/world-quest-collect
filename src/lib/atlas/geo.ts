/**
 * Real-world geo layer for Atlas.
 * Every stop has true latitude/longitude, so the app behaves like a
 * location game: you must physically be inside a stop's radius to check in.
 */

export type GeoPoint = { lat: number; lng: number };

export type GeoStop = GeoPoint & {
  /** Check-in radius in meters. */
  radius: number;
  area: string;
};

/** Venue anchors (used to centre the map). */
export const VENUE_GEO: Record<string, GeoPoint & { zoom: number }> = {
  louvre: { lat: 48.86055, lng: 2.33765, zoom: 18 },
  coffee: { lat: 48.8683, lng: 2.3372, zoom: 13 },
};

export const STOP_GEO: Record<string, GeoStop> = {
  // Musée du Louvre — indoor coordinates, tight radii
  "mona-lisa": { lat: 48.85985, lng: 2.33645, radius: 25, area: "Denon · Salle des États" },
  cana: { lat: 48.85978, lng: 2.33668, radius: 25, area: "Denon · Salle des États" },
  liberty: { lat: 48.86002, lng: 2.33452, radius: 30, area: "Denon · Room 700" },
  coronation: { lat: 48.86008, lng: 2.33408, radius: 30, area: "Denon · Room 702" },
  venus: { lat: 48.85982, lng: 2.33852, radius: 30, area: "Sully · Room 346" },
  // Paris coffee route — street level, wider radii
  substance: { lat: 48.86728, lng: 2.29962, radius: 60, area: "16th arr. · rue de Chaillot" },
  motors: { lat: 48.85601, lng: 2.36948, radius: 60, area: "11th arr. · rue Saint-Sabin" },
  kb: { lat: 48.88168, lng: 2.34372, radius: 60, area: "9th arr. · avenue Trudaine" },
};

export function stopGeo(stopId: string): GeoStop {
  return STOP_GEO[stopId] ?? { lat: 48.8606, lng: 2.3376, radius: 40, area: "" };
}

export function venueGeo(experienceId: string) {
  return VENUE_GEO[experienceId] ?? { lat: 48.8606, lng: 2.3376, zoom: 14 };
}

/** Great-circle distance in meters. */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}

/** Compass bearing from a to b, in degrees. */
export function bearing(a: GeoPoint, b: GeoPoint): number {
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Move `meters` from `from` towards `to`, never overshooting. */
export function stepTowards(from: GeoPoint, to: GeoPoint, meters: number): GeoPoint {
  const d = distanceMeters(from, to);
  if (d <= meters || d === 0) return { ...to };
  const t = meters / d;
  return { lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t };
}
