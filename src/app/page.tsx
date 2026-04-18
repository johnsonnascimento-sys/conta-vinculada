import Link from "next/link";
import { getDashboardSummary, getRiskContracts } from "@/features/dashboard/queries";
import type { Contract } from "@/features/platform/types";
import { SectionCard } from "@/shared/components/ui/section-card";
import { StatCard } from "@/shared/components/ui/stat-card";
import { formatCurrency, formatPercentage } from "@/shared/lib/formatters";

export default async function HomePage() {
  const [summary, riskContracts] = await Promise.all([
    getDashboardSummary(),
    getRiskContracts(),
  ]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(195,59,42,0.18),_transparent_28%),linear-gradient(180deg,_#f5f1e8_0%,_#ebe4d7_42%,_#ddd4c4_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-8 lg:px-10 lg:py-12">
        <header className="overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,_rgba(17,32,47,0.97),_rgba(44,66,84,0.96))] p-8 text-white shadow-[0_28px_80px_rgba(17,32,47,0.24)] lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-7">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.24em] text-white/80">
                Governança operacional da conta vinculada
              </span>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.04em] text-balance lg:text-6xl">
                  Controle institucional de provisões, saldo bancário, liberações e
                  conciliação em um único backoffice auditável.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-white/76">
                  MVP interno para a Justiça Militar da União com foco em rastreabilidade,
                  segregação de funções, histórico por competência e redução do retrabalho
                  do Excel.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center rounded-full bg-[#d9b26f] px-6 font-semibold text-[#17212b] transition hover:bg-[#e4bf80]"
                >
                  Abrir backoffice
                </Link>
                <Link
                  href="/dashboard/contracts/c-2cjm-001"
                  className="inline-flex min-h-12 items-center rounded-full border border-white/20 px-6 font-semibold text-white transition hover:bg-white/10"
                >
                  Ver contrato modelo
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard
                label="Saldo bancário global"
                value={formatCurrency(summary.totalBankBalance)}
                tone="light"
                detail={`Provisões líquidas: ${formatCurrency(summary.totalProvisionBalance)}`}
              />
              <StatCard
                label="Solicitações pendentes"
                value={String(summary.pendingReleaseRequests)}
                tone="light"
                detail={`${summary.pendingApprovalItems} itens aguardando decisão`}
              />
              <StatCard
                label="Diferença conciliatória"
                value={formatCurrency(summary.unexplainedDifference)}
                tone="alert"
                detail={`${formatPercentage(summary.unexplainedDifferenceRatio)} do saldo bancário`}
              />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            eyebrow="Quatro eixos do domínio"
            title="A interface não trata empregado como titular de subconta."
            description="O sistema deixa explícita a distinção entre saldo bancário real, provisões gerenciais por empregado e rubrica, workflow administrativo e conciliação."
          >
            <div className="grid gap-3">
              {[
                "Conta vinculada única com depósitos, rendimentos, liberações e ajustes.",
                "Provisões derivadas por competência, empregado e rubrica, sempre auditáveis.",
                "Workflow de solicitação, análise, diligência, aprovação e execução financeira.",
                "Conciliação com diferença explicada e não explicada.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm leading-6 text-[var(--color-muted)] shadow-[0_12px_30px_rgba(17,32,47,0.06)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Contratos com maior risco"
            title="Filas e painéis orientados a exceção"
            description="Os contratos abaixo combinam saldo bancário, provisão, pendência documental e divergência conciliatória para priorização operacional."
          >
            <div className="grid gap-3">
              {riskContracts.map((contract: Contract & { bankBalance: number; provisionBalance: number; pendingRequests: number; }) => (
                <Link
                  key={contract.id}
                  href={`/dashboard/contracts/${contract.id}`}
                  className="grid gap-3 rounded-[1.5rem] border border-black/10 bg-[var(--color-panel)] px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(17,32,47,0.10)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {contract.code}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
                        {contract.name}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#7f2f1d] px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-white">
                      risco {contract.riskLevel}
                    </span>
                  </div>
                  <div className="grid gap-3 text-sm text-[var(--color-muted)] sm:grid-cols-3">
                    <div>
                      <span className="block font-mono text-xs uppercase tracking-[0.14em]">
                        Saldo bancário
                      </span>
                      <strong className="text-base text-[var(--color-ink)]">
                        {formatCurrency(contract.bankBalance)}
                      </strong>
                    </div>
                    <div>
                      <span className="block font-mono text-xs uppercase tracking-[0.14em]">
                        Provisões
                      </span>
                      <strong className="text-base text-[var(--color-ink)]">
                        {formatCurrency(contract.provisionBalance)}
                      </strong>
                    </div>
                    <div>
                      <span className="block font-mono text-xs uppercase tracking-[0.14em]">
                        Pendências
                      </span>
                      <strong className="text-base text-[var(--color-ink)]">
                        {contract.pendingRequests}
                      </strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
