import { notFound } from "next/navigation";
import { getContractDetail } from "@/features/contracts/queries";
import type {
  AuditEvent,
  BankEntry,
  Competency,
  Employee,
  EmployeeAllocation,
  ProvisionBalance,
  ReleaseRequest,
} from "@/features/platform/types";
import { Badge } from "@/shared/components/ui/badge";
import { MetricChip } from "@/shared/components/ui/metric-chip";
import { SectionCard } from "@/shared/components/ui/section-card";
import { TableCard } from "@/shared/components/ui/table-card";
import { formatCompetency, formatCurrency } from "@/shared/lib/formatters";

function formatDocumentKinds(values: string[]) {
  return values.length > 0 ? values.join(", ") : "nenhum";
}

function getRequestStatusLabel(request: ReleaseRequest) {
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

  return "Aguardando anÃ¡lise";
}

function getAdministrativeApprovalLabel(request: ReleaseRequest) {
  if (request.workflow.administrativeApproval.state === "aprovada") {
    return "aprovada administrativamente";
  }

  if (request.workflow.administrativeApproval.state === "aprovada_parcial") {
    return "aprovada parcialmente na consolidaÃ§Ã£o";
  }

  if (request.workflow.administrativeApproval.state === "rejeitada") {
    return "rejeitada na consolidaÃ§Ã£o administrativa";
  }

  if (request.workflow.administrativeApproval.state === "apta") {
    return "pronta para aprovaÃ§Ã£o administrativa";
  }

  return "ainda nÃ£o apta para aprovaÃ§Ã£o administrativa";
}

function getFinancialPreparationLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.state === "preparada") {
    return "preparo interno jÃ¡ registrado";
  }

  if (request.workflow.financialPreparation.state === "apta") {
    return "pronta para preparo da futura execuÃ§Ã£o";
  }

  return "ainda nÃ£o apta para preparo da futura execuÃ§Ã£o";
}

function getFinancialExecutionLabel(request: ReleaseRequest) {
  if (request.workflow.financialExecution.state === "executada") {
    return "execuÃ§Ã£o efetiva registrada";
  }

  if (request.workflow.financialExecution.state === "execucao_parcial") {
    return "execu??o financeira parcial registrada";
  }

  if (request.workflow.financialExecution.state === "aguardando_execucao") {
    return "preparada e aguardando execuÃ§Ã£o efetiva";
  }

  return "ainda nÃ£o apta para execuÃ§Ã£o efetiva";
}

interface ContractPageProps {
  params: Promise<{ contractId: string }>;
}

export default async function ContractDetailPage({ params }: ContractPageProps) {
  const { contractId } = await params;
  const detail = await getContractDetail(contractId);

  if (!detail) {
    notFound();
  }

  const totalProvisionBalance = detail.provisionBalances.reduce(
    (total: number, item: ProvisionBalance & { employee?: Employee }) =>
      total + item.balance,
    0,
  );
  const totalReservedBalance = detail.provisionBalances.reduce(
    (total: number, item: ProvisionBalance & { employee?: Employee }) =>
      total + item.reserved,
    0,
  );

  return (
    <div className="space-y-4">
      <SectionCard
        eyebrow={detail.contract.code}
        title={detail.contract.name}
        description={detail.contract.object}
      >
        <div className="grid gap-3 lg:grid-cols-5">
          <MetricChip
            label="Saldo bancÃ¡rio"
            value={formatCurrency(detail.account?.currentBalance ?? 0)}
          />
          <MetricChip
            label="ProvisÃµes lÃ­quidas"
            value={formatCurrency(totalProvisionBalance)}
          />
          <MetricChip
            label="Valor reservado"
            value={formatCurrency(totalReservedBalance)}
          />
          <MetricChip
            label="DiferenÃ§a nÃ£o explicada"
            value={formatCurrency(detail.reconciliation?.unexplainedDifference ?? 0)}
          />
          <div className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
            <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              SituaÃ§Ã£o do contrato
            </span>
            <div className="mt-2">
              <Badge tone={detail.contract.riskLevel === "alto" ? "danger" : "warning"}>
                {detail.contract.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              {detail.company?.tradeName}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <TableCard
          title="CompetÃªncias"
          description="Estados formais de processamento, fechamento e reabertura."
        >
          <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
            <table className="min-w-full divide-y divide-black/8 text-left">
              <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-3">CompetÃªncia</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Processado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8 bg-white">
                {detail.competencies.map((competency: Competency) => (
                  <tr key={competency.id}>
                    <td className="px-4 py-4 font-semibold text-[var(--color-ink)]">
                      {formatCompetency(competency.competency)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        tone={
                          competency.status === "reaberta"
                            ? "danger"
                            : competency.status === "conciliada" ||
                                competency.status === "fechada"
                              ? "success"
                              : "warning"
                        }
                      >
                        {competency.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--color-muted)]">
                      {competency.processedAt ?? "Pendente"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>

        <TableCard
          title="Empregados alocados"
          description="VÃ­nculo contratual temporal utilizado para cÃ¡lculo e elegibilidade de liberaÃ§Ã£o."
        >
          <div className="grid gap-3">
            {detail.employees.map(
              (allocation: EmployeeAllocation & { employee?: Employee }) => (
                <div
                  key={allocation.id}
                  className="rounded-[1.3rem] border border-black/8 bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                        {allocation.employee?.name}
                      </h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        {allocation.employee?.role} â€¢ {allocation.costCenter}
                      </p>
                    </div>
                    <Badge
                      tone={
                        allocation.employee?.status === "ativo"
                          ? "success"
                          : allocation.employee?.status === "afastado"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {allocation.employee?.status ?? "sem status"}
                    </Badge>
                  </div>
                </div>
              ),
            )}
          </div>
        </TableCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TableCard
          title="ProvisÃµes por empregado e rubrica"
          description="Saldo gerencial derivado, com separaÃ§Ã£o entre reservado para liberaÃ§Ã£o e baixado efetivamente."
        >
          <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
            <table className="min-w-full divide-y divide-black/8 text-left">
              <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-3">Empregado</th>
                  <th className="px-4 py-3">Rubrica</th>
                  <th className="px-4 py-3">Saldo</th>
                  <th className="px-4 py-3">Reservado</th>
                  <th className="px-4 py-3">Baixado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8 bg-white">
                {detail.provisionBalances.map(
                  (item: ProvisionBalance & { employee?: Employee }) => (
                    <tr key={`${item.employeeId}-${item.rubric}`}>
                      <td className="px-4 py-4 font-semibold text-[var(--color-ink)]">
                        {item.employee?.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--color-muted)]">
                        {item.rubric}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                        {formatCurrency(item.balance)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--color-warning)]">
                        {formatCurrency(item.reserved)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--color-success)]">
                        {formatCurrency(item.released)}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </TableCard>

        <TableCard
          title="Conta vinculada e conciliaÃ§Ã£o"
          description="Saldo bancÃ¡rio real, rendimentos globais e eventos vinculÃ¡veis Ã  reconciliaÃ§Ã£o."
        >
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricChip label="Banco" value={detail.account?.bankName ?? "-"} />
              <MetricChip
                label="Conta"
                value={`${detail.account?.branch} / ${detail.account?.accountNumber}`}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricChip
                label="DiferenÃ§a explicada"
                value={formatCurrency(detail.reconciliation?.explainedDifference ?? 0)}
              />
              <MetricChip
                label="DiferenÃ§a nÃ£o explicada"
                value={formatCurrency(detail.reconciliation?.unexplainedDifference ?? 0)}
              />
            </div>
            <div className="space-y-3 rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
              {detail.bankEntries.map((entry: BankEntry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-4 border-b border-black/8 pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {entry.description}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {entry.occurredOn}
                    </p>
                  </div>
                  <Badge
                    tone={
                      entry.type === "deposito" || entry.type === "rendimento"
                        ? "success"
                        : entry.type === "ajuste"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {formatCurrency(entry.amount)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TableCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TableCard
          title="SolicitaÃ§Ãµes de liberaÃ§Ã£o"
          description="No MVP, protocolo interno com checagem documental, decisÃ£o item a item, consolidaÃ§Ã£o administrativa e preparo da futura execuÃ§Ã£o."
        >
          <div className="grid gap-3">
            {detail.releaseRequests.map((request: ReleaseRequest) => (
              <div
                key={request.id}
                className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      {request.protocol}
                    </p>
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                      {request.items.length} item(ns) â€¢ {request.requestedBy}
                    </h3>
                  </div>
                  <Badge
                    tone={
                      request.workflow.derivedStatus === "aprovada" ||
                      request.workflow.derivedStatus === "liberada"
                        ? "success"
                        : request.workflow.derivedStatus === "aprovada_parcial" ||
                            request.workflow.derivedStatus === "em_analise" ||
                            request.workflow.derivedStatus === "enviada"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {getRequestStatusLabel(request)}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[var(--color-muted)]">
                  <p>
                    ExigÃªncia documental:{" "}
                    {request.workflow.documentState === "pendente"
                      ? `${request.workflow.pendingDocumentCount} pendÃªncia(s) na etapa`
                      : "sem pendÃªncia documental na etapa"}
                  </p>
                  <p>
                    AnÃ¡lise:{" "}
                    {request.workflow.analysisState === "concluida"
                      ? "concluÃ­da"
                      : request.workflow.analysisState === "em_exigencia"
                        ? "em exigÃªncia"
                        : request.workflow.analysisState === "em_analise"
                          ? "em andamento"
                          : "aguardando inÃ­cio"}
                  </p>
                  <p>
                    DecisÃ£o agregada:{" "}
                    {request.workflow.decisionState === "aprovada"
                      ? "aprovada"
                      : request.workflow.decisionState === "aprovada_parcial"
                        ? "aprovada parcialmente"
                        : request.workflow.decisionState === "rejeitada"
                          ? "rejeitada"
                          : request.workflow.decisionState === "parcial"
                            ? "em formaÃ§Ã£o"
                            : "ainda nÃ£o consolidada"}
                  </p>
                  <p>
                    AprovaÃ§Ã£o administrativa:{" "}
                    {getAdministrativeApprovalLabel(request)}
                  </p>
                  <p>
                    Preparo da futura execuÃ§Ã£o:{" "}
                    {getFinancialPreparationLabel(request)}
                  </p>
                  <p>
                    ExecuÃ§Ã£o financeira efetiva:{" "}
                    {getFinancialExecutionLabel(request)}
                  </p>
                  <p>
                    Valor apto Ã  futura execuÃ§Ã£o:{" "}
                    {formatCurrency(request.workflow.financialPreparation.eligibleAmount)}
                  </p>
                  <p>
                    Valor pendente de execuÃ§Ã£o:{" "}
                    {formatCurrency(request.workflow.financialExecution.pendingAmount)}
                  </p>
                  <p>
                    Movimento esperado:{" "}
                    {request.workflow.financialPreparation.expectedMovement}
                  </p>
                  <p>
                    EvidÃªncias mÃ­nimas:{" "}
                    {formatDocumentKinds(
                      request.workflow.financialPreparation.requiredEvidence,
                    )}
                  </p>
                  <p>
                    EvidÃªncias faltantes:{" "}
                    {formatDocumentKinds(
                      request.workflow.financialPreparation.missingEvidence,
                    )}
                  </p>
                  <p>
                    Leitura financeira:{" "}
                    {request.workflow.administrativeApproval.financialNextStep}
                  </p>
                  {request.workflow.financialPreparation.currentBalance !== undefined ? (
                    <p>
                      Saldo considerado:{" "}
                      {formatCurrency(
                        request.workflow.financialPreparation.currentBalance,
                      )}
                    </p>
                  ) : null}
                  {request.workflow.financialPreparation.approvedPendingExecution !==
                  undefined ? (
                    <p>
                      Pendente na conciliaÃ§Ã£o:{" "}
                      {formatCurrency(
                        request.workflow.financialPreparation
                          .approvedPendingExecution,
                      )}
                    </p>
                  ) : null}
                  <p>
                    Documentos esperados nesta etapa:{" "}
                    {formatDocumentKinds(request.requiredDocuments)}
                  </p>
                  <p>
                    PendÃªncias documentais:{" "}
                    {formatDocumentKinds(request.missingDocuments)}
                  </p>
                  {request.workflow.administrativeApproval.approver ? (
                    <p>
                      Ãšltimo aprovador:{" "}
                      {request.workflow.administrativeApproval.approver}
                    </p>
                  ) : null}
                  {request.workflow.financialPreparation.preparedBy ? (
                    <p>
                      Ãšltimo registro de preparo:{" "}
                      {request.workflow.financialPreparation.preparedBy}
                    </p>
                  ) : null}
                  <p>
                    SituaÃ§Ã£o detalhada da execuÃ§Ã£o:{" "}
                    {getFinancialExecutionLabel(request)}
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
                    Quantidade de execuÃ§Ãµes registradas:{" "}
                    {request.workflow.financialExecution.executionCount}
                  </p>
                  {request.workflow.financialExecution.lastExecutedAt ? (
                    <p>
                      Data da execuÃ§Ã£o:{" "}
                      {request.workflow.financialExecution.lastExecutedAt}
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
                  {request.documentSummary.deferredByCategory.operation.length > 0 ||
                  request.documentSummary.deferredByCategory.closure.length > 0 ? (
                    <p>
                      Documentos previstos para etapa posterior:{" "}
                      {formatDocumentKinds([
                        ...request.documentSummary.deferredByCategory.operation,
                        ...request.documentSummary.deferredByCategory.closure,
                      ])}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </TableCard>

        <TableCard
          title="Trilha de auditoria"
          description="HistÃ³rico transacional e decisÃ³rio preservado para anÃ¡lise interna e auditoria."
        >
          <div className="space-y-3">
            {detail.auditEvents.map((event: AuditEvent) => (
              <div
                key={event.id}
                className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {event.action}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {event.actor} â€¢ {event.happenedAt}
                    </p>
                  </div>
                  <Badge tone="neutral">{event.entity}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  {event.details}
                </p>
              </div>
            ))}
          </div>
        </TableCard>
      </div>
    </div>
  );
}

