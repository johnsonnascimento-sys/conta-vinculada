import Link from "next/link";
import { getContractsOverview } from "@/features/contracts/queries";
import type { ContractOverview } from "@/features/platform/types";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCurrency } from "@/shared/lib/formatters";

function getManagerialAttentionTone(contract: ContractOverview) {
  if (
    contract.contractReconciliationSummary.managerialAttention === "requer_revisao"
  ) {
    return "danger" as const;
  }

  if (
    contract.contractReconciliationSummary.managerialAttention ===
    "requer_acompanhamento"
  ) {
    return "warning" as const;
  }

  return "success" as const;
}

function getCoverageTone(contract: ContractOverview) {
  if (
    contract.contractReconciliationSummary.overallCoverageState === "sem_cobertura"
  ) {
    return "danger" as const;
  }

  if (
    contract.contractReconciliationSummary.overallCoverageState ===
    "cobertura_parcial"
  ) {
    return "warning" as const;
  }

  return "success" as const;
}

export default async function ContractsPage() {
  const contracts = await getContractsOverview();

  return (
    <TableCard
      title="Contratos"
      description="Visao consolidada por contrato com saldos, reservas e leitura gerencial minima da conciliacao."
    >
      <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
        <table className="min-w-full divide-y divide-black/8 text-left">
          <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Contrato</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Saldo bancario</th>
              <th className="px-4 py-3">Provisoes</th>
              <th className="px-4 py-3">Reservado</th>
              <th className="px-4 py-3">Leitura conciliatoria</th>
              <th className="px-4 py-3">Acao</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8 bg-white">
            {contracts.map((contract: ContractOverview) => (
              <tr key={contract.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-[var(--color-ink)]">{contract.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{contract.code}</p>
                </td>
                <td className="px-4 py-4 text-sm text-[var(--color-muted)]">
                  {contract.companyName}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                  {formatCurrency(contract.bankBalance)}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                  {formatCurrency(contract.provisionBalance)}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                  {formatCurrency(contract.reservedBalance)}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="space-y-2 text-sm text-[var(--color-muted)]">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={getManagerialAttentionTone(contract)}>
                        {contract.contractReconciliationSummary.managerialAttentionLabel}
                      </Badge>
                      <Badge tone={getCoverageTone(contract)}>
                        {contract.contractReconciliationSummary.overallCoverageStateLabel}
                      </Badge>
                    </div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {contract.contractReconciliationSummary.managerialAttentionReason}
                    </p>
                    <p>
                      Residual nao explicado:{" "}
                      {formatCurrency(
                        contract.contractReconciliationSummary.totalUnexplainedResidual,
                      )}
                    </p>
                    <p>
                      Explicado ainda remanescente:{" "}
                      {formatCurrency(
                        contract.contractReconciliationSummary
                          .totalExplainedStillUnitemized,
                      )}
                    </p>
                    <p>
                      Cobertura agregada:{" "}
                      {contract.contractReconciliationSummary.overallCoveragePercentage}%
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {contract.contractReconciliationSummary.hasOpenUnexplained ? (
                        <Badge tone="danger">residual aberto</Badge>
                      ) : null}
                      {contract.contractReconciliationSummary.hasReopenedCompetencies ? (
                        <Badge tone="warning">competencia reaberta</Badge>
                      ) : null}
                      {contract.contractReconciliationSummary.hasRelevantUnitemized ? (
                        <Badge tone="warning">remanescente relevante</Badge>
                      ) : null}
                      {!contract.contractReconciliationSummary.hasOpenUnexplained &&
                      !contract.contractReconciliationSummary
                        .hasReopenedCompetencies &&
                      !contract.contractReconciliationSummary.hasRelevantUnitemized ? (
                        <Badge tone="success">situacao normal</Badge>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/contracts/${contract.id}`}
                    className="inline-flex min-h-10 items-center rounded-full bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}
