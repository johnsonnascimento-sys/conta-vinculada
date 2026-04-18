import Link from "next/link";
import { getContractsOverview } from "@/features/contracts/queries";
import { getDashboardSummary } from "@/features/dashboard/queries";
import type { Contract } from "@/features/platform/types";
import { Badge } from "@/shared/components/ui/badge";
import { MetricChip } from "@/shared/components/ui/metric-chip";
import { SectionCard } from "@/shared/components/ui/section-card";
import { StatCard } from "@/shared/components/ui/stat-card";
import { formatCurrency, formatPercentage } from "@/shared/lib/formatters";

export default async function DashboardPage() {
  const [summary, contracts] = await Promise.all([
    getDashboardSummary(),
    getContractsOverview(),
  ]);

  return (
    <>
      <section className="rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,_rgba(255,253,248,0.96),_rgba(242,235,223,0.94))] p-6 shadow-[0_20px_60px_rgba(17,32,47,0.08)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge tone="neutral">Painel institucional</Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] lg:text-5xl">
                Operação interna com visão executiva, filas e exceções.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--color-muted)]">
                Esta versão do MVP já diferencia saldo bancário, provisão gerencial,
                aprovações pendentes e liberações em trânsito.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricChip label="Saldo bancário" value={formatCurrency(summary.totalBankBalance)} />
            <MetricChip label="Provisões líquidas" value={formatCurrency(summary.totalProvisionBalance)} />
            <MetricChip label="Solicitações pendentes" value={String(summary.pendingReleaseRequests)} />
            <MetricChip label="Diferença não explicada" value={formatCurrency(summary.unexplainedDifference)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Diferença conciliatória" value={formatPercentage(summary.unexplainedDifferenceRatio)} detail="Percentual do saldo bancário global sem explicação formal na conciliação." tone="alert" />
        <StatCard label="Contratos monitorados" value={String(contracts.length)} detail="Contratos ativos com conta vinculada e processamento de competência." />
        <StatCard label="Itens pendentes de análise" value={String(summary.pendingApprovalItems)} detail="Itens aguardando parecer documental ou decisão administrativa." />
        <StatCard label="Postura do MVP" value="Interno" detail="Sem portal externo da contratada nesta primeira implantação." />
      </section>

      <SectionCard
        eyebrow="Fila priorizada"
        title="Contratos com risco operacional imediato"
        description="A priorização considera diferença conciliatória, competências reabertas, valor reservado e solicitações ainda sem decisão final."
      >
        <div className="grid gap-4">
          {contracts.map((contract: Contract & { bankBalance: number; provisionBalance: number; reservedBalance: number; pendingRequests: number; companyName: string; unexplainedDifference: number; }) => (
            <Link
              key={contract.id}
              href={`/dashboard/contracts/${contract.id}`}
              className="grid gap-4 rounded-[1.5rem] border border-black/8 bg-white px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(17,32,47,0.1)] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{contract.code}</p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{contract.name}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{contract.companyName}</p>
              </div>
              <MetricChip label="Saldo bancário" value={formatCurrency(contract.bankBalance)} />
              <MetricChip label="Provisões" value={formatCurrency(contract.provisionBalance)} />
              <MetricChip label="Reservado" value={formatCurrency(contract.reservedBalance)} />
              <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                <Badge tone={contract.unexplainedDifference > 0 ? "danger" : "success"}>{contract.riskLevel}</Badge>
                <div className="mt-3 text-sm text-[var(--color-muted)]">
                  <strong className="block text-lg text-[var(--color-ink)]">{contract.pendingRequests}</strong>
                  solicitações em aberto
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
