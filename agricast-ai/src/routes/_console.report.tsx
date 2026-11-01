import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAgriData } from "@/lib/selection-context";
import { buildRecommendations } from "@/lib/advice";
import { downloadRiskReport } from "@/lib/report-pdf";
import { LogoMark } from "@/components/brand/Logo";
import { PageHeader, Panel, PriorityPill, RiskBadge, RiskBar, SimulatedBadge } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_console/report")({
  head: () => ({
    meta: [
      { title: "Climate Risk Report — AgriCast AI" },
      { name: "description", content: "Generate and download a climate risk report with location, crop, risk level and recommendations." },
      { property: "og:title", content: "Climate Risk Report — AgriCast AI" },
      { property: "og:description", content: "Downloadable PDF climate risk report for your field." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { state, district, village, crop, metrics: m } = useAgriData();
  const recs = useMemo(() => buildRecommendations(m, crop, district), [m, crop, district]);
  const [farmer, setFarmer] = useState("");
  const [area, setArea] = useState("");
  const [busy, setBusy] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  useEffect(() => setGeneratedAt(new Date()), [village.id, crop.id]);
  const reportId = `AC-${village.id.slice(0, 3).toUpperCase()}-${crop.id.slice(0, 3).toUpperCase()}-${m.climateRisk}${m.cropHealth}`;

  const download = async () => {
    setBusy(true);
    try {
      await downloadRiskReport({ farmer, area, state, district, village, crop, m, recs, generatedAt: new Date(), reportId });
      toast.success("Report downloaded", { description: `${village.name} · ${crop.name}` });
    } catch (e) {
      console.error(e);
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Risk report"
        title="Climate risk report"
        description="Preview the report for the selected field, add optional farmer details, then download it as a PDF."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
            <Button onClick={download} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Panel title="Report details" subtitle="Optional — included on the PDF" icon={FileText} className="h-fit print:hidden">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="farmer">Farmer / FPO name</Label>
              <Input id="farmer" value={farmer} onChange={(e) => setFarmer(e.target.value)} placeholder="e.g. Ramesh Kumar" maxLength={60} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">Field area (hectares)</Label>
              <Input id="area" value={area} onChange={(e) => setArea(e.target.value.replace(/[^\d.]/g, ""))} placeholder="e.g. 2.5" inputMode="decimal" maxLength={8} />
            </div>
            <p className="text-xs text-muted-foreground">Change state, district, village or crop from the top bar — the report updates instantly.</p>
            <Button className="w-full" onClick={download} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
            </Button>
          </div>
        </Panel>

        {/* Report preview */}
        <article className="overflow-hidden rounded-2xl border bg-card shadow-elevated">
          <header className="flex flex-wrap items-center justify-between gap-4 bg-gradient-forest px-6 py-5 text-forest-foreground">
            <div className="flex items-center gap-3">
              <LogoMark className="h-10 w-10" />
              <div>
                <p className="font-display text-xl font-bold">AgriCast AI</p>
                <p className="text-xs text-forest-foreground/70">Climate Risk Report</p>
              </div>
            </div>
            <div className="text-right text-xs text-forest-foreground/80">
              <p className="font-mono">{reportId}</p>
              <p>{generatedAt ? generatedAt.toLocaleString("en-IN") : "—"}</p>
            </div>
          </header>

          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{village.name}, {district.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {state.name} · {crop.name} ({crop.season}) · {district.soilType} soil
                  {farmer && <> · Farmer: <b className="text-foreground">{farmer}</b></>}
                  {area && <> · {area} ha</>}
                </p>
              </div>
              <SimulatedBadge />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overall climate risk</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold tabular">{m.climateRisk}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                  <RiskBadge level={m.riskLevel} />
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected yield</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold tabular">{m.expectedYield}</span>
                  <span className="text-sm text-muted-foreground">t/ha · {m.yieldChange > 0 ? "+" : ""}{m.yieldChange}% vs normal</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Temperature", `${m.temperature}°C`],
                ["Rainfall (30d)", `${m.rainfall30d} mm`],
                ["Humidity", `${m.humidity}%`],
                ["Soil moisture", `${m.soilMoisture}%`],
                ["Soil pH", `${m.soilPh}`],
                ["Crop health", `${m.cropHealth}/100`],
                ["NDVI", `${m.ndvi}`],
                ["Season rain", `${m.rainfallDeviation > 0 ? "+" : ""}${m.rainfallDeviation}%`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted p-3">
                  <p className="text-[11px] text-muted-foreground">{k}</p>
                  <p className="font-semibold tabular">{v}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <RiskBar label="Drought" value={m.droughtProb} />
              <RiskBar label="Excess rainfall" value={m.excessRainRisk} />
              <RiskBar label="Unseasonal rainfall" value={m.unseasonalRainRisk} />
              <RiskBar label="Heat stress" value={m.heatStressRisk} />
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Recommended actions</h3>
              <ol className="space-y-3">
                {recs.map((r, i) => (
                  <li key={r.title} className="flex gap-3 rounded-xl border p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-primary">{i + 1}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{r.title}</span>
                        <PriorityPill p={r.priority} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="border-t pt-4 text-xs text-muted-foreground">
              Disclaimer: All values in this report are simulated demonstration data from the AgriCast AI prototype. No live weather,
              satellite, soil-sensor or machine-learning feeds are connected.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
