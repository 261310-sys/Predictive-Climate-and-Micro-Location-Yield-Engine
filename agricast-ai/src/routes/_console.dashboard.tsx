import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, CloudRain, Droplets, FlaskRound, Gauge as GaugeIcon, HeartPulse, Sprout, Thermometer, Waves, Wheat, CalendarDays, Lightbulb } from "lucide-react";
import { useAgriData } from "@/lib/selection-context";
import { cropComparison, forecast14, monthlyClimate } from "@/lib/agri-model";
import { buildRecommendations } from "@/lib/advice";
import { chartTooltipStyle, legendProps, Gauge, PageHeader, PriorityPill, Panel, RiskBadge, RiskBar, riskColorVar, StatCard } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_console/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AgriCast AI" },
      { name: "description", content: "Temperature, rainfall, soil, crop health, expected yield and climate risk for your selected village and crop." },
      { property: "og:title", content: "Dashboard — AgriCast AI" },
      { property: "og:description", content: "Village-level climate and crop health overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { selection, state, district, village, crop, metrics: m } = useAgriData();
  const monthly = useMemo(() => monthlyClimate(selection), [selection]);
  const fc = useMemo(() => forecast14(selection), [selection]);
  const compare = useMemo(() => cropComparison(selection), [selection]);
  const recs = useMemo(() => buildRecommendations(m, crop, district).slice(0, 3), [m, crop, district]);
  const unit = "t/ha";

  const healthData = [
    { name: "pH fit", value: m.scores.ph, fill: "var(--chart-3)" },
    { name: "Water fit", value: m.scores.water, fill: "var(--chart-2)" },
    { name: "Temp fit", value: m.scores.temperature, fill: "var(--chart-1)" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Main dashboard"
        title={`${village.name}, ${district.name}`}
        description={`${state.name} · ${crop.name} (${crop.season}) · ${district.soilType} soil · ${Math.round(district.irrigation * 100)}% irrigated area`}
        actions={
          <>
            <RiskBadge level={m.riskLevel} />
            <Button asChild variant="outline" size="sm">
              <Link to="/report">Generate report</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Temperature" value={m.temperature} unit="°C" icon={Thermometer} hint={`Optimal ${crop.optTemp[0]}–${crop.optTemp[1]}°C for ${crop.name.split(" (")[0]}`} progress={{ value: (m.temperature / 45) * 100, color: "var(--chart-5)" }} />
        <StatCard label="Rainfall (30d)" value={m.rainfall30d} unit="mm" icon={CloudRain} hint={<span>Season <b className={m.rainfallDeviation < 0 ? "text-risk-high" : "text-risk-low"}>{m.rainfallDeviation > 0 ? "+" : ""}{m.rainfallDeviation}%</b> vs normal</span>} progress={{ value: Math.min(100, m.rainfall30d / 2.5), color: "var(--chart-3)" }} />
        <StatCard label="Humidity" value={m.humidity} unit="%" icon={Droplets} hint="Relative humidity" progress={{ value: m.humidity, color: "var(--chart-3)" }} />
        <StatCard label="Soil moisture" value={m.soilMoisture} unit="% VWC" icon={Waves} hint={m.soilMoisture < 22 ? "Below target — irrigation advised" : "Within working range"} progress={{ value: (m.soilMoisture / 45) * 100, color: "var(--chart-2)" }} />
        <StatCard label="Soil pH" value={m.soilPh} icon={FlaskRound} hint={`Ideal ${crop.optPh[0]}–${crop.optPh[1]}`} progress={{ value: (m.soilPh / 14) * 100, color: "var(--chart-4)" }} />
        <StatCard label="Crop health index" value={m.cropHealth} unit="/100" icon={HeartPulse} hint={`NDVI ${m.ndvi}`} progress={{ value: m.cropHealth, color: "var(--primary-glow)" }} />
        <StatCard tone="forest" label="Expected yield" value={m.expectedYield} unit={unit} icon={Wheat} hint={`${m.yieldChange > 0 ? "+" : ""}${m.yieldChange}% vs local normal ${m.normalYield} ${unit}`} />
        <StatCard label="Climate risk score" value={m.climateRisk} unit="/100" icon={GaugeIcon} hint={<RiskBadge level={m.riskLevel} />} progress={{ value: m.climateRisk, color: riskColorVar(m.climateRisk) }} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Seasonal climate profile" subtitle="Monthly rainfall vs normal, with temperature" icon={CalendarDays} className="xl:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="r" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="t" orientation="right" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="°" />
                <Tooltip {...chartTooltipStyle} />
                <Legend {...legendProps} />
                <Bar yAxisId="r" dataKey="normalRain" name="Normal rain (mm)" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="r" dataKey="rain" name="This season (mm)" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Line yAxisId="t" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="var(--chart-5)" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Climate risk score" subtitle="Weighted composite of four hazards" icon={GaugeIcon}>
          <Gauge value={m.climateRisk} label={`${m.riskLevel} risk`} size={220} />
          <div className="mt-6 space-y-3">
            <RiskBar label="Drought" value={m.droughtProb} />
            <RiskBar label="Excess rainfall" value={m.excessRainRisk} />
            <RiskBar label="Heat stress" value={m.heatStressRisk} />
            <RiskBar label="Unseasonal rain" value={m.unseasonalRainRisk} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="14-day outlook" subtitle="Simulated max/min temperature and rain" icon={Thermometer} className="xl:col-span-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fc} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="°" />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="max" name="Max °C" stroke="var(--chart-5)" fill="url(#gMax)" strokeWidth={2} />
                <Area type="monotone" dataKey="min" name="Min °C" stroke="var(--chart-2)" fill="url(#gMin)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {fc.map((d) => (
              <div key={d.day} className="min-w-[52px] rounded-lg bg-muted px-2 py-1.5 text-center">
                <div className="text-[10px] font-semibold text-muted-foreground">{d.day}</div>
                <CloudRain className={`mx-auto my-0.5 h-3.5 w-3.5 ${d.rain > 0 ? "text-chart-3" : "text-muted-foreground/40"}`} />
                <div className="font-mono text-[11px] font-semibold tabular">{d.rain}mm</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Crop health index" subtitle="Suitability factors driving the score" icon={HeartPulse}>
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="48%" outerRadius="100%" data={healthData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={8} />
                <Tooltip {...chartTooltipStyle} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold tabular">{m.cropHealth}</span>
              <span className="text-[11px] text-muted-foreground">health</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            {healthData.slice().reverse().map((h) => (
              <div key={h.name} className="rounded-lg bg-muted p-2">
                <span className="mx-auto mb-1 block h-1.5 w-6 rounded-full" style={{ background: h.fill }} />
                <div className="font-semibold tabular">{h.value}%</div>
                <div className="text-muted-foreground">{h.name}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title="Crop suitability at this location" subtitle="Health index vs climate risk for every modelled crop" icon={Sprout} className="xl:col-span-3">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compare} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="crop" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Legend {...legendProps} />
                <Bar dataKey="health" name="Health index" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="risk" name="Climate risk" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Priority actions"
          subtitle="From the farming assistant"
          icon={Lightbulb}
          className="xl:col-span-2"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/assistant">
                All <ArrowRight />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {recs.map((r) => (
              <li key={r.title} className="rounded-xl border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-primary-glow">{r.category}</span>
                  <PriorityPill p={r.priority} />
                </div>
                <p className="mt-1 text-sm font-semibold">{r.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
