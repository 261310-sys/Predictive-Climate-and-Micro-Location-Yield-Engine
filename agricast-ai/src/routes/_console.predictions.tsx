import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CloudLightning, CloudSun, Flame, SlidersHorizontal, Sun, TrendingUp, Wheat } from "lucide-react";
import { useAgriData } from "@/lib/selection-context";
import { computeMetrics, riskOutlook, yieldSeries } from "@/lib/agri-model";
import { chartTooltipStyle, legendProps, DataNote, Gauge, PageHeader, Panel, RiskBadge } from "@/components/app/ui-bits";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_console/predictions")({
  head: () => ({
    meta: [
      { title: "AI Climate Prediction — AgriCast AI" },
      { name: "description", content: "Drought probability, unseasonal rainfall and heat-stress risk with expected crop yield and what-if scenarios." },
      { property: "og:title", content: "AI Climate Prediction — AgriCast AI" },
      { property: "og:description", content: "Climate hazard probabilities and yield forecast for your field." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PredictionsPage,
});

const SERIES = [
  { key: "drought", label: "Drought", color: "var(--chart-4)" },
  { key: "unseasonal", label: "Unseasonal rain", color: "var(--chart-3)" },
  { key: "heat", label: "Heat stress", color: "var(--chart-5)" },
  { key: "excessRain", label: "Excess rain", color: "var(--chart-1)" },
] as const;

function PredictionsPage() {
  const { selection, district, village, crop, metrics: m } = useAgriData();
  const outlook = useMemo(() => riskOutlook(selection), [selection]);
  const yields = useMemo(() => yieldSeries(selection), [selection]);
  const [visible, setVisible] = useState<Record<string, boolean>>({ drought: true, unseasonal: true, heat: true, excessRain: false });
  const [rainShift, setRainShift] = useState(0);
  const [tempShift, setTempShift] = useState(0);

  const scenario = useMemo(
    () =>
      computeMetrics(
        { ...district, annualRain: district.annualRain * (1 + rainShift / 100), baseTemp: district.baseTemp + tempShift },
        village,
        crop,
      ),
    [district, village, crop, rainShift, tempShift],
  );
  const scenarioChanged = rainShift !== 0 || tempShift !== 0;
  const yieldDelta = Math.round(((scenario.expectedYield - m.expectedYield) / m.expectedYield) * 1000) / 10;

  const cards = [
    { label: "Drought probability", v: m.droughtProb, icon: Sun },
    { label: "Unseasonal rainfall risk", v: m.unseasonalRainRisk, icon: CloudLightning },
    { label: "Heat stress risk", v: m.heatStressRisk, icon: Flame },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI climate prediction"
        title="Hazard & yield forecast"
        description={`Simulated predictive model output for ${crop.name} in ${village.name}, ${district.name}.`}
        actions={<RiskBadge level={m.riskLevel} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Panel key={c.label} className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-semibold"><c.icon className="h-4 w-4 text-primary" /> {c.label}</div>
            <div className="mt-3"><Gauge value={c.v} size={190} label="probability %" /></div>
          </Panel>
        ))}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-forest p-5 text-forest-foreground shadow-elevated">
          <div className="flex items-center gap-2 text-sm font-semibold"><Wheat className="h-4 w-4 text-leaf" /> Expected crop yield</div>
          <div>
            <div className="font-display text-5xl font-bold tabular">{m.expectedYield}</div>
            <div className="text-sm text-forest-foreground/70">tonnes / hectare</div>
          </div>
          <div className="rounded-xl bg-forest-foreground/10 p-3 text-xs">
            <span className={cn("font-mono font-semibold", m.yieldChange >= 0 ? "text-leaf" : "text-risk-moderate")}>
              {m.yieldChange > 0 ? "+" : ""}{m.yieldChange}%
            </span>{" "}
            vs local normal of {m.normalYield} t/ha
          </div>
        </div>
      </div>

      <Panel
        title="6-month risk outlook"
        subtitle="Toggle hazards to compare"
        icon={CloudSun}
        action={
          <div className="flex flex-wrap justify-end gap-1.5">
            {SERIES.map((s) => (
              <Button
                key={s.key}
                size="sm"
                variant={visible[s.key] ? "secondary" : "ghost"}
                onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
                aria-pressed={visible[s.key]}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.label}
              </Button>
            ))}
          </div>
        }
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={outlook} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...chartTooltipStyle} />
              {SERIES.filter((s) => visible[s.key]).map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title="Yield history & forecast" subtitle="Simulated past seasons with 2026 forecast band" icon={TrendingUp} className="xl:col-span-3">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={yields} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip {...chartTooltipStyle} />
                <Legend {...legendProps} />
                <Area dataKey="band" name="Forecast range" stroke="none" fill="var(--accent)" fillOpacity={0.8} />
                <Line type="monotone" dataKey="actual" name="Past yield (t/ha)" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="forecast" name="Forecast (t/ha)" stroke="var(--primary-glow)" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="What-if scenario" subtitle="Stress-test the forecast" icon={SlidersHorizontal} className="xl:col-span-2">
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="font-medium">Rainfall change</span><span className="font-mono font-semibold tabular">{rainShift > 0 ? "+" : ""}{rainShift}%</span></div>
              <Slider value={[rainShift]} onValueChange={([v]) => setRainShift(v ?? 0)} min={-50} max={50} step={5} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="font-medium">Temperature change</span><span className="font-mono font-semibold tabular">{tempShift > 0 ? "+" : ""}{tempShift}°C</span></div>
              <Slider value={[tempShift]} onValueChange={([v]) => setTempShift(v ?? 0)} min={-2} max={4} step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ScenarioStat label="Yield" value={`${scenario.expectedYield} t/ha`} delta={scenarioChanged ? `${yieldDelta > 0 ? "+" : ""}${yieldDelta}%` : "baseline"} good={yieldDelta >= 0} />
              <ScenarioStat label="Climate risk" value={`${scenario.climateRisk}/100`} delta={scenarioChanged ? `${scenario.climateRisk - m.climateRisk > 0 ? "+" : ""}${scenario.climateRisk - m.climateRisk} pts` : "baseline"} good={scenario.climateRisk <= m.climateRisk} />
              <ScenarioStat label="Drought" value={`${scenario.droughtProb}%`} delta={scenarioChanged ? `${scenario.droughtProb - m.droughtProb > 0 ? "+" : ""}${scenario.droughtProb - m.droughtProb}` : "baseline"} good={scenario.droughtProb <= m.droughtProb} />
              <ScenarioStat label="Heat stress" value={`${scenario.heatStressRisk}%`} delta={scenarioChanged ? `${scenario.heatStressRisk - m.heatStressRisk > 0 ? "+" : ""}${scenario.heatStressRisk - m.heatStressRisk}` : "baseline"} good={scenario.heatStressRisk <= m.heatStressRisk} />
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setRainShift(0); setTempShift(0); }} disabled={!scenarioChanged}>
              Reset scenario
            </Button>
          </div>
        </Panel>
      </div>

      <DataNote>
        Predictions are generated by a transparent rule-based simulation, not a trained ML model. The engine is structured so a model
        trained on IMD rainfall, ERA5 temperature and district yield statistics (DES, Ministry of Agriculture) can replace it.
      </DataNote>
    </div>
  );
}

function ScenarioStat({ label, value, delta, good }: { label: string; value: string; delta: string; good: boolean }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold tabular">{value}</div>
      <div className={cn("font-mono text-[11px] font-semibold", delta === "baseline" ? "text-muted-foreground" : good ? "text-risk-low" : "text-risk-severe")}>{delta}</div>
    </div>
  );
}
