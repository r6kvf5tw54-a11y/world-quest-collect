import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { LiveMapProps } from "./LiveMap";

const LiveMap = lazy(() => import("./LiveMap"));

const Skeleton = (
  <div className="grid h-full w-full place-items-center bg-secondary text-xs text-muted-foreground">
    Loading map…
  </div>
);

/** Browser-only wrapper: Leaflet must never be imported during SSR. */
export function GeoMap(props: LiveMapProps & { className?: string }) {
  const { className = "", ...rest } = props;
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border bg-secondary shadow-frame ${className}`}
    >
      <ClientOnly fallback={Skeleton}>
        <Suspense fallback={Skeleton}>
          <LiveMap {...rest} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
