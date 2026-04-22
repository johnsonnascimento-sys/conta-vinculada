import type { ReconciliationRecord } from "@/features/platform/types";
import { getCurrentUser } from "@/features/auth/queries";
import { CloseCompetencyForm } from "@/features/reconciliation/components/close-competency-form";
import { ReopenCompetencyForm } from "@/features/reconciliation/components/reopen-competency-form";
import {
  canCloseCompetencyReconciliation,
  canReopenCompetencyReconciliation,
} from "@/features/reconciliation/policy";
import { getReconciliations } from "@/server/repositories/platform.repository";
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

export default async function ReconciliationPage() {
  const [reconciliations, currentUser] = await Promise.all([
    getReconciliations(),
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
      description="Comparação entre extrato bancário, provisões líquidas, valores pendentes de execução e fechamento operacional da competência. O módulo continua sem integração bancária automática."
    >
      <div className="space-y-3">
        {!databaseEnabled ? (
          <div className="rounded-[1.3rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            O modo em memória permanece somente leitura para fechamento e
            reabertura formal da competência.
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
          <table className="min-w-full divide-y divide-black/8 text-left">
            <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">Competência</th>
                <th className="px-4 py-3">Saldos</th>
                <th className="px-4 py-3">Fechamento mínimo</th>
                <th className="px-4 py-3">Fechamento formal</th>
                <th className="px-4 py-3">Justificativas e ocorrências</th>
                <th className="px-4 py-3">Ações</th>
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
                      Status técnico atual: {item.competencyStatus}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-[var(--color-ink)]">
                    <p>Saldo bancário: {formatCurrency(item.bankBalance)}</p>
                    <p>Provisões: {formatCurrency(item.provisionBalance)}</p>
                    <p className="text-[var(--color-warning)]">
                      Pendente de execução:{" "}
                      {formatCurrency(item.approvedPendingExecution)}
                    </p>
                    <p className="text-[var(--color-success)]">
                      Diferença explicada: {formatCurrency(item.explainedDifference)}
                    </p>
                    <p className="text-[var(--color-danger)]">
                      Diferença não explicada:{" "}
                      {formatCurrency(item.unexplainedDifference)}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <Badge
                        tone={
                          item.operationalClosure.state ===
                          "pronta_para_fechamento_minimo"
                            ? "success"
                            : "warning"
                        }
                      >
                        {item.operationalClosure.state ===
                        "pronta_para_fechamento_minimo"
                          ? "pronta"
                          : "com pendências"}
                      </Badge>
                      <p className="text-xs leading-5 text-[var(--color-muted)]">
                        {item.operationalClosure.reason}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <Badge tone={getFormalClosureTone(item)}>
                        {getFormalClosureLabel(item)}
                      </Badge>
                      <p className="text-xs leading-5 text-[var(--color-muted)]">
                        {item.formalClosure.reason}
                      </p>
                      {item.closedAt ? (
                        <p className="text-xs text-[var(--color-muted)]">
                          Fechada em {item.closedAt} por {item.closedBy}
                        </p>
                      ) : null}
                      {item.reopenedAt ? (
                        <p className="text-xs text-[var(--color-muted)]">
                          Reaberta em {item.reopenedAt} por {item.reopenedBy}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2 text-sm text-[var(--color-muted)]">
                      <p>
                        Justificativa do fechamento:{" "}
                        {item.closureJustification ?? "não registrada"}
                      </p>
                      <p>
                        Justificativa da reabertura:{" "}
                        {item.reopeningJustification ?? "não registrada"}
                      </p>
                      <p>
                        Ocorrências mínimas: {item.occurrences.length}
                      </p>
                      {item.occurrences.slice(-2).map((occurrence) => (
                        <div
                          key={occurrence.id}
                          className="rounded-2xl border border-black/8 bg-[var(--color-surface)] px-3 py-2 text-xs leading-5"
                        >
                          <p className="font-semibold text-[var(--color-ink)]">
                            {occurrence.type}
                          </p>
                          <p>{occurrence.description}</p>
                          <p>
                            {occurrence.actor} • {occurrence.happenedAt}
                          </p>
                        </div>
                      ))}
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
                          Nenhuma ação disponível nesta leitura operacional.
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
