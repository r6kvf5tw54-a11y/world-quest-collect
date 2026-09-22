import { useCallback, useEffect, useRef, useState } from "react";
import { stepTowards, type GeoPoint } from "./geo";

export type GeoStatus = "idle" | "locating" | "live" | "denied" | "unsupported" | "simulated";

export type GeoState = {
  position: GeoPoint | null;
  accuracy: number;
  status: GeoStatus;
  /** True when the position comes from the demo walker, not the device. */
  simulated: boolean;
};

const SIM_KEY = "atlas-sim-position";
const WALK_SPEED = 14; // meters per tick (~1.4 m/s real walking, sped up)

function readSim(): GeoPoint | null {
  try {
    const raw = localStorage.getItem(SIM_KEY);
    return raw ? (JSON.parse(raw) as GeoPoint) : null;
  } catch {
    return null;
  }
}

/**
 * Live device location with a demo walker fallback, so the geo loop can be
 * played on a desktop or with location permission denied.
 */
export function useGeo() {
  const [state, setState] = useState<GeoState>({
    position: null,
    accuracy: 0,
    status: "idle",
    simulated: false,
  });
  const watchRef = useRef<number | null>(null);
  const walkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef<GeoPoint | null>(null);

  const stopWatch = useCallback(() => {
    if (watchRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  const stopWalk = useCallback(() => {
    if (walkRef.current) {
      clearInterval(walkRef.current);
      walkRef.current = null;
    }
    targetRef.current = null;
  }, []);

  /** Put the player at a fixed point (demo mode). */
  const setSimulated = useCallback(
    (point: GeoPoint) => {
      stopWatch();
      stopWalk();
      try {
        localStorage.setItem(SIM_KEY, JSON.stringify(point));
      } catch {
        /* ignore */
      }
      setState({ position: point, accuracy: 12, status: "simulated", simulated: true });
    },
    [stopWatch, stopWalk],
  );

  /** Animate the player walking towards a point (demo mode). */
  const walkTo = useCallback(
    (target: GeoPoint) => {
      stopWatch();
      stopWalk();
      targetRef.current = target;
      walkRef.current = setInterval(() => {
        setState((prev) => {
          const from = prev.position ?? target;
          const next = stepTowards(from, target, WALK_SPEED);
          if (next.lat === target.lat && next.lng === target.lng) stopWalk();
          try {
            localStorage.setItem(SIM_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return { position: next, accuracy: 10, status: "simulated", simulated: true };
        });
      }, 400);
    },
    [stopWatch, stopWalk],
  );

  /** Ask the device for real GPS and keep following it. */
  const requestLive = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((p) => ({ ...p, status: "unsupported" }));
      return;
    }
    stopWalk();
    setState((p) => ({ ...p, status: "locating" }));
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracy: Math.round(pos.coords.accuracy),
          status: "live",
          simulated: false,
        }),
      () => setState((p) => ({ ...p, status: "denied" })),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, [stopWalk]);

  // Restore a previous demo position on mount so progress feels continuous.
  useEffect(() => {
    const saved = readSim();
    if (saved) {
      setState({ position: saved, accuracy: 12, status: "simulated", simulated: true });
    }
    return () => {
      stopWatch();
      stopWalk();
    };
  }, [stopWatch, stopWalk]);

  return { ...state, requestLive, setSimulated, walkTo };
}
