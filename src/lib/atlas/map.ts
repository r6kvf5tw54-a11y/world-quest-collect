/**
 * Map geometry for the Atlas game board.
 * Percentage coordinates (0-100) inside each map surface.
 */

export type MapPoint = { x: number; y: number; area: string };

/** Where each experience sits on the Paris city map. */
export const CITY_POINTS: Record<string, MapPoint> = {
  louvre: { x: 46, y: 52, area: "1st arr. · Rive Droite" },
  coffee: { x: 70, y: 34, area: "9th / 11th / 16th arr." },
};

/** Where each stop sits inside its experience map. */
export const STOP_POINTS: Record<string, MapPoint> = {
  // Louvre floor plan — Denon & Sully wings
  "mona-lisa": { x: 55, y: 63, area: "Denon · Salle des États" },
  cana: { x: 63, y: 66, area: "Denon · Salle des États" },
  liberty: { x: 44, y: 72, area: "Denon · Room 700" },
  coronation: { x: 36, y: 66, area: "Denon · Room 702" },
  venus: { x: 76, y: 46, area: "Sully · Room 346" },
  // Paris coffee route
  substance: { x: 20, y: 58, area: "16th arr. · rue de Chaillot" },
  motors: { x: 74, y: 66, area: "11th arr. · rue Saint-Sabin" },
  kb: { x: 52, y: 22, area: "9th arr. · avenue Trudaine" },
};

export function stopPoint(stopId: string): MapPoint {
  return STOP_POINTS[stopId] ?? { x: 50, y: 50, area: "" };
}

export function cityPoint(experienceId: string): MapPoint {
  return CITY_POINTS[experienceId] ?? { x: 50, y: 50, area: "" };
}
