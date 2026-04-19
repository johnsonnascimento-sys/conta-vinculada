import type { ReleaseRequest, ReleaseRequestItem } from "@/features/platform/types";
import { CreateReleaseRequestForm } from "@/features/releases/components/create-release-request-form";
import {
  getReleaseRequestCreationOptions,
  getReleaseRequestsBoard,
} from "@/features/releases/queries";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCurrency } from "@/shared/lib/formatters";

export default async function ReleasesPage() {
  const [releaseRequests, creationOptions] = await Promise.all([
    getReleaseRequestsBoard(),
    getReleaseRequestCreationOptions(),
  ]);

  return (
    <div className="space-y-4">
      <TableCard
        title="Iniciar solicitacao de liberacao"
        description="Primeiro fluxo transacional formalizado do projeto. Nesta etapa, a solicitacao nasce em elaboracao com validacao, autorizacao backend e auditoria minima."
      >
        <CreateReleaseRequestForm options={creationOptions} />
      </TableCard>

      <TableCard
        title="Solicitacoes de liberacao"
        description="Fila unica do MVP interno, com checagem documental, cobertura gerencial e saldo bancario."
      >
        <div className="grid gap-3">
          {releaseRequests.map((request: ReleaseRequest) => {
            const requestedAmount = request.items.reduce(
              (total: number, item: ReleaseRequestItem) => total + item.requestedAmount,
              0,
            );
            const approvedAmount = request.items.reduce(
              (total: number, item: ReleaseRequestItem) => total + item.approvedAmount,
              0,
            );

            return (
              <div key={request.id} className="rounded-[1.5rem] border border-black/8 bg-white px-5 py-5 shadow-[0_16px_30px_rgba(17,32,47,0.06)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      {request.protocol}
                    </p>
                    <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                      {request.requestedBy}
                    </h2>
                    <p className="text-sm text-[var(--color-muted)]">
                      Analista: {request.analyst ?? "pendente"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      request.status === "aprovada" || request.status === "liberada"
                        ? "success"
                        : request.status === "aprovada_parcial" ||
                            request.status === "em_analise"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Valor solicitado
                    </span>
                    <strong className="mt-2 block text-lg text-[var(--color-ink)]">
                      {formatCurrency(requestedAmount)}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Valor aprovado
                    </span>
                    <strong className="mt-2 block text-lg text-[var(--color-ink)]">
                      {formatCurrency(approvedAmount)}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Pendencias documentais
                    </span>
                    <strong className="mt-2 block text-lg text-[var(--color-ink)]">
                      {request.missingDocuments.length}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TableCard>
    </div>
  );
}
