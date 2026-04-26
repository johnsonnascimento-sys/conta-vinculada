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

function getRecurrenceTone(contract: ContractOverview) {
  if (
    contract.contractReconciliationSummary.recurrenceState ===
    "recorrencia_relevante"
  ) {
    return "danger" as const;
  }

  if (
    contract.contractReconciliationSummary.recurrenceState === "recorrencia_leve"
  ) {
    return "warning" as const;
  }

  return "success" as const;
}

function getRecurrenceTemporalTone(contract: ContractOverview) {
  if (
    contract.contractReconciliationSummary.recurrenceTemporalState ===
    "recorrencia_ativa"
  ) {
    return "danger" as const;
  }

  if (
    contract.contractReconciliationSummary.recurrenceTemporalState ===
    "recorrencia_em_reducao"
  ) {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getRecentStabilityTone(contract: ContractOverview) {
  if (
    contract.contractReconciliationSummary.recentStabilityState ===
    "padrao_estavel"
  ) {
    return "danger" as const;
  }

  if (
    contract.contractReconciliationSummary.recentStabilityState ===
      "padrao_alternante" ||
    contract.contractReconciliationSummary.recentStabilityState ===
      "padrao_em_consolidacao"
  ) {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getRecentMaterialityTone(contract: ContractOverview) {
  if (
    contract.contractReconciliationSummary.recentMaterialityState ===
      "alternancia_relevante" ||
    contract.contractReconciliationSummary.recentMaterialityState ===
      "consolidacao_relevante"
  ) {
    return "danger" as const;
  }

  if (
    contract.contractReconciliationSummary.recentMaterialityState ===
      "alternancia_leve" ||
    contract.contractReconciliationSummary.recentMaterialityState ===
      "consolidacao_menor_impacto"
  ) {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getRecentPersistenceTone(contract: ContractOverview) {
  if (
    contract.contractReconciliationSummary.recentPersistenceState ===
    "persistencia_forte"
  ) {
    return "danger" as const;
  }

  if (
    contract.contractReconciliationSummary.recentPersistenceState ===
      "persistencia_moderada" ||
    contract.contractReconciliationSummary.recentPersistenceState ===
      "perda_de_forca"
  ) {
    return "warning" as const;
  }

  return "neutral" as const;
}

export default async function ContractsPage() {
  const contracts = await getContractsOverview();

  return (
    <TableCard
      title="Contratos"
      description="Visao consolidada por contrato com alerta gerencial, saldos principais e contexto conciliatorio recente."
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
                    </div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {contract.contractReconciliationSummary.managerialAttentionReason}
                    </p>
                    <p>
                      Cobertura:{" "}
                      <span className="font-medium text-[var(--color-ink)]">
                        {contract.contractReconciliationSummary.overallCoverageStateLabel}
                      </span>
                      {" "}({contract.contractReconciliationSummary.overallCoveragePercentage}%)
                    </p>
                    <p>
                      Recuperacao recente:{" "}
                      <span className="font-medium text-[var(--color-ink)]">
                        {contract.contractReconciliationSummary.recentRecoveryStateLabel}
                      </span>
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
                    <details className="rounded-2xl border border-black/8 bg-[var(--color-surface)] px-3 py-2 text-xs leading-5">
                      <summary className="cursor-pointer font-semibold text-[var(--color-ink)]">
                        Ver leituras recentes e marcadores
                      </summary>
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={getRecurrenceTone(contract)}>
                            {contract.contractReconciliationSummary.recurrenceStateLabel}
                          </Badge>
                          <Badge tone={getRecurrenceTemporalTone(contract)}>
                            {
                              contract.contractReconciliationSummary
                                .recurrenceTemporalStateLabel
                            }
                          </Badge>
                          <Badge tone={getRecentStabilityTone(contract)}>
                            {
                              contract.contractReconciliationSummary
                                .recentStabilityStateLabel
                            }
                          </Badge>
                          <Badge tone={getRecentMaterialityTone(contract)}>
                            {
                              contract.contractReconciliationSummary
                                .recentMaterialityStateLabel
                            }
                          </Badge>
                          <Badge tone={getRecentPersistenceTone(contract)}>
                            {
                              contract.contractReconciliationSummary
                                .recentPersistenceStateLabel
                            }
                          </Badge>
                        </div>
                        <p>{contract.contractReconciliationSummary.recurrenceStateReason}</p>
                        <p>
                          {
                            contract.contractReconciliationSummary
                              .recurrenceTemporalStateReason
                          }
                        </p>
                        <p>
                          {
                            contract.contractReconciliationSummary
                              .recentStabilityStateReason
                          }
                        </p>
                        <p>
                          {
                            contract.contractReconciliationSummary
                              .recentMaterialityStateReason
                          }
                        </p>
                        <p>
                          {
                            contract.contractReconciliationSummary
                              .recentPersistenceStateReason
                          }
                        </p>
                        <p>
                          {
                            contract.contractReconciliationSummary
                              .recentRecoveryStateReason
                          }
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
                          {contract.contractReconciliationSummary.recurringSignals.map(
                            (signal) => (
                              <Badge key={signal.code} tone="neutral">
                                {signal.label} ({signal.count})
                              </Badge>
                            ),
                          )}
                          {contract.contractReconciliationSummary.recentRecurringSignals.map(
                            (signal) => (
                              <Badge key={`recent-${signal.code}`} tone="warning">
                                recente: {signal.label}
                              </Badge>
                            ),
                          )}
                          {contract.contractReconciliationSummary.recentProfileSignals.map(
                            (signal) => (
                              <Badge key={`recent-profile-${signal.code}`} tone="warning">
                                janela: {signal.label}
                              </Badge>
                            ),
                          )}
                          {contract.contractReconciliationSummary.historicalRecurringSignals
                            .filter(
                              (signal) =>
                                !contract.contractReconciliationSummary.recentRecurringSignals.some(
                                  (recentSignal) => recentSignal.code === signal.code,
                                ),
                            )
                            .map((signal) => (
                              <Badge key={`history-${signal.code}`} tone="neutral">
                                historico: {signal.label}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </details>
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
