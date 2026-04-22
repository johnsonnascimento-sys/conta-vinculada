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

  return "Aguardando análise";
}

function getAdministrativeApprovalLabel(request: ReleaseRequest) {
  if (request.workflow.administrativeApproval.state === "aprovada") {
    return "aprovada administrativamente";
  }

  if (request.workflow.administrativeApproval.state === "aprovada_parcial") {
    return "aprovada parcialmente na consolidação";
  }

  if (request.workflow.administrativeApproval.state === "rejeitada") {
    return "rejeitada na consolidação administrativa";
  }

  if (request.workflow.administrativeApproval.state === "apta") {
    return "pronta para aprovação administrativa";
  }

  return "ainda não apta para aprovação administrativa";
}

function getFinancialPreparationLabel(request: ReleaseRequest) {
  if (request.workflow.financialPreparation.state === "preparada") {
    return "preparo interno já registrado";
  }

  if (request.workflow.financialPreparation.state === "apta") {
    return "pronta para preparo da futura execução";
  }

  return "ainda não apta para preparo da futura execução";
}

function getFinancialExecutionLabel(request: ReleaseRequest) {
  if (request.workflow.financialExecution.state === "executada") {
    return "execução efetiva registrada";
  }

  if (request.workflow.financialExecution.state === "aguardando_execucao") {
    return "preparada e aguardando execução efetiva";
  }

  return "ainda não apta para execução efetiva";
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
            label="Saldo bancário"
            value={formatCurrency(detail.account?.currentBalance ?? 0)}
          />
          <MetricChip
            label="Provisões líquidas"
            value={formatCurrency(totalProvisionBalance)}
          />
          <MetricChip
            label="Valor reservado"
            value={formatCurrency(totalReservedBalance)}
          />
          <MetricChip
            label="Diferença não explicada"
            value={formatCurrency(detail.reconciliation?.unexplainedDifference ?? 0)}
          />
          <div className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
            <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Situação do contrato
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
          title="Competências"
          description="Estados formais de processamento, fechamento e reabertura."
        >
          <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
            <table className="min-w-full divide-y divide-black/8 text-left">
              <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-3">Competência</th>
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
          description="Vínculo contratual temporal utilizado para cálculo e elegibilidade de liberação."
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
                        {allocation.employee?.role} • {allocation.costCenter}
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
          title="Provisões por empregado e rubrica"
          description="Saldo gerencial derivado, com separação entre reservado para liberação e baixado efetivamente."
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
          title="Conta vinculada e conciliação"
          description="Saldo bancário real, rendimentos globais e eventos vinculáveis à reconciliação."
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
                label="Diferença explicada"
                value={formatCurrency(detail.reconciliation?.explainedDifference ?? 0)}
              />
              <MetricChip
                label="Diferença não explicada"
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
          title="Solicitações de liberação"
          description="No MVP, protocolo interno com checagem documental, decisão item a item, consolidação administrativa e preparo da futura execução."
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
                      {request.items.length} item(ns) • {request.requestedBy}
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
                    Exigência documental:{" "}
                    {request.workflow.documentState === "pendente"
                      ? `${request.workflow.pendingDocumentCount} pendência(s) na etapa`
                      : "sem pendência documental na etapa"}
                  </p>
                  <p>
                    Análise:{" "}
                    {request.workflow.analysisState === "concluida"
                      ? "concluída"
                      : request.workflow.analysisState === "em_exigencia"
                        ? "em exigência"
                        : request.workflow.analysisState === "em_analise"
                          ? "em andamento"
                          : "aguardando início"}
                  </p>
                  <p>
                    Decisão agregada:{" "}
                    {request.workflow.decisionState === "aprovada"
                      ? "aprovada"
                      : request.workflow.decisionState === "aprovada_parcial"
                        ? "aprovada parcialmente"
                        : request.workflow.decisionState === "rejeitada"
                          ? "rejeitada"
                          : request.workflow.decisionState === "parcial"
                            ? "em formação"
                            : "ainda não consolidada"}
                  </p>
                  <p>
                    Aprovação administrativa:{" "}
                    {getAdministrativeApprovalLabel(request)}
                  </p>
                  <p>
                    Preparo da futura execução:{" "}
                    {getFinancialPreparationLabel(request)}
                  </p>
                  <p>
                    Execução financeira efetiva:{" "}
                    {getFinancialExecutionLabel(request)}
                  </p>
                  <p>
                    Valor apto à futura execução:{" "}
                    {formatCurrency(request.workflow.financialPreparation.eligibleAmount)}
                  </p>
                  <p>
                    Valor pendente de execução:{" "}
                    {formatCurrency(request.workflow.financialExecution.pendingAmount)}
                  </p>
                  <p>
                    Movimento esperado:{" "}
                    {request.workflow.financialPreparation.expectedMovement}
                  </p>
                  <p>
                    Evidências mínimas:{" "}
                    {formatDocumentKinds(
                      request.workflow.financialPreparation.requiredEvidence,
                    )}
                  </p>
                  <p>
                    Evidências faltantes:{" "}
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
                      Pendente na conciliação:{" "}
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
                    Pendências documentais:{" "}
                    {formatDocumentKinds(request.missingDocuments)}
                  </p>
                  {request.workflow.administrativeApproval.approver ? (
                    <p>
                      Último aprovador:{" "}
                      {request.workflow.administrativeApproval.approver}
                    </p>
                  ) : null}
                  {request.workflow.financialPreparation.preparedBy ? (
                    <p>
                      Último registro de preparo:{" "}
                      {request.workflow.financialPreparation.preparedBy}
                    </p>
                  ) : null}
                  <p>
                    Execução financeira efetiva registrada:{" "}
                    {request.workflow.financialPreparation.effectiveExecutionRecorded
                      ? "sim"
                      : "não"}
                  </p>
                  <p>
                    Situação detalhada da execução:{" "}
                    {getFinancialExecutionLabel(request)}
                  </p>
                  {request.workflow.financialExecution.executedAmount !== undefined ? (
                    <p>
                      Valor executado:{" "}
                      {formatCurrency(
                        request.workflow.financialExecution.executedAmount,
                      )}
                    </p>
                  ) : null}
                  {request.workflow.financialExecution.executedAt ? (
                    <p>
                      Data da execução:{" "}
                      {request.workflow.financialExecution.executedAt}
                    </p>
                  ) : null}
                  {request.workflow.financialExecution.bankEntryId ? (
                    <p>
                      Lançamento bancário vinculado:{" "}
                      {request.workflow.financialExecution.bankEntryId}
                      {request.workflow.financialExecution.bankEntryDescription
                        ? ` • ${request.workflow.financialExecution.bankEntryDescription}`
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
          description="Histórico transacional e decisório preservado para análise interna e auditoria."
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
                      {event.actor} • {event.happenedAt}
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
