import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CloudRain,
  Database,
  FileText,
  FlaskConical,
  Map,
  Satellite,
  ShieldCheck,
  Sprout,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import heroImg from "@/assets/hero-farmland.jpg";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { metricsFor } from "@/lib/agri-model";
import { DEFAULT_SELECTION } from "@/lib/selection-context";
import { riskColorVar } from "@/components/app/ui-bits";
import { CROPS, REGIONS } from "@/lib/regions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriCast AI — Predict Climate. Protect Crops. Improve Yield." },
      {
        name: "description",
        content: "AgriCast AI is a predictive climate and micro-location yield engine that helps Indian farmers understand climate risk and act early.",
      },
      { property: "og:title", content: "AgriCast AI — Predict Climate. Protect Crops. Improve Yield." },
      { property: "og:description", content: "Village-level climate risk, soil and vegetation monitoring, yield forecasts and mitigation advice for Indian agriculture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Map, title: "Location Intelligence", text: "Drill down from state to district to village and see micro-climate risk on an interactive map.", to: "/location" },
  { icon: Satellite, title: "Soil & Satellite", text: "Soil moisture, pH and temperature with an NDVI vegetation-health layer over field imagery.", to: "/soil" },
  { icon: TrendingUp, title: "Climate Prediction", text: "Drought, unseasonal rain and heat-stress probabilities with what-if scenarios.", to: "/predictions" },
  { icon: Sprout, title: "Yield Engine", text: "Crop-specific expected yield vs. local normal, driven by climate and soil suitability.", to: "/dashboard" },
  { icon: Bot, title: "Farming Assistant", text: "Irrigation, rainfall-preparedness and crop-protection advice based on current risk.", to: "/assistant" },
  { icon: FileText, title: "Risk Reports", text: "One-click downloadable climate risk report for farmers, FPOs, banks and insurers.", to: "/report" },
] as const;

const STEPS = [
  { n: "01", title: "Pick your field", text: "Choose state, district, village and crop." },
  { n: "02", title: "Fuse the signals", text: "Climate, soil and vegetation indicators are combined into one risk score." },
  { n: "03", title: "Act early", text: "Get prioritised actions and a shareable report before the risk hits." },
];

function Landing() {
  const demo = metricsFor(DEFAULT_SELECTION);
  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest text-forest-foreground">
        <img src={heroImg} alt="Aerial view of green Indian farmland at sunrise" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 grid-pattern opacity-60" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Logo tone="light" />
          <div className="hidden items-center gap-7 text-sm font-medium text-forest-foreground/80 md:flex">
            <a href="#features" className="transition-colors hover:text-leaf">Features</a>
            <a href="#how" className="transition-colors hover:text-leaf">How it works</a>
            <a href="#data" className="transition-colors hover:text-leaf">Data</a>
          </div>
          <Button asChild variant="leaf" size="sm">
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-28 pt-12 md:px-8 md:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-leaf/40 bg-forest/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-leaf backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-leaf animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
              </span>
              Predictive Climate & Micro-Location Yield Engine
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] md:text-7xl">
              Predict Climate.
              <br />
              Protect Crops.
              <br />
              <span className="text-gradient-leaf">Improve Yield.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-forest-foreground/80 md:text-lg">
              AgriCast AI turns climate, soil and vegetation signals into village-level risk scores, yield forecasts and
              clear actions — so farmers can act before drought, heat or unseasonal rain strikes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="leaf" size="lg">
                <Link to="/dashboard">
                  Get Started <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link to="/location">Explore the map</Link>
              </Button>
            </div>
          </div>

          {/* Floating preview card */}
          <div className="animate-float-slow rounded-3xl border border-forest-foreground/15 bg-forest/60 p-5 shadow-elevated backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-forest-foreground/60">Khanna · Ludhiana</p>
                <p className="font-display text-lg font-semibold">Wheat · Rabi</p>
              </div>
              <span className="rounded-full bg-leaf px-2.5 py-1 text-[11px] font-bold text-leaf-foreground">DEMO</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { icon: Thermometer, l: "Temp", v: `${demo.temperature}°C` },
                { icon: CloudRain, l: "Rain (30d)", v: `${demo.rainfall30d} mm` },
                { icon: Sprout, l: "Crop health", v: `${demo.cropHealth}/100` },
                { icon: TrendingUp, l: "Yield", v: `${demo.expectedYield} t/ha` },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-forest-foreground/5 p-3 ring-1 ring-forest-foreground/10">
                  <s.icon className="h-4 w-4 text-leaf" />
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-forest-foreground/60">{s.l}</p>
                  <p className="font-display text-xl font-bold tabular">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-forest-foreground/5 p-3 ring-1 ring-forest-foreground/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-forest-foreground/70">Climate risk score</span>
                <span className="font-mono font-semibold" style={{ color: riskColorVar(demo.climateRisk) }}>{demo.climateRisk}/100 · {demo.riskLevel}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-foreground/10">
                <div className="h-full rounded-full" style={{ width: `${demo.climateRisk}%`, background: riskColorVar(demo.climateRisk) }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-elevated md:grid-cols-4">
          {[
            { v: String(REGIONS.length), l: "Indian states modelled" },
            { v: String(REGIONS.reduce((n, st) => n + st.districts.reduce((k, d) => k + d.villages.length, 0), 0)), l: "Demo villages" },
            { v: String(CROPS.length), l: "Major crops" },
            { v: "8", l: "Risk & soil indicators" },
          ].map((s) => (
            <div key={s.l} className="bg-card p-5 text-center">
              <p className="font-display text-3xl font-bold text-primary">{s.v}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-glow">The problem</p>
            <h2 className="mt-2 text-3xl font-bold md:text-5xl">Climate shocks are local. Advice usually isn't.</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Over half of India's farmland depends on rainfall. A delayed monsoon in one district or a heat wave during
            grain-filling in another can wipe out a season. AgriCast AI brings risk down to the village and crop level,
            translating complex data into a single score and a short list of things to do this week.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative bg-gradient-mesh py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-glow">Platform</p>
            <h2 className="mt-2 text-3xl font-bold md:text-5xl">Everything a field needs, in one console.</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                to={f.to}
                className="group rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-forest text-leaf">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-glow">How it works</p>
        <h2 className="mt-2 text-3xl font-bold md:text-5xl">From field to forecast in three steps.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border bg-card p-6">
              <span className="font-mono text-sm font-semibold text-primary-glow">{s.n}</span>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DATA TRANSPARENCY */}
      <section id="data" className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-forest p-8 text-forest-foreground md:p-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-leaf px-3 py-1 text-xs font-bold text-leaf-foreground">
                <FlaskConical className="h-3.5 w-3.5" /> Transparent by design
              </span>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">This demo runs on simulated data.</h2>
              <p className="mt-4 text-forest-foreground/80">
                Readings, satellite indices and predictions in this prototype are generated by a deterministic
                simulation engine using realistic regional baselines. No live weather feed, soil sensor, satellite
                pipeline or trained ML model is connected yet.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: CloudRain, t: "IMD / Open-Meteo", d: "Weather & rainfall forecasts" },
                { icon: Satellite, t: "Copernicus Sentinel-2", d: "NDVI vegetation index" },
                { icon: Database, t: "ISRO Bhuvan / NRSC", d: "Soil moisture & land use" },
                { icon: ShieldCheck, t: "Soil Health Card", d: "pH & nutrient baselines" },
              ].map((d) => (
                <div key={d.t} className="rounded-2xl bg-forest-foreground/5 p-4 ring-1 ring-forest-foreground/10">
                  <d.icon className="h-5 w-5 text-leaf" />
                  <p className="mt-3 font-semibold">{d.t}</p>
                  <p className="text-xs text-forest-foreground/70">{d.d} · integration-ready</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-24 text-center md:px-8">
        <h2 className="text-3xl font-bold md:text-5xl">Ready to see your field's risk?</h2>
        <p className="mt-4 text-muted-foreground">No login. No setup. Pick a village and a crop to begin.</p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/dashboard">
            Get Started <ArrowRight />
          </Link>
        </Button>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <Logo />
          <p>Hackathon prototype · All data shown is simulated for demonstration.</p>
        </div>
      </footer>
    </div>
  );
}
