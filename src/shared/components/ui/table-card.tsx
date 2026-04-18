interface TableCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function TableCard({ title, description, children }: TableCardProps) {
  return (
    <section className="rounded-[1.8rem] border border-black/8 bg-[var(--color-panel)] p-5 shadow-[0_18px_36px_rgba(17,32,47,0.08)]">
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-[var(--color-muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
