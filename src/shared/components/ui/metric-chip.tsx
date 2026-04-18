interface MetricChipProps {
  label: string;
  value: string;
}

export function MetricChip({ label, value }: MetricChipProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 shadow-[0_10px_20px_rgba(17,32,47,0.05)]">
      <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
        {label}
      </span>
      <strong className="mt-1 block text-lg text-[var(--color-ink)]">{value}</strong>
    </div>
  );
}
