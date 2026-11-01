import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-8 w-8", className)} aria-hidden>
      <rect width="40" height="40" rx="11" fill="var(--leaf)" />
      <path d="M11 28c0-9 6-16 18-17-1 11-7 17-16 17" fill="var(--forest)" />
      <path d="M12 28c3-5 7-9 12-12" stroke="var(--leaf)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="29" cy="28" r="2.2" fill="var(--forest)" />
      <path d="M24 31.5h10" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("font-display text-lg font-bold tracking-tight", tone === "light" ? "text-forest-foreground" : "text-foreground")}>
        AgriCast<span className={tone === "light" ? "text-leaf" : "text-primary-glow"}> AI</span>
      </span>
    </span>
  );
}
