import type { ReleaseRequest, ReleaseRequestItem } from "@/features/platform/types";
import { AdministrativeApprovalForm } from "@/features/releases/components/administrative-approval-form";
import { CreateReleaseRequestForm } from "@/features/releases/components/create-release-request-form";
import { FinancialPreparationForm } from "@/features/releases/components/financial-preparation-form";
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

function getAdministrativeApprovalStateLabel(request: ReleaseRequest) {
  if (request.workflow.administrativeApproval.state === "aprovada") {
    return "Aprovada administrativamente";
  }

  if (request.workflow.administrativeApproval.state === "aprovada_parcial") {
    return "Aprovada parcialmente na consolidação";
  }

  if (request.workflow.administrativeApproval.state === "rejeitada") {
    return "Rejeitada na consolidação administrativa";
  }

  if (request.workflow.administrativeApproval.state === "apta") {
    return "Pronta para aprovação administrativa";
  }

  return "Ainda não apta para aprovação administrativa";
}

function getFinancialPreparationStateLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.state === "preparada") {
    return "Preparo interno já registrado";
  }

  if (request.workflow.financialPreparation.state === "apta") {
    return "Pronta para preparo da futura execução";
  }

  return "Ainda não apta para preparo da futura execução";
}

function getBalanceCheckLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.balanceCheck === "suficiente") {
    return "Saldo suficiente para o valor apto";
  }

  if (request.workflow.financialPreparation.balanceCheck === "insuficiente") {
    return "Saldo insuficiente para o valor apto";
  }

  return "Saldo ainda não avaliado para esta etapa";
}

function getReconciliationCheckLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.reconciliationCheck === "regular") {
    return "Conciliação sem diferença não explicada";
  }

  if (
    request.workflow.financialPreparation.reconciliationCheck === "com_atencao"
  ) {
    return "Conciliação ainda com diferença não explicada";
  }

  return "Conciliação ainda não avaliada para esta etapa";
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
  const administrativelyApprovableRequestIds = new Set(
    boardData.administrativelyApprovableRequestIds,
  );
  const financiallyPreparableRequestIds = new Set(
    boardData.financiallyPreparableRequestIds,
  );

  return (
    <div className="space-y-4">
      <TableCard
        title="Criar solicitação de liberação"
        description="Primeiro fluxo transacional real do projeto: validação backend, autorização server-side, persistência Prisma e auditoria obrigatória."
      >
        <CreateReleaseRequestForm options={creationOptions} />
      </TableCard>

      <TableCard
        title="Fila de solicitações"
        description="Leitura consolidada das solicitações persistidas, mantendo compatibilidade com o modo híbrido mock/Prisma."
      >
        {!boardData.databaseEnabled ? (
          <div className="mb-4 rounded-[1.4rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-4 text-sm leading-6 text-[var(--color-danger)]">
            Sem `DATABASE_URL`, a fila continua disponível para leitura com base no
            mock. A criação permanece indisponível.
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
            const canApproveAdministratively =
              boardData.databaseEnabled &&
              administrativelyApprovableRequestIds.has(request.id) &&
              request.workflow.administrativeApproval.canApprove;
            const canPrepareFinancially =
              boardData.databaseEnabled &&
              financiallyPreparableRequestIds.has(request.id) &&
              request.workflow.financialPreparation.canPrepare;

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
                      Criada por {request.requestedBy} • Período{" "}
                      {formatCompetency(request.competencyStart)} a{" "}
                      {formatCompetency(request.competencyEnd)}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Movimentação: {request.movementMode.replaceAll("_", " ")}
                    </p>
                  </div>
                  <Badge tone={getRequestStatusTone(request.workflow.derivedStatus)}>
                    {getWorkflowLabel(request)}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
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
                      Pendências documentais
                    </span>
                    <strong className="mt-2 block text-lg text-[var(--color-ink)]">
                      {request.workflow.pendingDocumentCount}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Preparo financeiro
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getFinancialPreparationStateLabel(request)}
                    </p>
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

                <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Consolidação administrativa
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--color-muted)]">
                    <p>
                      Situação: {getAdministrativeApprovalStateLabel(request)}
                    </p>
                    <p>
                      Próxima leitura financeira:{" "}
                      {request.workflow.administrativeApproval.financialNextStep}
                    </p>
                    {request.workflow.administrativeApproval.reason ? (
                      <p>
                        Condição atual:{" "}
                        {request.workflow.administrativeApproval.reason}
                      </p>
                    ) : null}
                    {request.workflow.administrativeApproval.approver ? (
                      <p>
                        Último aprovador:{" "}
                        {request.workflow.administrativeApproval.approver}
                      </p>
                    ) : null}
                    {request.workflow.administrativeApproval.decidedAt ? (
                      <p>
                        Decidida em:{" "}
                        {formatDateTimeLabel(
                          request.workflow.administrativeApproval.decidedAt,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.administrativeApproval.notes ? (
                      <p>
                        Fundamentação registrada:{" "}
                        {request.workflow.administrativeApproval.notes}
                      </p>
                    ) : null}
                  </div>

                  {canApproveAdministratively ? (
                    <AdministrativeApprovalForm
                      requestId={request.id}
                      decisionState={request.workflow.decisionState}
                    />
                  ) : null}
                </div>

                <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Preparo da futura execução financeira
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--color-muted)]">
                    <p>
                      Situação: {getFinancialPreparationStateLabel(request)}
                    </p>
                    <p>
                      Valor apto à futura execução:{" "}
                      {formatCurrency(request.workflow.financialPreparation.eligibleAmount)}
                    </p>
                    <p>
                      Movimento esperado:{" "}
                      {request.workflow.financialPreparation.expectedMovement}
                    </p>
                    <p>
                      Evidências mínimas desta etapa:{" "}
                      {formatDocumentKinds(
                        request.workflow.financialPreparation.requiredEvidence,
                      )}
                    </p>
                    <p>
                      Evidências ainda faltantes:{" "}
                      {formatDocumentKinds(
                        request.workflow.financialPreparation.missingEvidence,
                      )}
                    </p>
                    <p>{getBalanceCheckLabel(request)}</p>
                    <p>{getReconciliationCheckLabel(request)}</p>
                    {request.workflow.financialPreparation.currentBalance !== undefined ? (
                      <p>
                        Saldo atual considerado:{" "}
                        {formatCurrency(
                          request.workflow.financialPreparation.currentBalance,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.approvedPendingExecution !==
                    undefined ? (
                      <p>
                        Valor já pendente na conciliação:{" "}
                        {formatCurrency(
                          request.workflow.financialPreparation
                            .approvedPendingExecution,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.unexplainedDifference !==
                    undefined ? (
                      <p>
                        Diferença não explicada considerada:{" "}
                        {formatCurrency(
                          request.workflow.financialPreparation
                            .unexplainedDifference,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.reason ? (
                      <p>
                        Condição atual:{" "}
                        {request.workflow.financialPreparation.reason}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.preparedBy ? (
                      <p>
                        Preparado por:{" "}
                        {request.workflow.financialPreparation.preparedBy}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.preparedAt ? (
                      <p>
                        Registro do preparo em:{" "}
                        {formatDateTimeLabel(
                          request.workflow.financialPreparation.preparedAt,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.notes ? (
                      <p>
                        Observações registradas:{" "}
                        {request.workflow.financialPreparation.notes}
                      </p>
                    ) : null}
                    <p>
                      Execução financeira efetiva registrada:{" "}
                      {request.workflow.financialPreparation
                        .effectiveExecutionRecorded
                        ? "sim"
                        : "não"}
                    </p>
                  </div>

                  {canPrepareFinancially ? (
                    <FinancialPreparationForm requestId={request.id} />
                  ) : null}
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
                            Competência {formatCompetency(item.competencyRef)} •
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

function formatDateTimeLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
