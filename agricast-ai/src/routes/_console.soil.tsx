import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { FlaskRound, Leaf, Layers, Satellite, Thermometer, Waves } from "lucide-react";
import { useAgriData } from "@/lib/selection-context";
import { ndviGrid, ndviLabel, ndviSeries, soilMoistureSeries } from "@/lib/agri-model";
import { ClientMap, ndviColor } from "@/components/map/ClientMap";
import { chartTooltipStyle, legendProps, DataNote, PageHeader, Panel, SimulatedBadge, StatCard } from "@/components/app/ui-bits";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/_console/soil")({
  head: () => ({
    meta: [
      { title: "Soil & Satellite Monitoring — AgriCast AI" },
      { name: "description", content: "Soil moisture, pH and temperature with a simulated NDVI vegetation-health layer over field imagery." },
      { property: "og:title", content: "Soil & Satellite Monitoring — AgriCast AI" },
      { property: "og:description", content: "Soil conditions and NDVI vegetation health for your field." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SoilPage,
});

function SoilPage() {
  const { selection, village, district, crop, metrics: m } = useAgriData();
  const [overlay, setOverlay] = useState(true);
  const [basemap, setBasemap] = useState<"satellite" | "street">("satellite");
  const [opacityThreshold, setOpacityThreshold] = useState(0);
  const sm = useMemo(() => soilMoistureSeries(selection), [selection]);
  const nd = useMemo(() => ndviSeries(selection), [selection]);
  const grid = useMemo(() => ndviGrid(selection), [selection]);

  const cells = useMemo(
    () =>
      overlay
        ? grid
            .filter((c) => c.ndvi >= opacityThreshold)
            .map((c) => ({ bounds: c.bounds, color: ndviColor(c.ndvi), label: `NDVI ${c.ndvi} · ${ndviLabel(c.ndvi)} (simulated)` }))
        : [],
    [grid, overlay, opacityThreshold],
  );
  const stressed = grid.filter((c) => c.ndvi < 0.4).length;
  const center = useMemo<[number, number]>(() => [village.lat, village.lng], [village.lat, village.lng]);
  const phPos = Math.min(100, Math.max(0, ((m.soilPh - 4) / 6) * 100));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Soil & satellite monitoring"
        title="Field conditions"
        description={`${village.name}, ${district.name} · ${district.soilType} soil · ${crop.name}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Soil moisture" value={m.soilMoisture} unit="% VWC" icon={Waves} hint="Target ≈ 28% at root zone" progress={{ value: (m.soilMoisture / 45) * 100, color: "var(--chart-3)" }} />
        <StatCard label="Soil pH" value={m.soilPh} icon={FlaskRound} hint={m.soilPh > 7.5 ? "Alkaline" : m.soilPh < 6.2 ? "Acidic" : "Near neutral"} progress={{ value: (m.soilPh / 14) * 100, color: "var(--chart-4)" }} />
        <StatCard label="Soil temperature" value={m.soilTemp} unit="°C" icon={Thermometer} hint="At 10 cm depth" progress={{ value: (m.soilTemp / 45) * 100, color: "var(--chart-5)" }} />
        <StatCard tone="forest" label="NDVI index" value={m.ndvi} icon={Leaf} hint={ndviLabel(m.ndvi)} />
      </div>

      <Panel
        title="Satellite view · NDVI vegetation health"
        subtitle={`${grid.length} field cells around ${village.name} · ${stressed} showing stress (NDVI < 0.4)`}
        icon={Satellite}
        action={<SimulatedBadge label="Simulated NDVI" />}
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
          <ClientMap center={center} zoom={14} basemap={basemap} cells={cells} markers={[{ id: "v", lat: village.lat, lng: village.lng, label: village.name, colorVar: "--leaf", selected: true }]} className="h-[480px] w-full overflow-hidden rounded-xl" />
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basemap</Label>
              <ToggleGroup type="single" size="sm" variant="outline" value={basemap} onValueChange={(v) => v && setBasemap(v as typeof basemap)} className="w-full">
                <ToggleGroupItem value="satellite" className="flex-1">Imagery</ToggleGroupItem>
                <ToggleGroupItem value="street" className="flex-1">Map</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted p-3">
              <Label htmlFor="ndvi" className="flex items-center gap-2 text-sm"><Layers className="h-4 w-4" /> NDVI overlay</Label>
              <Switch id="ndvi" checked={overlay} onCheckedChange={setOverlay} />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hide cells below NDVI {opacityThreshold.toFixed(2)}</Label>
              <Slider value={[opacityThreshold]} onValueChange={([v]) => setOpacityThreshold(v ?? 0)} min={0} max={0.8} step={0.05} disabled={!overlay} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">NDVI scale</p>
              <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, ${ndviColor(0.1)}, ${ndviColor(0.35)}, ${ndviColor(0.6)}, ${ndviColor(0.85)})` }} />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground"><span>0.1</span><span>0.4</span><span>0.6</span><span>0.85</span></div>
              <ul className="mt-3 space-y-1.5 text-xs">
                {[0.15, 0.3, 0.5, 0.75].map((v) => (
                  <li key={v} className="flex items-center gap-2"><span className="h-3 w-3 rounded" style={{ background: ndviColor(v) }} />{ndviLabel(v)}</li>
                ))}
              </ul>
            </div>
            <DataNote>Base imagery is a public reference basemap, not a live capture. NDVI cells are simulated — designed for Sentinel-2 (Copernicus) or ISRO Resourcesat feeds.</DataNote>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Soil moisture trend" subtitle="30-day history and 7-day projection" icon={Waves}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sm} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={5} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="%" domain={[0, 50]} />
                <Tooltip {...chartTooltipStyle} />
                <ReferenceLine y={28} stroke="var(--primary-glow)" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "var(--primary)", position: "insideTopRight" }} />
                <Area type="monotone" dataKey="moisture" name="Observed (sim.)" stroke="var(--chart-3)" fill="url(#gSm)" strokeWidth={2} connectNulls={false} />
                <Area type="monotone" dataKey="projected" name="Projected" stroke="var(--chart-3)" strokeDasharray="5 4" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Vegetation health curve" subtitle={`NDVI over the ${crop.name} crop cycle vs healthy reference`} icon={Leaf}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={nd} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip {...chartTooltipStyle} />
                <Legend {...legendProps} />
                <Line type="monotone" dataKey="healthyRef" name="Healthy reference" stroke="var(--muted-foreground)" strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="ndvi" name="Field NDVI" stroke="var(--primary-glow)" strokeWidth={3} dot={{ r: 3, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Soil pH profile" subtitle={`${crop.name} prefers pH ${crop.optPh[0]}–${crop.optPh[1]}`} icon={FlaskRound}>
        <div className="relative pt-6">
          <div className="h-4 rounded-full" style={{ background: "linear-gradient(90deg, var(--risk-severe), var(--risk-moderate), var(--risk-low), var(--chart-3), oklch(0.5 0.15 280))" }} />
          <div
            className="absolute top-6 h-4 rounded-full border-2 border-foreground/70"
            style={{ left: `${((crop.optPh[0] - 4) / 6) * 100}%`, width: `${((crop.optPh[1] - crop.optPh[0]) / 6) * 100}%` }}
          />
          <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${phPos}%` }}>
            <span className="rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[11px] font-semibold text-background">{m.soilPh}</span>
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>4 · acidic</span><span>7 · neutral</span><span>10 · alkaline</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
