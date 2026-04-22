import type { ReleaseRequest, ReleaseRequestItem } from "@/features/platform/types";
import { AdministrativeApprovalForm } from "@/features/releases/components/administrative-approval-form";
import { CreateReleaseRequestForm } from "@/features/releases/components/create-release-request-form";
import { FinancialExecutionForm } from "@/features/releases/components/financial-execution-form";
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
    return "Em exigÃªncia documental";
  }

  if (request.workflow.derivedStatus === "em_analise") {
    return "Em anÃ¡lise";
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
    return "Em elaboraÃ§Ã£o";
  }

  return "Aguardando anÃ¡lise";
}

function getDocumentStateLabel(request: ReleaseRequest) {
  if (request.workflow.documentState === "pendente") {
    return `${request.workflow.pendingDocumentCount} pendÃªncia(s) nesta etapa`;
  }

  return "Sem pendÃªncia documental desta etapa";
}

function getAnalysisStateLabel(request: ReleaseRequest) {
  if (request.workflow.analysisState === "em_exigencia") {
    return "ExigÃªncia documental aberta";
  }

  if (request.workflow.analysisState === "em_analise") {
    return "AnÃ¡lise administrativa em andamento";
  }

  if (request.workflow.analysisState === "concluida") {
    return "AnÃ¡lise concluÃ­da";
  }

  return "Aguardando inÃ­cio da anÃ¡lise";
}

function getDecisionStateLabel(request: ReleaseRequest) {
  if (request.workflow.decisionState === "aprovada") {
    return "DecisÃ£o agregada favorÃ¡vel";
  }

  if (request.workflow.decisionState === "aprovada_parcial") {
    return "DecisÃ£o agregada parcial";
  }

  if (request.workflow.decisionState === "rejeitada") {
    return "DecisÃ£o agregada desfavorÃ¡vel";
  }

  if (request.workflow.decisionState === "parcial") {
    return "Itens jÃ¡ analisados, sem consolidaÃ§Ã£o final";
  }

  return "Ainda sem decisÃ£o agregada";
}

function getAdministrativeApprovalStateLabel(request: ReleaseRequest) {
  if (request.workflow.administrativeApproval.state === "aprovada") {
    return "Aprovada administrativamente";
  }

  if (request.workflow.administrativeApproval.state === "aprovada_parcial") {
    return "Aprovada parcialmente na consolidaÃ§Ã£o";
  }

  if (request.workflow.administrativeApproval.state === "rejeitada") {
    return "Rejeitada na consolidaÃ§Ã£o administrativa";
  }

  if (request.workflow.administrativeApproval.state === "apta") {
    return "Pronta para aprovaÃ§Ã£o administrativa";
  }

  return "Ainda nÃ£o apta para aprovaÃ§Ã£o administrativa";
}

function getFinancialPreparationStateLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.state === "preparada") {
    return "Preparo interno jÃ¡ registrado";
  }

  if (request.workflow.financialPreparation.state === "apta") {
    return "Pronta para preparo da futura execuÃ§Ã£o";
  }

  return "Ainda nÃ£o apta para preparo da futura execuÃ§Ã£o";
}

function getFinancialExecutionStateLabel(request: ReleaseRequest) {
  if (request.workflow.financialExecution.state === "executada") {
    return "ExecuÃ§Ã£o financeira efetiva registrada";
  }

  if (request.workflow.financialExecution.state === "execucao_parcial") {
    return "Execu??o financeira parcial registrada";
  }

  if (request.workflow.financialExecution.state === "aguardando_execucao") {
    return "Preparada e aguardando execuÃ§Ã£o efetiva";
  }

  return "Ainda nÃ£o apta para execuÃ§Ã£o efetiva";
}

function getBalanceCheckLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.balanceCheck === "suficiente") {
    return "Saldo suficiente para o valor apto";
  }

  if (request.workflow.financialPreparation.balanceCheck === "insuficiente") {
    return "Saldo insuficiente para o valor apto";
  }

  return "Saldo ainda nÃ£o avaliado para esta etapa";
}

function getReconciliationCheckLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.reconciliationCheck === "regular") {
    return "ConciliaÃ§Ã£o sem diferenÃ§a nÃ£o explicada";
  }

  if (
    request.workflow.financialPreparation.reconciliationCheck === "com_atencao"
  ) {
    return "ConciliaÃ§Ã£o ainda com diferenÃ§a nÃ£o explicada";
  }

  return "ConciliaÃ§Ã£o ainda nÃ£o avaliada para esta etapa";
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
    ["CÃ¡lculo", categories.calculation],
    ["QuitaÃ§Ã£o", categories.settlement],
    ["OperaÃ§Ã£o", categories.operation],
    ["Encerramento/sucessÃ£o", categories.closure],
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
  const financiallyExecutableRequestIds = new Set(
    boardData.financiallyExecutableRequestIds,
  );

  return (
    <div className="space-y-4">
      <TableCard
        title="Criar solicitaÃ§Ã£o de liberaÃ§Ã£o"
        description="Primeiro fluxo transacional real do projeto: validaÃ§Ã£o backend, autorizaÃ§Ã£o server-side, persistÃªncia Prisma e auditoria obrigatÃ³ria."
      >
        <CreateReleaseRequestForm options={creationOptions} />
      </TableCard>

      <TableCard
        title="Fila de solicitaÃ§Ãµes"
        description="Leitura consolidada das solicitaÃ§Ãµes persistidas, mantendo compatibilidade com o modo hÃ­brido mock/Prisma."
      >
        {!boardData.databaseEnabled ? (
          <div className="mb-4 rounded-[1.4rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-4 text-sm leading-6 text-[var(--color-danger)]">
            Sem `DATABASE_URL`, a fila continua disponÃ­vel para leitura com base no
            mock. A criaÃ§Ã£o permanece indisponÃ­vel.
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
            const executableBankEntries =
              boardData.executableBankEntriesByRequestId[request.id] ?? [];
            const canExecuteFinancially =
              boardData.databaseEnabled &&
              financiallyExecutableRequestIds.has(request.id) &&
              request.workflow.financialExecution.canExecute &&
              executableBankEntries.length > 0;

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
                      Criada por {request.requestedBy} â€¢ PerÃ­odo{" "}
                      {formatCompetency(request.competencyStart)} a{" "}
                      {formatCompetency(request.competencyEnd)}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      MovimentaÃ§Ã£o: {request.movementMode.replaceAll("_", " ")}
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
                      PendÃªncias documentais
                    </span>
                    <strong className="mt-2 block text-lg text-[var(--color-ink)]">
                      {request.workflow.pendingDocumentCount}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      ExecuÃ§Ã£o efetiva
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getFinancialExecutionStateLabel(request)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      ExigÃªncia documental
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getDocumentStateLabel(request)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      AnÃ¡lise
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getAnalysisStateLabel(request)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      DecisÃ£o agregada
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      {getDecisionStateLabel(request)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {request.workflow.canAggregateDecision
                        ? "Todos os itens jÃ¡ tÃªm decisÃ£o."
                        : `${request.workflow.pendingItemCount} item(ns) ainda aguardam decisÃ£o.`}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    ConsolidaÃ§Ã£o administrativa
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--color-muted)]">
                    <p>
                      SituaÃ§Ã£o: {getAdministrativeApprovalStateLabel(request)}
                    </p>
                    <p>
                      PrÃ³xima leitura financeira:{" "}
                      {request.workflow.administrativeApproval.financialNextStep}
                    </p>
                    {request.workflow.administrativeApproval.reason ? (
                      <p>
                        CondiÃ§Ã£o atual:{" "}
                        {request.workflow.administrativeApproval.reason}
                      </p>
                    ) : null}
                    {request.workflow.administrativeApproval.approver ? (
                      <p>
                        Ãšltimo aprovador:{" "}
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
                        FundamentaÃ§Ã£o registrada:{" "}
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
                    Preparo da futura execuÃ§Ã£o financeira
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--color-muted)]">
                    <p>
                      SituaÃ§Ã£o: {getFinancialPreparationStateLabel(request)}
                    </p>
                    <p>
                      Valor apto Ã  futura execuÃ§Ã£o:{" "}
                      {formatCurrency(request.workflow.financialPreparation.eligibleAmount)}
                    </p>
                    <p>
                      Movimento esperado:{" "}
                      {request.workflow.financialPreparation.expectedMovement}
                    </p>
                    <p>
                      EvidÃªncias mÃ­nimas desta etapa:{" "}
                      {formatDocumentKinds(
                        request.workflow.financialPreparation.requiredEvidence,
                      )}
                    </p>
                    <p>
                      EvidÃªncias ainda faltantes:{" "}
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
                        Valor jÃ¡ pendente na conciliaÃ§Ã£o:{" "}
                        {formatCurrency(
                          request.workflow.financialPreparation
                            .approvedPendingExecution,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.unexplainedDifference !==
                    undefined ? (
                      <p>
                        DiferenÃ§a nÃ£o explicada considerada:{" "}
                        {formatCurrency(
                          request.workflow.financialPreparation
                            .unexplainedDifference,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.financialPreparation.reason ? (
                      <p>
                        CondiÃ§Ã£o atual:{" "}
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
                        ObservaÃ§Ãµes registradas:{" "}
                        {request.workflow.financialPreparation.notes}
                      </p>
                    ) : null}
                  </div>

                  {canPrepareFinancially ? (
                    <FinancialPreparationForm requestId={request.id} />
                  ) : null}
                </div>

                <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    ExecuÃ§Ã£o financeira efetiva
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--color-muted)]">
                    <p>
                      SituaÃ§Ã£o: {getFinancialExecutionStateLabel(request)}
                    </p>
                    <p>
                      Valor total aprovado:{" "}
                      {formatCurrency(request.workflow.financialExecution.approvedAmount)}
                    </p>
                    <p>
                      Valor executado acumulado:{" "}
                      {formatCurrency(request.workflow.financialExecution.executedAmount)}
                    </p>
                    <p>
                      Valor pendente de execuÃ§Ã£o:{" "}
                      {formatCurrency(request.workflow.financialExecution.pendingAmount)}
                    </p>
                    <p>
                      Quantidade de execuÃ§Ãµes registradas:{" "}
                      {request.workflow.financialExecution.executionCount}
                    </p>
                    {request.workflow.financialExecution.lastExecutedAt ? (
                      <p>
                        Data da execuÃ§Ã£o:{" "}
                        {formatDateTimeLabel(
                          request.workflow.financialExecution.lastExecutedAt,
                        )}
                      </p>
                    ) : null}
                    {request.workflow.financialExecution.lastBankEntryId ? (
                      <p>
                        LanÃ§amento bancÃ¡rio vinculado:{" "}
                        {request.workflow.financialExecution.lastBankEntryId}
                        {request.workflow.financialExecution.lastBankEntryDescription
                          ? ` â€¢ ${request.workflow.financialExecution.lastBankEntryDescription}`
                          : ""}
                      </p>
                    ) : null}
                    {request.workflow.financialExecution.reason ? (
                      <p>
                        CondiÃ§Ã£o atual: {request.workflow.financialExecution.reason}
                      </p>
                    ) : null}
                    <p>
                      Esta etapa registra a execuÃ§Ã£o efetiva com vÃ­nculo a
                      lanÃ§amento bancÃ¡rio jÃ¡ existente e nÃ£o substitui a leitura
                      do preparo financeiro.
                    </p>
                    {request.workflow.financialExecution.canExecute &&
                    executableBankEntries.length === 0 ? (
                      <p>
                        Ainda nÃ£o hÃ¡ lanÃ§amento bancÃ¡rio de liberaÃ§Ã£o compatÃ­vel
                        disponÃ­vel para vincular esta solicitaÃ§Ã£o.
                      </p>
                    ) : null}
                  </div>

                  {canExecuteFinancially ? (
                    <FinancialExecutionForm
                      requestId={request.id}
                      bankEntries={executableBankEntries}
                    />
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
                      "PendÃªncias documentais desta etapa",
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
                            CompetÃªncia {formatCompetency(item.competencyRef)} â€¢
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

