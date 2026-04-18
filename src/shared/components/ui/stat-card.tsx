import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "light" | "alert";
}

export function StatCard({
  label,
  value,
  detail,
  tone = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border px-5 py-5 shadow-[0_18px_44px_rgba(17,32,47,0.14)]",
        tone === "default" &&
          "border-black/8 bg-[var(--color-panel)] text-[var(--color-ink)]",
        tone === "light" && "border-white/10 bg-white/9 text-white",
        tone === "alert" && "border-[#d69682]/40 bg-[#4b2218] text-white",
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-80">
        {label}
      </p>
      <strong className="mt-3 block text-3xl leading-none font-semibold tracking-[-0.04em]">
        {value}
      </strong>
      <p className="mt-3 text-sm leading-6 opacity-75">{detail}</p>
    </div>
  );
}
