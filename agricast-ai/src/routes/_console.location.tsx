import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CloudRain, Droplets, Map as MapIcon, MapPin, Mountain, Sun, Thermometer, Waves } from "lucide-react";
import { useAgriData, useSelection } from "@/lib/selection-context";
import { allLocationsRisk, monthlyClimate } from "@/lib/agri-model";
import { ClientMap } from "@/components/map/ClientMap";
import { LocationCropBar } from "@/components/app/LocationCropBar";
import { chartTooltipStyle, DataNote, Gauge, PageHeader, Panel, RiskBadge, riskColorVar } from "@/components/app/ui-bits";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const Route = createFileRoute("/_console/location")({
  head: () => ({
    meta: [
      { title: "Location Intelligence — AgriCast AI" },
      { name: "description", content: "Select Indian states, districts and villages on a map and compare drought and excess-rainfall risk." },
      { property: "og:title", content: "Location Intelligence — AgriCast AI" },
      { property: "og:description", content: "Village-level climate risk map for Indian agriculture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LocationPage,
});

type Layer = "climateRisk" | "droughtProb" | "excessRainRisk";
const LAYER_LABEL: Record<Layer, string> = { climateRisk: "Overall risk", droughtProb: "Drought", excessRainRisk: "Excess rain" };

function levelVar(v: number) {
  return v < 30 ? "--risk-low" : v < 50 ? "--risk-moderate" : v < 70 ? "--risk-high" : "--risk-severe";
}

function LocationPage() {
  const { selection, setLocation } = useSelection();
  const { state, district, village, crop, metrics: m } = useAgriData();
  const [layer, setLayer] = useState<Layer>("climateRisk");
  const [basemap, setBasemap] = useState<"street" | "satellite">("street");
  const all = useMemo(() => allLocationsRisk(selection.cropId), [selection.cropId]);
  const monthly = useMemo(() => monthlyClimate(selection), [selection]);

  const markers = useMemo(
    () =>
      all.map((p) => ({
        id: `${p.stateId}|${p.districtId}|${p.villageId}`,
        lat: p.lat,
        lng: p.lng,
        label: `${p.villageName}, ${p.districtName} — ${LAYER_LABEL[layer]} ${p[layer]}%`,
        colorVar: levelVar(p[layer]),
        selected: p.villageId === village.id,
      })),
    [all, layer, village.id],
  );

  const stateRows = all.filter((p) => p.stateId === state.id);
  const center = useMemo<[number, number]>(() => [village.lat, village.lng], [village.lat, village.lng]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Location intelligence"
        title="Micro-location climate map"
        description="Select a state, district and village — or click any point on the map — to load its local climate conditions."
      />

      <div className="rounded-2xl border bg-card p-4 shadow-soft lg:hidden">
        <LocationCropBar compact />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel
          title="Agricultural locations"
          subtitle={`${all.length} demo villages · coloured by ${LAYER_LABEL[layer].toLowerCase()} for ${crop.name}`}
          icon={MapIcon}
          action={
            <ToggleGroup type="single" size="sm" value={basemap} onValueChange={(v) => v && setBasemap(v as typeof basemap)} variant="outline">
              <ToggleGroupItem value="street">Map</ToggleGroupItem>
              <ToggleGroupItem value="satellite">Imagery</ToggleGroupItem>
            </ToggleGroup>
          }
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <ToggleGroup type="single" size="sm" value={layer} onValueChange={(v) => v && setLayer(v as Layer)} variant="outline">
              {(Object.keys(LAYER_LABEL) as Layer[]).map((k) => (
                <ToggleGroupItem key={k} value={k}>{LAYER_LABEL[k]}</ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {[
                ["Low", "bg-risk-low"],
                ["Moderate", "bg-risk-moderate"],
                ["High", "bg-risk-high"],
                ["Severe", "bg-risk-severe"],
              ].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${c}`} />{l}</span>
              ))}
            </div>
          </div>
          <ClientMap
            center={center}
            zoom={7}
            basemap={basemap}
            markers={markers}
            onMarkerClick={(id) => {
              const [s = "", d = "", v = ""] = id.split("|");
              setLocation(s, d, v);
            }}
            className="h-[520px] w-full overflow-hidden rounded-xl"
          />
        </Panel>

        <div className="space-y-6">
          <Panel title={village.name} subtitle={`${district.name}, ${state.name} · ${village.lat.toFixed(2)}°N ${village.lng.toFixed(2)}°E`} icon={MapPin} action={<RiskBadge level={m.riskLevel} />}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { i: Thermometer, l: "Temperature", v: `${m.temperature}°C` },
                { i: CloudRain, l: "Rain (30d)", v: `${m.rainfall30d} mm` },
                { i: Droplets, l: "Humidity", v: `${m.humidity}%` },
                { i: Waves, l: "Soil moisture", v: `${m.soilMoisture}%` },
                { i: Sun, l: "Annual normal", v: `${district.annualRain} mm` },
                { i: Mountain, l: "Soil type", v: district.soilType },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-muted p-3">
                  <s.i className="h-4 w-4 text-primary" />
                  <div className="mt-1.5 text-[11px] text-muted-foreground">{s.l}</div>
                  <div className="text-sm font-semibold tabular">{s.v}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Water extremes" subtitle="For the selected crop">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Gauge value={m.droughtProb} size={150} label="Drought" />
              </div>
              <div>
                <Gauge value={m.excessRainRisk} size={150} label="Excess rainfall" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Seasonal rainfall is <b className="text-foreground">{m.rainfallDeviation > 0 ? "+" : ""}{m.rainfallDeviation}%</b> versus the {district.name} normal, with {Math.round(district.irrigation * 100)}% of area irrigated.
            </p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Monthly rainfall" subtitle={`${village.name} — simulated season vs normal`} icon={CloudRain}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="normalRain" name="Normal (mm)" fill="var(--accent)" radius={[5, 5, 0, 0]} />
                <Bar dataKey="rain" name="This season (mm)" fill="var(--chart-3)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={`Villages in ${state.name}`} subtitle="Click a row to switch location">
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Village</th>
                  <th className="px-3 py-2 text-right font-semibold">Drought</th>
                  <th className="px-3 py-2 text-right font-semibold">Excess rain</th>
                  <th className="px-3 py-2 text-right font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {stateRows.map((r) => (
                  <tr
                    key={r.villageId}
                    onClick={() => setLocation(r.stateId, r.districtId, r.villageId)}
                    className={`cursor-pointer border-t transition-colors hover:bg-secondary ${r.villageId === village.id ? "bg-secondary" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.villageName}</div>
                      <div className="text-xs text-muted-foreground">{r.districtName}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular" style={{ color: riskColorVar(r.droughtProb) }}>{r.droughtProb}%</td>
                    <td className="px-3 py-2 text-right font-mono tabular" style={{ color: riskColorVar(r.excessRainRisk) }}>{r.excessRainRisk}%</td>
                    <td className="px-3 py-2 text-right"><RiskBadge level={r.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <DataNote>
        Map tiles are live OpenStreetMap / Esri reference basemaps. All climate values and risk scores are simulated from regional
        baselines — production builds would source them from IMD gridded data and Copernicus ERA5 reanalysis.
      </DataNote>
    </div>
  );
}

