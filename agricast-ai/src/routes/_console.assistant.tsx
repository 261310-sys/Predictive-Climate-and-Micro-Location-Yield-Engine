import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Bot, CloudRain, Droplets, Flame, Leaf, Send, ShieldAlert, Sparkles, Sprout, Trash2, User, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAgriData } from "@/lib/selection-context";
import { answer, buildRecommendations, QUICK_PROMPTS, type AdviceCategory } from "@/lib/advice";
import { PageHeader, Panel, PriorityPill, RiskBadge, SimulatedBadge } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_console/assistant")({
  head: () => ({
    meta: [
      { title: "AI Farming Assistant — AgriCast AI" },
      { name: "description", content: "Crop-specific mitigation, irrigation and rainfall-preparedness advice with an interactive farming chat assistant." },
      { property: "og:title", content: "AI Farming Assistant — AgriCast AI" },
      { property: "og:description", content: "Risk-based farming actions and a demo advisory chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const CAT_ICON: Record<AdviceCategory, LucideIcon> = {
  Irrigation: Droplets,
  "Rainfall preparedness": CloudRain,
  "Heat stress": Flame,
  "Soil health": Leaf,
  "Crop protection": ShieldAlert,
  Yield: Wheat,
};

interface Msg {
  id: number;
  role: "user" | "bot";
  text: string;
}

function AssistantPage() {
  const { crop, district, village, metrics: m } = useAgriData();
  const recs = useMemo(() => buildRecommendations(m, crop, district), [m, crop, district]);
  const [filter, setFilter] = useState<AdviceCategory | "All">("All");
  const shown = filter === "All" ? recs : recs.filter((r) => r.category === filter);

  const greeting = `Namaste! I'm looking at ${crop.name} in ${village.name}, ${district.name}. Current climate risk is ${m.climateRisk}/100 (${m.riskLevel}). What would you like to know?`;
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: "bot", text: greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  // Reset conversation context when location/crop changes
  useEffect(() => {
    setMsgs([{ id: idRef.current++, role: "bot", text: greeting }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop.id, village.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, typing]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((x) => [...x, { id: idRef.current++, role: "user", text: q }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMsgs((x) => [...x, { id: idRef.current++, role: "bot", text: answer(q, { m, crop, district, village }) }]);
      setTyping(false);
    }, 650);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const categories = ["All", ...Array.from(new Set(recs.map((r) => r.category)))] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI farming assistant"
        title="Mitigation plan & advisor"
        description={`Actions prioritised from the current risk profile for ${crop.name} in ${village.name}.`}
        actions={<RiskBadge level={m.riskLevel} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <Panel title="Recommended actions" subtitle={`${recs.filter((r) => r.priority === "High").length} high-priority actions`} icon={Sparkles}>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Button key={c} size="sm" variant={filter === c ? "default" : "outline"} onClick={() => setFilter(c as AdviceCategory | "All")}>
                {c}
              </Button>
            ))}
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {shown.map((r) => {
              const Icon = CAT_ICON[r.category];
              return (
                <li key={r.title} className="flex flex-col rounded-xl border bg-background p-4 transition-shadow hover:shadow-soft">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary-glow">
                      <Icon className="h-4 w-4" /> {r.category}
                    </span>
                    <PriorityPill p={r.priority} />
                  </div>
                  <p className="mt-2 text-sm font-semibold">{r.title}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{r.detail}</p>
                </li>
              );
            })}
          </ul>
        </Panel>

        <section className="flex h-[680px] flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
          <header className="flex items-center justify-between gap-3 bg-gradient-forest px-4 py-3 text-forest-foreground">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf text-leaf-foreground"><Bot className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold">Krishi Assistant</p>
                <p className="text-[11px] text-forest-foreground/70">Predefined demo responses</p>
              </div>
            </div>
            <Button size="icon" variant="glass" onClick={() => setMsgs([{ id: idRef.current++, role: "bot", text: greeting }])} aria-label="Clear chat">
              <Trash2 />
            </Button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
            {msgs.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
                <span className={cn("mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", msg.role === "bot" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground")}>
                  {msg.role === "bot" ? <Sprout className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </span>
                <div className={cn("max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm shadow-soft", msg.role === "bot" ? "rounded-tl-sm bg-card" : "rounded-tr-sm bg-primary text-primary-foreground")}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sprout className="h-3.5 w-3.5" /></span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card px-4 py-3 shadow-soft">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((p) => (
                <button key={p} onClick={() => ask(p)} disabled={typing} className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-secondary disabled:opacity-50">
                  {p}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about irrigation, rain, pests…" aria-label="Message" />
              <Button type="submit" size="icon" disabled={!input.trim() || typing} aria-label="Send"><Send /></Button>
            </form>
            <div className="mt-2 flex justify-center"><SimulatedBadge label="Rule-based demo · not a live AI model" /></div>
          </div>
        </section>
      </div>
    </div>
  );
}
