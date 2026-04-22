import Link from "next/link";
import type { BankEntry, ReconciliationRecord } from "@/features/platform/types";
import { getCurrentUser } from "@/features/auth/queries";
import { CloseCompetencyForm } from "@/features/reconciliation/components/close-competency-form";
import { RegisterReconciliationItemForm } from "@/features/reconciliation/components/register-reconciliation-item-form";
import { ReopenCompetencyForm } from "@/features/reconciliation/components/reopen-competency-form";
import { getReconciliationOverview } from "@/features/reconciliation/queries";
import {
  canCloseCompetencyReconciliation,
  canRegisterReconciliationItem,
  canReopenCompetencyReconciliation,
} from "@/features/reconciliation/policy";
import { getBankEntries } from "@/server/repositories/platform.repository";
import { isDatabaseEnabled } from "@/server/db/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCompetency, formatCurrency } from "@/shared/lib/formatters";

function getFormalClosureLabel(item: ReconciliationRecord) {
  if (item.formalClosure.state === "fechada") {
    return "fechada";
  }

  if (item.formalClosure.state === "reaberta") {
    return "reaberta";
  }

  if (item.formalClosure.state === "apta_para_fechamento") {
    return "apta ao fechamento";
  }

  return "aberta";
}

function getFormalClosureTone(item: ReconciliationRecord) {
  if (item.formalClosure.state === "fechada") {
    return "success" as const;
  }

  if (item.formalClosure.state === "reaberta") {
    return "danger" as const;
  }

  if (item.formalClosure.state === "apta_para_fechamento") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getPriorityTone(item: ReconciliationRecord) {
  if (item.qualification.priority === "alta") {
    return "danger" as const;
  }

  if (item.qualification.priority === "media") {
    return "warning" as const;
  }

  return "success" as const;
}

function getTrackingTone(item: ReconciliationRecord) {
  if (item.qualification.trackingState === "exige_revisao") {
    return "danger" as const;
  }

  if (item.qualification.trackingState === "em_acompanhamento") {
    return "warning" as const;
  }

  return "success" as const;
}

function getItemKindTone(item: ReconciliationRecord["items"][number]) {
  return item.kind === "diferenca_explicada" ? "success" : "danger";
}

function getCoverageTone(item: ReconciliationRecord) {
  if (item.differenceSummary.explainedCoverageState === "sem_itemizacao") {
    return "danger" as const;
  }

  if (item.differenceSummary.explainedCoverageState === "itemizacao_parcial") {
    return "warning" as const;
  }

  return "success" as const;
}

function getUnitemizedPriorityTone(item: ReconciliationRecord) {
  if (item.differenceSummary.unitemizedBalancePriority === "alta") {
    return "danger" as const;
  }

  if (item.differenceSummary.unitemizedBalancePriority === "media") {
    return "warning" as const;
  }

  return "success" as const;
}

function getAvailableBankEntries(
  item: ReconciliationRecord,
  bankEntries: BankEntry[],
) {
  const linkedBankEntryIds = new Set(
    item.items.flatMap((reconciliationItem) =>
      reconciliationItem.bankEntryId ? [reconciliationItem.bankEntryId] : [],
    ),
  );

  return bankEntries.filter(
    (entry) =>
      entry.contractId === item.contractId &&
      entry.competency === item.competency &&
      !linkedBankEntryIds.has(entry.id),
  );
}

interface ReconciliationPageProps {
  searchParams?: Promise<{ filtro?: string }>;
}

export default async function ReconciliationPage({
  searchParams,
}: ReconciliationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [{ reconciliations, filters, selectedFilter }, currentUser, bankEntries] =
    await Promise.all([
      getReconciliationOverview(resolvedSearchParams?.filtro),
      getCurrentUser(),
      getBankEntries(),
    ]);
  const databaseEnabled = isDatabaseEnabled();
  const canClose = currentUser ? canCloseCompetencyReconciliation(currentUser) : false;
  const canReopen = currentUser
    ? canReopenCompetencyReconciliation(currentUser)
    : false;
  const canRegisterItem = currentUser
    ? canRegisterReconciliationItem(currentUser)
    : false;

  return (
    <TableCard
      title="Conciliacao"
      description="Comparacao entre extrato bancario, provisoes liquidas, diferencas e itens conciliatorios minimos da competencia. O modulo continua sem integracao bancaria automatica e sem workflow contabil pesado."
    >
      <div className="space-y-3">
        {!databaseEnabled ? (
          <div className="rounded-[1.3rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            O modo em memoria permanece somente leitura para fechamento,
            reabertura e registro de item conciliatorio.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.key}
              href={
                filter.key === "todas"
                  ? "/dashboard/reconciliation"
                  : `/dashboard/reconciliation?filtro=${filter.key}`
              }
              className={`rounded-full border px-3 py-2 text-sm transition ${
                selectedFilter === filter.key
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                  : "border-black/10 bg-white text-[var(--color-muted)] hover:border-black/20 hover:text-[var(--color-ink)]"
              }`}
            >
              {filter.label} ({filter.count})
            </Link>
          ))}
        </div>

        <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
          <table className="min-w-full divide-y divide-black/8 text-left">
            <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">Competencia</th>
                <th className="px-4 py-3">Saldos</th>
                <th className="px-4 py-3">Classificacao e prioridade</th>
                <th className="px-4 py-3">Situacao atual</th>
                <th className="px-4 py-3">Itens conciliatorios</th>
                <th className="px-4 py-3">Historico e proxima acao</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8 bg-white">
              {reconciliations.map((item: ReconciliationRecord) => {
                const availableBankEntries = getAvailableBankEntries(item, bankEntries);

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-[var(--color-ink)]">
                        {formatCompetency(item.competency)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Status tecnico atual: {item.competencyStatus}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-[var(--color-ink)]">
                      <p>Saldo bancario: {formatCurrency(item.bankBalance)}</p>
                      <p>Provisoes: {formatCurrency(item.provisionBalance)}</p>
                      <p className="text-[var(--color-warning)]">
                        Pendente de execucao: {formatCurrency(item.approvedPendingExecution)}
                      </p>
                      <p className="text-[var(--color-success)]">
                        Diferenca explicada: {formatCurrency(item.explainedDifference)}
                      </p>
                      <p className="text-[var(--color-danger)]">
                        Diferenca nao explicada: {formatCurrency(item.unexplainedDifference)}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <Badge tone={getPriorityTone(item)}>
                          prioridade {item.qualification.priorityLabel}
                        </Badge>
                        <Badge tone={getTrackingTone(item)}>
                          {item.qualification.trackingStateLabel}
                        </Badge>
                        <p className="text-sm font-medium text-[var(--color-ink)]">
                          {item.qualification.classificationLabel}
                        </p>
                        <p className="text-xs leading-5 text-[var(--color-muted)]">
                          {item.qualification.classificationReason}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <Badge tone={getFormalClosureTone(item)}>
                          {getFormalClosureLabel(item)}
                        </Badge>
                        <p className="text-sm font-medium text-[var(--color-ink)]">
                          {item.history.currentSituationLabel}
                        </p>
                        <p className="text-xs leading-5 text-[var(--color-muted)]">
                          {item.history.currentSituationReason}
                        </p>
                        <p className="text-xs leading-5 text-[var(--color-muted)]">
                          Fechamento minimo: {item.operationalClosure.reason}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2 text-sm text-[var(--color-muted)]">
                        <p>
                          Itens explicados registrados:{" "}
                          {item.differenceSummary.explainedItemsCount}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={getCoverageTone(item)}>
                            {item.differenceSummary.explainedCoverageStateLabel}
                          </Badge>
                          <Badge tone="neutral">
                            cobertura {item.differenceSummary.explainedCoveragePercentage}%
                          </Badge>
                          <Badge tone={getUnitemizedPriorityTone(item)}>
                            atencao remanescente{" "}
                            {item.differenceSummary.unitemizedBalancePriorityLabel}
                          </Badge>
                        </div>
                        <p>
                          Diferenca explicada com itemizacao minima:{" "}
                          {formatCurrency(item.differenceSummary.explainedItemsAmount)}
                        </p>
                        <p>
                          Diferenca explicada ainda sem item:{" "}
                          {formatCurrency(
                            item.differenceSummary.explainedBalanceStillUnitemized,
                          )}
                        </p>
                        <p>
                          Diferenca nao explicada remanescente:{" "}
                          {formatCurrency(item.differenceSummary.unexplainedAmount)}
                        </p>
                        <p>{item.differenceSummary.explainedCoverageReason}</p>
                        <p>
                          Origem operacional:{" "}
                          {item.differenceSummary.unitemizedBalanceOriginLabel}
                        </p>
                        <p>{item.differenceSummary.unitemizedBalanceOriginReason}</p>
                        <p>
                          Priorizacao visual:{" "}
                          {item.differenceSummary.unitemizedBalancePriorityLabel}
                        </p>
                        <p>{item.differenceSummary.unitemizedBalancePriorityReason}</p>
                        <p>
                          Revisao dirigida:{" "}
                          {item.differenceSummary.directedReviewRecommendation}
                        </p>
                        <p>{item.differenceSummary.directedReviewReason}</p>
                        <div className="space-y-2">
                          {item.items.map((reconciliationItem) => (
                            <div
                              key={reconciliationItem.id}
                              className="rounded-2xl border border-black/8 bg-[var(--color-surface)] px-3 py-2 text-xs leading-5"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge tone={getItemKindTone(reconciliationItem)}>
                                  {reconciliationItem.kindLabel}
                                </Badge>
                                <Badge tone="neutral">
                                  {reconciliationItem.source}
                                </Badge>
                              </div>
                              <p className="mt-2 font-semibold text-[var(--color-ink)]">
                                {formatCurrency(reconciliationItem.amount)}
                              </p>
                              <p>{reconciliationItem.summary}</p>
                              {reconciliationItem.bankEntryId ? (
                                <p>
                                  Lancamento: {reconciliationItem.bankEntryId} |{" "}
                                  {reconciliationItem.bankEntryDescription} |{" "}
                                  {reconciliationItem.bankEntryOccurredOn}
                                </p>
                              ) : null}
                              {reconciliationItem.justification ? (
                                <p>Justificativa: {reconciliationItem.justification}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2 text-sm text-[var(--color-muted)]">
                        <p>
                          Justificativa do fechamento:{" "}
                          {item.closureJustification ?? "nao registrada"}
                        </p>
                        <p>
                          Justificativa da reabertura:{" "}
                          {item.reopeningJustification ?? "nao registrada"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.qualification.pointings.map((pointing) => (
                            <Badge key={pointing.code} tone="neutral">
                              {pointing.label}
                            </Badge>
                          ))}
                        </div>
                        {item.history.lastRelevantOccurrence ? (
                          <p>
                            Ultima ocorrencia relevante:{" "}
                            {item.history.lastRelevantOccurrence.label} em{" "}
                            {item.history.lastRelevantOccurrence.happenedAt}
                          </p>
                        ) : (
                          <p>Ultima ocorrencia relevante: nao registrada</p>
                        )}
                        {item.history.timeline.slice(-3).map((event) => (
                          <div
                            key={event.id}
                            className="rounded-2xl border border-black/8 bg-[var(--color-surface)] px-3 py-2 text-xs leading-5"
                          >
                            <p className="font-semibold text-[var(--color-ink)]">
                              {event.label}
                            </p>
                            <p>{event.description}</p>
                            <p>
                              {event.actor} | {event.happenedAt}
                            </p>
                          </div>
                        ))}
                        <div className="rounded-2xl border border-black/8 bg-[var(--color-surface)] px-3 py-2 text-xs leading-5">
                          <Badge tone={getTrackingTone(item)}>
                            {item.history.recommendedActionLabel}
                          </Badge>
                          <p className="mt-2">
                            {item.history.recommendedActionReason}
                          </p>
                          <p>Prioridade operacional: {item.qualification.priorityReason}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-3 rounded-[1.3rem] border border-black/8 bg-[var(--color-surface)] px-4 py-4">
                        {item.formalClosure.canClose && canClose && databaseEnabled ? (
                          <CloseCompetencyForm competencyId={item.competencyId} />
                        ) : null}
                        {item.formalClosure.canReopen && canReopen && databaseEnabled ? (
                          <ReopenCompetencyForm competencyId={item.competencyId} />
                        ) : null}
                        {canRegisterItem &&
                        databaseEnabled &&
                        item.explainedDifference > 0 ? (
                          <RegisterReconciliationItemForm
                            reconciliationId={item.id}
                            bankEntries={availableBankEntries}
                          />
                        ) : null}
                        {!item.formalClosure.canClose &&
                        !item.formalClosure.canReopen &&
                        !(canRegisterItem && databaseEnabled && item.explainedDifference > 0) ? (
                          <p className="text-sm text-[var(--color-muted)]">
                            Nenhuma acao disponivel nesta leitura operacional.
                          </p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TableCard>
  );
}
