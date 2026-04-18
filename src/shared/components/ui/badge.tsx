import { cn } from "@/shared/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "warning" | "danger" | "success";
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
        tone === "neutral" && "bg-[rgba(23,33,43,0.08)] text-[var(--color-ink)]",
        tone === "warning" && "bg-[rgba(167,104,28,0.14)] text-[var(--color-warning)]",
        tone === "danger" && "bg-[rgba(127,47,29,0.14)] text-[var(--color-danger)]",
        tone === "success" && "bg-[rgba(31,107,82,0.14)] text-[var(--color-success)]",
      )}
    >
      {children}
    </span>
  );
}
