import type { ReleaseRequest, ReleaseRequestItem } from "@/features/platform/types";
import { CreateReleaseRequestForm } from "@/features/releases/components/create-release-request-form";
import { ReviewReleaseRequestForm } from "@/features/releases/components/review-release-request-form";
import {
  getReleaseRequestCreationOptions,
  getReleaseRequestsBoardData,
} from "@/features/releases/queries";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCurrency } from "@/shared/lib/formatters";

function getRequestStatusTone(status: ReleaseRequest["status"]) {
  if (status === "aprovada" || status === "liberada") {
    return "success" as const;
  }

  if (
    status === "aprovada_parcial" ||
    status === "em_analise" ||
    status === "em_elaboracao"
  ) {
    return "warning" as const;
  }

  return "danger" as const;
}

function getItemDecisionTone(decision: ReleaseRequestItem["decision"]) {
  if (decision === "aprovado") {
    return "success" as const;
  }

  if (decision === "aprovado_parcial" || decision === "pendente") {
    return "warning" as const;
  }

  return "danger" as const;
}

export default async function ReleasesPage() {
  const [creationOptions, boardData] = await Promise.all([
    getReleaseRequestCreationOptions(),
    getReleaseRequestsBoardData(),
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
        description="Fila unica do MVP interno, agora com decisao minima por item para iniciar a etapa de analise sem abrir o escopo de execucao financeira."
      >
        {!boardData.databaseEnabled ? (
          <div className="mb-4 rounded-[1.4rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-4 text-sm leading-6 text-[var(--color-danger)]">
            A analise de solicitacoes exige `DATABASE_URL`. Sem banco, a fila
            permanece disponivel apenas para leitura.
          </div>
        ) : null}

        <div className="grid gap-3">
          {boardData.requests.map((request: ReleaseRequest) => {
            const requestedAmount = request.items.reduce(
              (total: number, item: ReleaseRequestItem) => total + item.requestedAmount,
              0,
            );
            const approvedAmount = request.items.reduce(
              (total: number, item: ReleaseRequestItem) => total + item.approvedAmount,
              0,
            );
            const canReviewRequest = boardData.reviewableRequestIds.includes(request.id);
            const reviewClosed =
              request.status === "aprovada" ||
              request.status === "aprovada_parcial" ||
              request.status === "rejeitada" ||
              request.status === "liberada" ||
              request.status === "cancelada";

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
                  <Badge tone={getRequestStatusTone(request.status)}>
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

                <div className="mt-5 grid gap-4">
                  {request.items.map((item: ReleaseRequestItem) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-[var(--color-ink)]">
                            {item.rubric}
                          </h3>
                          <p className="text-sm text-[var(--color-muted)]">
                            Competencia {item.competency} • Empregado {item.employeeId}
                          </p>
                        </div>
                        <Badge tone={getItemDecisionTone(item.decision)}>
                          {item.decision}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                            Solicitado
                          </span>
                          <strong className="mt-2 block text-base text-[var(--color-ink)]">
                            {formatCurrency(item.requestedAmount)}
                          </strong>
                        </div>
                        <div>
                          <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                            Aprovado
                          </span>
                          <strong className="mt-2 block text-base text-[var(--color-ink)]">
                            {formatCurrency(item.approvedAmount)}
                          </strong>
                        </div>
                      </div>

                      {boardData.databaseEnabled && canReviewRequest && !reviewClosed ? (
                        <ReviewReleaseRequestForm
                          requestId={request.id}
                          itemId={item.id}
                          requestedAmount={item.requestedAmount}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </TableCard>
    </div>
  );
}
