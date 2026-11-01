import type { ReactNode } from "react";
import { FlaskConical, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/agri-model";

export function riskColorVar(score: number) {
  if (score < 30) return "var(--risk-low)";
  if (score < 50) return "var(--risk-moderate)";
  if (score < 70) return "var(--risk-high)";
  return "var(--risk-severe)";
}

const riskClasses: Record<RiskLevel, string> = {
  Low: "bg-risk-low/15 text-risk-low ring-risk-low/30",
  Moderate: "bg-risk-moderate/20 text-foreground ring-risk-moderate/40",
  High: "bg-risk-high/15 text-risk-high ring-risk-high/30",
  Severe: "bg-risk-severe/15 text-risk-severe ring-risk-severe/30",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", riskClasses[level], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level} risk
    </span>
  );
}

export function SimulatedBadge({ className, label = "Simulated demo data" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-secondary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground", className)}>
      <FlaskConical className="h-3 w-3" />
      {label}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-glow">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, icon: Icon, action, children, className }: { title?: string; subtitle?: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div>
              {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  hint,
  progress,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  hint?: ReactNode;
  progress?: { value: number; color?: string };
  tone?: "default" | "forest";
}) {
  const forest = tone === "forest";
  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border p-4 shadow-soft transition-transform hover:-translate-y-0.5", forest ? "border-transparent bg-gradient-forest text-forest-foreground" : "bg-card")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-semibold uppercase tracking-wide", forest ? "text-forest-foreground/70" : "text-muted-foreground")}>{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", forest ? "bg-leaf text-leaf-foreground" : "bg-secondary text-primary")}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl font-bold tabular">{value}</span>
        {unit && <span className={cn("text-sm font-medium", forest ? "text-forest-foreground/70" : "text-muted-foreground")}>{unit}</span>}
      </div>
      {progress && (
        <div className={cn("mt-3 h-1.5 w-full overflow-hidden rounded-full", forest ? "bg-forest-foreground/15" : "bg-muted")}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, progress.value)}%`, background: progress.color ?? "var(--primary-glow)" }} />
        </div>
      )}
      {hint && <div className={cn("mt-2 text-xs", forest ? "text-forest-foreground/75" : "text-muted-foreground")}>{hint}</div>}
    </div>
  );
}

/** Semi-circular gauge 0-100. */
export function Gauge({ value, label, size = 180, color }: { value: number; label?: string; size?: number; color?: string }) {
  const r = 70;
  const c = Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const stroke = color ?? riskColorVar(v);
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.62 }}>
      <svg viewBox="0 0 180 110" className="h-full w-full">
        <path d="M20 95 A70 70 0 0 1 160 95" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M20 95 A70 70 0 0 1 160 95"
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-display text-4xl font-bold tabular text-foreground">{Math.round(v)}</div>
        {label && <div className="text-xs font-medium text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}

export function RiskBar({ label, value, icon: Icon }: { label: string; value: number; icon?: LucideIcon }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-foreground">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {label}
        </span>
        <span className="font-mono text-sm font-semibold tabular" style={{ color: riskColorVar(value) }}>
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: riskColorVar(value) }} />
      </div>
    </div>
  );
}

export function DataNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-dashed border-primary/30 bg-secondary/60 p-3 text-xs text-secondary-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export const chartTooltipStyle = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    boxShadow: "var(--shadow-soft)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--foreground)", fontWeight: 600 },
};

export function PriorityPill({ p }: { p: "High" | "Medium" | "Low" }) {
  const cls = p === "High" ? "bg-risk-severe/15 text-risk-severe" : p === "Medium" ? "bg-risk-moderate/25 text-foreground" : "bg-risk-low/15 text-risk-low";
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}>{p} priority</span>;
}

export const legendProps = {
  wrapperStyle: { fontSize: 12 },
  formatter: (value: string) => <span className="text-muted-foreground">{value}</span>,
};
