import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPinned } from "lucide-react";
import type { LeafletMapProps } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

function Fallback({ className }: { className?: string | undefined }) {
  return (
    <div className={className}>
      <div className="flex h-full w-full items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
        <MapPinned className="h-4 w-4 animate-pulse" /> Loading map…
      </div>
    </div>
  );
}

export function ClientMap(props: LeafletMapProps) {
  return (
    <ClientOnly fallback={<Fallback className={props.className} />}>
      <Suspense fallback={<Fallback className={props.className} />}>
        <LeafletMap {...props} className={`isolate ${props.className ?? ""}`} />
      </Suspense>
    </ClientOnly>
  );
}

/** Brown → yellow → green NDVI ramp (data-visualisation scale). */
export function ndviColor(v: number) {
  const t = Math.max(0, Math.min(1, (v - 0.1) / 0.75));
  const hue = 45 + t * 100;
  const light = 0.62 - t * 0.12;
  const chroma = 0.13 + t * 0.04;
  return `oklch(${light.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
}
