import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  colorVar: string; // e.g. "--risk-low"
  selected?: boolean;
}

export interface MapCell {
  bounds: [[number, number], [number, number]];
  color: string;
  label: string;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  basemap?: "street" | "satellite";
  markers?: MapMarker[];
  cells?: MapCell[];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#2f7d4f";
}

export default function LeafletMap({ center, zoom, basemap = "street", markers = [], cells = [], onMarkerClick, className }: LeafletMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onMarkerClick);
  clickRef.current = onMarkerClick;

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView(center, zoom);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map.current) return;
    tiles.current?.remove();
    tiles.current =
      basemap === "satellite"
        ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 18,
            attribution: "Reference imagery © Esri, Maxar, Earthstar Geographics",
          })
        : L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: "© OpenStreetMap contributors",
          });
    tiles.current.addTo(map.current);
  }, [basemap]);

  useEffect(() => {
    map.current?.flyTo(center, zoom, { duration: 0.8 });
  }, [center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    for (const c of cells) {
      L.rectangle(c.bounds, { color: c.color, weight: 0.5, fillColor: c.color, fillOpacity: 0.55 })
        .bindTooltip(c.label, { sticky: true })
        .addTo(g);
    }
    for (const m of markers) {
      const color = cssVar(m.colorVar);
      if (m.selected) {
        L.circleMarker([m.lat, m.lng], { radius: 18, color, weight: 2, fillOpacity: 0.15, fillColor: color, interactive: false }).addTo(g);
      }
      L.circleMarker([m.lat, m.lng], {
        radius: m.selected ? 9 : 7,
        color: cssVar("--card"),
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      })
        .bindTooltip(m.label, { direction: "top", offset: [0, -6] })
        .on("click", () => clickRef.current?.(m.id))
        .addTo(g);
    }
  }, [markers, cells]);

  return <div ref={el} className={className} />;
}
