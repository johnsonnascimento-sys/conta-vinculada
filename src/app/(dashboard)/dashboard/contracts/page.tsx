import Link from "next/link";
import { getContractsOverview } from "@/features/contracts/queries";
import type { Contract } from "@/features/platform/types";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCurrency } from "@/shared/lib/formatters";

export default async function ContractsPage() {
  const contracts = await getContractsOverview();

  return (
    <TableCard
      title="Contratos"
      description="Visão consolidada por contrato com saldo bancário, provisões, reservas e diferença conciliatória."
    >
      <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
        <table className="min-w-full divide-y divide-black/8 text-left">
          <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Contrato</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Saldo bancário</th>
              <th className="px-4 py-3">Provisões</th>
              <th className="px-4 py-3">Reservado</th>
              <th className="px-4 py-3">Diferença</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8 bg-white">
            {contracts.map((contract: Contract & { companyName: string; bankBalance: number; provisionBalance: number; reservedBalance: number; unexplainedDifference: number; }) => (
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
                <td className="px-4 py-4">
                  <Badge tone={contract.unexplainedDifference > 0 ? "danger" : "success"}>
                    {formatCurrency(contract.unexplainedDifference)}
                  </Badge>
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
