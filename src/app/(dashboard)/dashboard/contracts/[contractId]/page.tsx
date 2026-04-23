import { notFound } from "next/navigation";
import { getContractDetail } from "@/features/contracts/queries";
import type {
  AuditEvent,
  BankEntry,
  Competency,
  Employee,
  EmployeeAllocation,
  ProvisionBalance,
  ReconciliationRecord,
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

function getCompetencyFormalLabel(reconciliation?: ReconciliationRecord) {
  if (!reconciliation) {
    return "aberta";
  }

  if (reconciliation.formalClosure.state === "apta_para_fechamento") {
    return "apta ao fechamento";
  }

  return reconciliation.formalClosure.state;
}

function getCompetencyRecommendedActionTone(reconciliation: ReconciliationRecord) {
  if (reconciliation.history.recommendedAction === "apta_para_fechamento") {
    return "success" as const;
  }

  if (
    reconciliation.history.recommendedAction === "verificar_divergencia_residual" ||
    reconciliation.history.recommendedAction === "revisar_justificativa"
  ) {
    return "danger" as const;
  }

  if (reconciliation.history.recommendedAction === "reavaliar_apos_reabertura") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getCompetencyPriorityTone(reconciliation: ReconciliationRecord) {
  if (reconciliation.qualification.priority === "alta") {
    return "danger" as const;
  }

  if (reconciliation.qualification.priority === "media") {
    return "warning" as const;
  }

  return "success" as const;
}

function getReconciliationItemTone(item: ReconciliationRecord["items"][number]) {
  return item.kind === "diferenca_explicada" ? "success" as const : "danger" as const;
}

function getCoverageTone(reconciliation: ReconciliationRecord) {
  if (reconciliation.differenceSummary.explainedCoverageState === "sem_itemizacao") {
    return "danger" as const;
  }

  if (
    reconciliation.differenceSummary.explainedCoverageState === "itemizacao_parcial"
  ) {
    return "warning" as const;
  }

  return "success" as const;
}

function getUnitemizedPriorityTone(reconciliation: ReconciliationRecord) {
  if (reconciliation.differenceSummary.unitemizedBalancePriority === "alta") {
    return "danger" as const;
  }

  if (reconciliation.differenceSummary.unitemizedBalancePriority === "media") {
    return "warning" as const;
  }

  return "success" as const;
}

function getDifferenceReadingTone(reconciliation: ReconciliationRecord) {
  if (reconciliation.differenceReading.profile === "estrutural") {
    return "danger" as const;
  }

  if (reconciliation.differenceReading.profile === "mista") {
    return "warning" as const;
  }

  if (reconciliation.differenceReading.profile === "pontual") {
    return "success" as const;
  }

  return "neutral" as const;
}

function getRecurrenceTone(recurrence: string) {
  if (
    recurrence === "padrao_recorrente" ||
    recurrence === "recorrencia_relevante" ||
    recurrence === "recorrencia_ativa" ||
    recurrence === "padrao_ativo"
  ) {
    return "danger" as const;
  }

  if (
    recurrence === "recorrencia_leve" ||
    recurrence === "recorrencia_em_reducao" ||
    recurrence === "padrao_historico"
  ) {
    return "warning" as const;
  }

  return "neutral" as const;
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
  const reconciliationByCompetency = new Map(
    (detail.reconciliations ?? []).map((item: ReconciliationRecord) => [
      item.competency,
      item,
    ]),
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

      {detail.contractReconciliationSummary.competencyCount > 0 && (
        <SectionCard
          eyebrow="Quadro conciliatório"
          title="Situação gerencial do contrato"
          description="Resumo agregado de todas as competências conciliatórias do contrato para leitura gerencial."
        >
          <div className="grid gap-3 lg:grid-cols-4">
            <MetricChip
              label="Diferença explicada total"
              value={formatCurrency(detail.contractReconciliationSummary.totalExplainedDifference)}
            />
            <MetricChip
              label="Coberto por itens"
              value={formatCurrency(detail.contractReconciliationSummary.totalCoveredByItems)}
            />
            <MetricChip
              label="Explicado sem itemização"
              value={formatCurrency(detail.contractReconciliationSummary.totalExplainedStillUnitemized)}
            />
            <MetricChip
              label="Residual não explicado"
              value={formatCurrency(detail.contractReconciliationSummary.totalUnexplainedResidual)}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-start gap-3">
            <div className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
              <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Cobertura geral
              </span>
              <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                {detail.contractReconciliationSummary.overallCoveragePercentage}%
              </p>
              <Badge
                tone={
                  detail.contractReconciliationSummary.overallCoverageState === "cobertura_suficiente" ||
                  detail.contractReconciliationSummary.overallCoverageState === "sem_divergencia"
                    ? "success"
                    : detail.contractReconciliationSummary.overallCoverageState === "cobertura_parcial"
                      ? "warning"
                      : "danger"
                }
              >
                {detail.contractReconciliationSummary.overallCoverageStateLabel}
              </Badge>
            </div>
            <div className="flex-1 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
              <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Atenção gerencial
              </span>
              <div className="mt-2">
                <Badge
                  tone={
                    detail.contractReconciliationSummary.managerialAttention === "normal"
                      ? "success"
                      : detail.contractReconciliationSummary.managerialAttention === "requer_acompanhamento"
                        ? "warning"
                        : "danger"
                  }
                >
                  {detail.contractReconciliationSummary.managerialAttentionLabel}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {detail.contractReconciliationSummary.managerialAttentionReason}
              </p>
            </div>
            <div className="flex-1 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
              <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Recorrencia leve
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={getRecurrenceTone(detail.contractReconciliationSummary.recurrenceState)}>
                  {detail.contractReconciliationSummary.recurrenceStateLabel}
                </Badge>
                {detail.contractReconciliationSummary.recurringSignals.map((signal) => (
                  <Badge key={signal.code} tone="neutral">
                    {signal.label} ({signal.count})
                  </Badge>
                ))}
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {detail.contractReconciliationSummary.recurrenceStateReason}
              </p>
            </div>
            <div className="flex-1 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
              <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Evolucao temporal
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={getRecurrenceTone(detail.contractReconciliationSummary.recurrenceTemporalState)}>
                  {detail.contractReconciliationSummary.recurrenceTemporalStateLabel}
                </Badge>
                {detail.contractReconciliationSummary.recentRecurringSignals.map((signal) => (
                  <Badge key={`recent-${signal.code}`} tone="warning">
                    recente: {signal.label}
                  </Badge>
                ))}
                {detail.contractReconciliationSummary.historicalRecurringSignals
                  .filter(
                    (signal) =>
                      !detail.contractReconciliationSummary.recentRecurringSignals.some(
                        (recentSignal) => recentSignal.code === signal.code,
                      ),
                  )
                  .map((signal) => (
                    <Badge key={`history-${signal.code}`} tone="neutral">
                      historico: {signal.label}
                    </Badge>
                  ))}
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {detail.contractReconciliationSummary.recurrenceTemporalStateReason}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
              <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Competências
              </span>
              <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                {detail.contractReconciliationSummary.competencyCount}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {detail.contractReconciliationSummary.hasOpenUnexplained && (
                  <Badge tone="danger">com residual aberto</Badge>
                )}
                {detail.contractReconciliationSummary.hasReopenedCompetencies && (
                  <Badge tone="warning">com reabertura</Badge>
                )}
                {detail.contractReconciliationSummary.hasRelevantUnitemized && (
                  <Badge tone="warning">remanescente relevante</Badge>
                )}
                {!detail.contractReconciliationSummary.hasOpenUnexplained &&
                  !detail.contractReconciliationSummary.hasReopenedCompetencies &&
                  !detail.contractReconciliationSummary.hasRelevantUnitemized && (
                    <Badge tone="success">sem alerta</Badge>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

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
                {detail.competencies.map((competency: Competency) => {
                  const reconciliation = reconciliationByCompetency.get(
                    competency.competency,
                  );

                  return (
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
                      <div className="space-y-2">
                        <p>{competency.processedAt ?? "Pendente"}</p>
                        {reconciliation ? (
                          <>
                            <Badge
                              tone={
                                reconciliation.formalClosure.state === "fechada"
                                  ? "success"
                                  : reconciliation.formalClosure.state ===
                                      "reaberta"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {getCompetencyFormalLabel(reconciliation)}
                            </Badge>
                            <p>{reconciliation.history.currentSituationLabel}</p>
                            <p>{reconciliation.history.currentSituationReason}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge tone={getCompetencyPriorityTone(reconciliation)}>
                                prioridade {reconciliation.qualification.priorityLabel}
                              </Badge>
                              <Badge tone={getCompetencyRecommendedActionTone(reconciliation)}>
                                {reconciliation.qualification.classificationLabel}
                              </Badge>
                            </div>
                            <p>
                              Fechamento:{" "}
                              {reconciliation.closureJustification ??
                                "não registrado"}
                            </p>
                            <p>
                              Reabertura:{" "}
                              {reconciliation.reopeningJustification ??
                                "não registrada"}
                            </p>
                            <p>
                              Ultima ocorrencia:{" "}
                              {reconciliation.history.lastRelevantOccurrence
                                ? `${reconciliation.history.lastRelevantOccurrence.label} em ${reconciliation.history.lastRelevantOccurrence.happenedAt}`
                                : "nao registrada"}
                            </p>
                            <p>
                              Itens conciliatorios:{" "}
                              {reconciliation.differenceSummary.explainedItemsCount} vinculado(s)
                              {" "}e{" "}
                              {formatCurrency(
                                reconciliation.differenceSummary
                                  .explainedBalanceStillUnitemized,
                              )}{" "}
                              ainda sem item minimo.
                            </p>
                            <p>
                              Diferenca nao explicada residual:{" "}
                              {formatCurrency(
                                reconciliation.differenceSummary.unexplainedAmount,
                              )}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge tone={getCoverageTone(reconciliation)}>
                                {reconciliation.differenceSummary.explainedCoverageStateLabel}
                              </Badge>
                              <Badge tone="neutral">
                                cobertura {reconciliation.differenceSummary.explainedCoveragePercentage}%
                              </Badge>
                              <Badge tone={getUnitemizedPriorityTone(reconciliation)}>
                                atencao remanescente{" "}
                                {reconciliation.differenceSummary.unitemizedBalancePriorityLabel}
                              </Badge>
                            </div>
                            <p>{reconciliation.differenceSummary.explainedCoverageReason}</p>
                            <p>
                              Origem operacional:{" "}
                              {reconciliation.differenceSummary.unitemizedBalanceOriginLabel}
                            </p>
                            <p>
                              {reconciliation.differenceSummary.unitemizedBalanceOriginReason}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge tone={getDifferenceReadingTone(reconciliation)}>
                                {reconciliation.differenceReading.profileLabel}
                              </Badge>
                              <Badge tone={getRecurrenceTone(reconciliation.differenceReading.recurrenceContext)}>
                                {reconciliation.differenceReading.recurrenceContextLabel}
                              </Badge>
                              <Badge tone={getRecurrenceTone(reconciliation.differenceReading.recurrenceTemporalContext)}>
                                {reconciliation.differenceReading.recurrenceTemporalContextLabel}
                              </Badge>
                            </div>
                            <p>
                              Leitura da divergencia:{" "}
                              {reconciliation.differenceReading.profileReason}
                            </p>
                            <p>{reconciliation.differenceReading.recurrenceContextReason}</p>
                            <p>{reconciliation.differenceReading.recurrenceTemporalContextReason}</p>
                            <p>
                              Priorizacao visual:{" "}
                              {reconciliation.differenceSummary.unitemizedBalancePriorityLabel}
                            </p>
                            <p>
                              {reconciliation.differenceSummary.unitemizedBalancePriorityReason}
                            </p>
                            <p>
                              Revisao dirigida:{" "}
                              {reconciliation.differenceSummary.directedReviewRecommendation}
                            </p>
                            <p>
                              Proxima acao sugerida:{" "}
                              {reconciliation.history.recommendedActionLabel}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reconciliation.qualification.pointings.map((pointing) => (
                                <Badge key={pointing.code} tone="neutral">
                                  {pointing.label}
                                </Badge>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p>Sem leitura conciliatória vinculada.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
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
              {(detail.reconciliations ?? []).map((item: ReconciliationRecord) => (
                <div
                  key={item.id}
                  className="space-y-2 border-b border-black/8 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-[var(--color-ink)]">
                      {formatCompetency(item.competency)}
                    </p>
                    <Badge
                      tone={
                        item.formalClosure.state === "fechada"
                          ? "success"
                          : item.formalClosure.state === "reaberta"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {getCompetencyFormalLabel(item)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    Fechamento mínimo: {item.operationalClosure.reason}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Situação atual: {item.history.currentSituationLabel}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Classificação: {item.qualification.classificationLabel}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Diferença explicada com item mínimo:{" "}
                    {formatCurrency(item.differenceSummary.explainedItemsAmount)}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Diferença explicada ainda sem item:{" "}
                    {formatCurrency(item.differenceSummary.explainedBalanceStillUnitemized)}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Diferença não explicada residual:{" "}
                    {formatCurrency(item.differenceSummary.unexplainedAmount)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={getCoverageTone(item)}>
                      {item.differenceSummary.explainedCoverageStateLabel}
                    </Badge>
                    <Badge tone="neutral">
                      cobertura {item.differenceSummary.explainedCoveragePercentage}%
                    </Badge>
                    <Badge tone={getUnitemizedPriorityTone(item)}>
                      atencao remanescente{" "}
                      {item.differenceSummary.unitemizedBalancePriorityLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    {item.differenceSummary.explainedCoverageReason}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Origem operacional: {item.differenceSummary.unitemizedBalanceOriginLabel}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {item.differenceSummary.unitemizedBalanceOriginReason}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={getDifferenceReadingTone(item)}>
                      {item.differenceReading.profileLabel}
                    </Badge>
                    <Badge tone={getRecurrenceTone(item.differenceReading.recurrenceContext)}>
                      {item.differenceReading.recurrenceContextLabel}
                    </Badge>
                    <Badge tone={getRecurrenceTone(item.differenceReading.recurrenceTemporalContext)}>
                      {item.differenceReading.recurrenceTemporalContextLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    Leitura da divergência: {item.differenceReading.profileReason}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {item.differenceReading.recurrenceContextReason}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {item.differenceReading.recurrenceTemporalContextReason}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Priorização visual:{" "}
                    {item.differenceSummary.unitemizedBalancePriorityLabel}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {item.differenceSummary.unitemizedBalancePriorityReason}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Revisão dirigida: {item.differenceSummary.directedReviewRecommendation}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {item.differenceSummary.directedReviewReason}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Próxima ação sugerida: {item.history.recommendedActionLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={getCompetencyPriorityTone(item)}>
                      prioridade {item.qualification.priorityLabel}
                    </Badge>
                    <Badge tone="neutral">
                      {item.qualification.trackingStateLabel}
                    </Badge>
                    <Badge tone={getCompetencyRecommendedActionTone(item)}>
                      {item.history.recommendedActionLabel}
                    </Badge>
                    {item.qualification.pointings.map((pointing) => (
                      <Badge key={pointing.code} tone="neutral">
                        {pointing.label}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2 rounded-[1.2rem] border border-black/8 bg-[var(--color-surface)] px-3 py-3">
                    {item.items.map((reconciliationItem) => (
                      <div key={reconciliationItem.id} className="space-y-1 text-sm text-[var(--color-muted)]">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={getReconciliationItemTone(reconciliationItem)}>
                            {reconciliationItem.kindLabel}
                          </Badge>
                          <Badge tone="neutral">{reconciliationItem.source}</Badge>
                        </div>
                        <p>{formatCurrency(reconciliationItem.amount)}</p>
                        <p>{reconciliationItem.summary}</p>
                        {reconciliationItem.bankEntryId ? (
                          <p>
                            Lançamento vinculado: {reconciliationItem.bankEntryId}
                            {reconciliationItem.bankEntryDescription
                              ? ` • ${reconciliationItem.bankEntryDescription}`
                              : ""}
                          </p>
                        ) : null}
                        {reconciliationItem.justification ? (
                          <p>Justificativa: {reconciliationItem.justification}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {item.history.lastRelevantOccurrence ? (
                    <p className="text-sm text-[var(--color-muted)]">
                      Última ocorrência: {item.history.lastRelevantOccurrence.label} em{" "}
                      {item.history.lastRelevantOccurrence.happenedAt}
                    </p>
                  ) : null}
                  {item.history.timeline.slice(-3).map((event) => (
                    <p
                      key={event.id}
                      className="text-sm text-[var(--color-muted)]"
                    >
                      {event.happenedAt} • {event.label}: {event.description}
                    </p>
                  ))}
                </div>
              ))}
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

