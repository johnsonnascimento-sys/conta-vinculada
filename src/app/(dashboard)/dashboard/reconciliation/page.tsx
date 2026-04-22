import Link from "next/link";
import type { ReconciliationRecord } from "@/features/platform/types";
import { getCurrentUser } from "@/features/auth/queries";
import { CloseCompetencyForm } from "@/features/reconciliation/components/close-competency-form";
import { ReopenCompetencyForm } from "@/features/reconciliation/components/reopen-competency-form";
import { getReconciliationOverview } from "@/features/reconciliation/queries";
import {
  canCloseCompetencyReconciliation,
  canReopenCompetencyReconciliation,
} from "@/features/reconciliation/policy";
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

interface ReconciliationPageProps {
  searchParams?: Promise<{ filtro?: string }>;
}

export default async function ReconciliationPage({
  searchParams,
}: ReconciliationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [{ reconciliations, filters, selectedFilter }, currentUser] =
    await Promise.all([
      getReconciliationOverview(resolvedSearchParams?.filtro),
      getCurrentUser(),
    ]);
  const databaseEnabled = isDatabaseEnabled();
  const canClose = currentUser ? canCloseCompetencyReconciliation(currentUser) : false;
  const canReopen = currentUser
    ? canReopenCompetencyReconciliation(currentUser)
    : false;

  return (
    <TableCard
      title="Conciliação"
      description="Comparação entre extrato bancario, provisoes liquidas, divergencias residuais e apontamentos operacionais minimos da competencia. O modulo continua sem integracao bancaria automatica e sem motor de tarefas."
    >
      <div className="space-y-3">
        {!databaseEnabled ? (
          <div className="rounded-[1.3rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            O modo em memoria permanece somente leitura para fechamento e
            reabertura formal da competencia.
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
                <th className="px-4 py-3">Apontamentos e historico</th>
                <th className="px-4 py-3">Proxima acao sugerida</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8 bg-white">
              {reconciliations.map((item: ReconciliationRecord) => (
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
                            {event.actor} • {event.happenedAt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <Badge tone={getTrackingTone(item)}>
                        {item.history.recommendedActionLabel}
                      </Badge>
                      <p className="text-xs leading-5 text-[var(--color-muted)]">
                        {item.history.recommendedActionReason}
                      </p>
                      <p className="text-xs leading-5 text-[var(--color-muted)]">
                        Prioridade operacional: {item.qualification.priorityReason}
                      </p>
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
                      {!item.formalClosure.canClose && !item.formalClosure.canReopen ? (
                        <p className="text-sm text-[var(--color-muted)]">
                          Nenhuma acao disponivel nesta leitura operacional.
                        </p>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TableCard>
  );
}
