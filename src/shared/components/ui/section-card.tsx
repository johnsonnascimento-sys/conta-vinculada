interface SectionCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-black/8 bg-[rgba(255,253,248,0.86)] p-6 shadow-[0_24px_60px_rgba(17,32,47,0.08)] backdrop-blur">
      <div className="mb-6 space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
          {title}
        </h2>
        <p className="max-w-3xl text-base leading-7 text-[var(--color-muted)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
