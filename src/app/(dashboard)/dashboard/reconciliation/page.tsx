import { getReconciliations } from "@/server/repositories/platform.repository";
import type { ReconciliationRecord } from "@/features/platform/types";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCompetency, formatCurrency } from "@/shared/lib/formatters";

export default async function ReconciliationPage() {
  const reconciliations = await getReconciliations();
  return (
    <TableCard
      title="Conciliação"
      description="Comparação entre extrato bancário, provisões líquidas, aprovações pendentes e diferenças classificadas."
    >
      <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
        <table className="min-w-full divide-y divide-black/8 text-left">
          <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Competência</th>
              <th className="px-4 py-3">Saldo bancário</th>
              <th className="px-4 py-3">Provisões</th>
              <th className="px-4 py-3">Aprovado pendente</th>
              <th className="px-4 py-3">Diferença explicada</th>
              <th className="px-4 py-3">Diferença não explicada</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8 bg-white">
            {reconciliations.map((item: ReconciliationRecord) => (
              <tr key={item.id}>
                <td className="px-4 py-4 font-semibold text-[var(--color-ink)]">{formatCompetency(item.competency)}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">{formatCurrency(item.bankBalance)}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">{formatCurrency(item.provisionBalance)}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-warning)]">{formatCurrency(item.approvedPendingExecution)}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-success)]">{formatCurrency(item.explainedDifference)}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-danger)]">{formatCurrency(item.unexplainedDifference)}</td>
                <td className="px-4 py-4">
                  <Badge tone={item.unexplainedDifference > 0 ? "danger" : "success"}>
                    {item.differenceType}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}
