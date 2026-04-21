import type { ReleaseRequest, ReleaseRequestItem } from "@/features/platform/types";
import { CreateReleaseRequestForm } from "@/features/releases/components/create-release-request-form";
import { ReviewReleaseRequestForm } from "@/features/releases/components/review-release-request-form";
import { canReviewReleaseRequestItem } from "@/features/releases/policy";
import {
  getReleaseRequestCreationOptions,
  getReleaseRequestsBoardData,
} from "@/features/releases/queries";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCompetency, formatCurrency } from "@/shared/lib/formatters";

function getRequestStatusTone(status: ReleaseRequest["status"]) {
  if (status === "aprovada" || status === "liberada") {
    return "success" as const;
  }

  if (
    status === "enviada" ||
    status === "em_exigencia" ||
    status === "em_analise" ||
    status === "em_elaboracao" ||
    status === "aprovada_parcial"
  ) {
    return "warning" as const;
  }

  return "danger" as const;
}

function getWorkflowLabel(request: ReleaseRequest) {
  if (request.workflow.derivedStatus === "em_exigencia") {
    return "Em exigência documental";
  }

  if (request.workflow.derivedStatus === "em_analise") {
    return "Em análise";
  }

  if (request.workflow.derivedStatus === "aprovada") {
    return "Aprovada";
  }

  if (request.workflow.derivedStatus === "aprovada_parcial") {
    return "Aprovada parcialmente";
  }

  if (request.workflow.derivedStatus === "rejeitada") {
    return "Rejeitada";
  }

  if (request.workflow.derivedStatus === "liberada") {
    return "Liberada";
  }

  if (request.workflow.derivedStatus === "cancelada") {
    return "Cancelada";
  }

  if (request.workflow.derivedStatus === "em_elaboracao") {
    return "Em elaboração";
  }

  return "Aguardando análise";
}

function getDocumentStateLabel(request: ReleaseRequest) {
  if (request.workflow.documentState === "pendente") {
    return `${request.workflow.pendingDocumentCount} pendência(s) nesta etapa`;
  }

  return "Sem pendência documental desta etapa";
}

function getAnalysisStateLabel(request: ReleaseRequest) {
  if (request.workflow.analysisState === "em_exigencia") {
    return "Exigência documental aberta";
  }

  if (request.workflow.analysisState === "em_analise") {
    return "Análise administrativa em andamento";
  }

  if (request.workflow.analysisState === "concluida") {
    return "Análise concluída";
  }

  return "Aguardando início da análise";
}

function getDecisionStateLabel(request: ReleaseRequest) {
  if (request.workflow.decisionState === "aprovada") {
    return "Decisão agregada favorável";
  }

  if (request.workflow.decisionState === "aprovada_parcial") {
    return "Decisão agregada parcial";
  }

  if (request.workflow.decisionState === "rejeitada") {
    return "Decisão agregada desfavorável";
  }

  if (request.workflow.decisionState === "parcial") {
    return "Itens já analisados, sem consolidação final";
  }

  return "Ainda sem decisão agregada";
}

function getItemDecisionTone(decision: ReleaseRequestItem["decision"]) {
  if (decision === "aprovado") {
    return "success" as const;
  }

  if (decision === "pendente" || decision === "aprovado_parcial") {
    return "warning" as const;
  }

  return "danger" as const;
}

function formatDocumentKinds(values: string[]) {
  return values.length > 0 ? values.join(", ") : "nenhum";
}

function renderDocumentCategoryList(
  title: string,
  categories: ReleaseRequest["documentSummary"]["expectedByCategory"],
) {
  const entries = [
    ["Fato gerador", categories.fact],
    ["Cálculo", categories.calculation],
    ["Quitação", categories.settlement],
    ["Operação", categories.operation],
    ["Encerramento/sucessão", categories.closure],
  ] as const;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
        {title}
      </h3>
      <div className="grid gap-2">
        {entries.map(([label, values]) =>
          values.length > 0 ? (
            <p key={label} className="text-sm leading-6 text-[var(--color-muted)]">
              <strong className="text-[var(--color-ink)]">{label}:</strong>{" "}
              {formatDocumentKinds(values)}
            </p>
          ) : null,
        )}
      </div>
    </div>
  );
}

export default async function ReleasesPage() {
  const [creationOptions, boardData] = await Promise.all([
    getReleaseRequestCreationOptions(),
    getReleaseRequestsBoardData(),
  ]);
  const reviewableRequestIds = new Set(boardData.reviewableRequestIds);

  return (
    <div className="space-y-4">
      <TableCard
        title="Criar solicitacao de liberacao"
        description="Primeiro fluxo transacional real do projeto: validacao backend, autorizacao server-side, persistencia Prisma e auditoria obrigatoria."
      >
        <CreateReleaseRequestForm options={creationOptions} />
      </TableCard>

      <TableCard
        title="Fila de solicitacoes"
        description="Leitura consolidada das solicitacoes persistidas, mantendo compatibilidade com o modo hibrido mock/Prisma."
      >
        {!boardData.databaseEnabled ? (
          <div className="mb-4 rounded-[1.4rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-4 text-sm leading-6 text-[var(--color-danger)]">
            Sem `DATABASE_URL`, a fila continua disponivel para leitura com base
            no mock. A criacao permanece indisponivel.
          </div>
        ) : null}

        <div className="grid gap-3">
          {boardData.requests.map((request) => {
            const approvedAmount = request.items.reduce(
              (total, item) => total + item.approvedAmount,
              0,
            );
            const canReviewRequest =
              boardData.databaseEnabled && reviewableRequestIds.has(request.id);

            return (
              <div
                key={request.id}
                className="rounded-[1.5rem] border border-black/8 bg-white px-5 py-5 shadow-[0_16px_30px_rgba(17,32,47,0.06)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      {request.protocol}
                    </p>
                    <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                      {request.releaseType.replaceAll("_", " ")}
                    </h2>
                    <p className="text-sm text-[var(--color-muted)]">
                      Criada por {request.requestedBy} • Periodo{" "}
                      {formatCompetency(request.competencyStart)} a{" "}
                      {formatCompetency(request.competencyEnd)}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Movimentacao: {request.movementMode.replaceAll("_", " ")}
                    </p>
                  </div>
                  <Badge tone={getRequestStatusTone(request.workflow.derivedStatus)}>
                    {getWorkflowLabel(request)}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Valor solicitado
                    </span>
                    <strong className="mt-2 block text-lg text-[var(--color-ink)]">
                      {formatCurrency(request.requestedTotalAmount)}
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
                      {request.workflow.pendingDocumentCount}
                    </strong>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Exigência documental
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getDocumentStateLabel(request)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Análise
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getAnalysisStateLabel(request)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Decisão agregada
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getDecisionStateLabel(request)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {request.workflow.canAggregateDecision
                        ? "Todos os itens já têm decisão."
                        : `${request.workflow.pendingItemCount} item(ns) ainda aguardam decisão.`}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
                    {renderDocumentCategoryList(
                      "Documentos esperados nesta etapa",
                      request.documentSummary.expectedByCategory,
                    )}
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
                    {renderDocumentCategoryList(
                      "Pendências documentais desta etapa",
                      request.documentSummary.missingByCategory,
                    )}
                    {(request.documentSummary.deferredByCategory.operation.length > 0 ||
                      request.documentSummary.deferredByCategory.closure.length > 0) && (
                      <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                        Documentos previstos para etapa posterior:{" "}
                        {formatDocumentKinds([
                          ...request.documentSummary.deferredByCategory.operation,
                          ...request.documentSummary.deferredByCategory.closure,
                        ])}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Itens
                  </h3>

                  {request.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-[var(--color-ink)]">
                            {item.releaseRubric.replaceAll("_", " ")}
                          </h4>
                          <p className="text-sm text-[var(--color-muted)]">
                            Competencia {formatCompetency(item.competencyRef)} •
                            Empregado {item.employeeId}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            Fato gerador em {formatDateLabel(item.factOccurredOn)}
                          </p>
                        </div>
                        <Badge tone={getItemDecisionTone(item.decision)}>
                          {item.decision}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
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
                            Validado
                          </span>
                          <strong className="mt-2 block text-base text-[var(--color-ink)]">
                            {formatCurrency(item.validatedAmount)}
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

                      {item.calculationMemory?.notes ? (
                        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                          {item.calculationMemory.notes}
                        </p>
                      ) : null}

                      {canReviewRequest &&
                      canReviewReleaseRequestItem(
                        request.workflow.derivedStatus,
                        item.decision,
                      ) ? (
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

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
