import Link from "next/link";
import { getUserManual } from "@/features/manual/queries";
import { Badge } from "@/shared/components/ui/badge";
import { SectionCard } from "@/shared/components/ui/section-card";

export default async function ManualPage() {
  const manual = await getUserManual();

  return (
    <div className="space-y-4">
      <SectionCard
        eyebrow="Operacao do sistema"
        title={manual.title}
        description="Conteudo funcional para orientar o uso do sistema pelos perfis internos do orgao."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-black/8 bg-white px-5 py-4">
          <div className="space-y-2">
            <Badge tone="neutral">Fonte unica de verdade</Badge>
            <p className="max-w-3xl text-sm leading-6 text-[var(--color-muted)]">
              Esta pagina reproduz o conteudo de{" "}
              <code>docs/MANUAL_DO_USUARIO.md</code>. Toda mudanca funcional do
              sistema deve manter esse material sincronizado.
            </p>
          </div>
          <Link
            href="#sumario"
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
          >
            Ir para o sumario
          </Link>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          id="sumario"
          className="rounded-[1.6rem] border border-black/8 bg-white px-5 py-5 shadow-[0_16px_30px_rgba(17,32,47,0.06)]"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Sumario
          </h2>
          <nav className="mt-4 space-y-2">
            {manual.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-2xl px-3 py-2 text-sm text-[var(--color-ink)] transition hover:bg-[var(--color-surface)]"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          {manual.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-[1.6rem] border border-black/8 bg-white px-6 py-6 shadow-[0_16px_30px_rgba(17,32,47,0.06)]"
            >
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {section.title}
              </h2>

              <div className="mt-5 space-y-4">
                {section.blocks.map((block, index) => {
                  if (block.type === "subheading") {
                    return (
                      <h3
                        key={`${section.id}-subheading-${index}`}
                        className="pt-2 text-lg font-semibold text-[var(--color-ink)]"
                      >
                        {block.text}
                      </h3>
                    );
                  }

                  if (block.type === "list") {
                    return (
                      <ul
                        key={`${section.id}-list-${index}`}
                        className="space-y-2 pl-5 text-sm leading-7 text-[var(--color-muted)]"
                      >
                        {block.items.map((item) => (
                          <li key={item} className="list-disc">
                            {item}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p
                      key={`${section.id}-paragraph-${index}`}
                      className="text-sm leading-7 text-[var(--color-muted)]"
                    >
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
