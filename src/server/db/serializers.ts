import type {
  AdministrativeApprovalDecision,
  AppUser,
  AuditEvent,
  BankEntry,
  Competency,
  Contract,
  Employee,
  EmployeeAllocation,
  ProvisionBalance,
  ReconciliationRecord,
  ReleaseRequest,
  Tenant,
} from "@/features/platform/types";
import { getReleaseDocumentPlan } from "@/features/releases/rules";
import { summarizeReleaseRequestWorkflow } from "@/features/releases/workflow";

function isAdministrativeApprovalDecision(
  decision: "aprovar" | "aprovar_parcial" | "rejeitar" | "devolver",
): decision is AdministrativeApprovalDecision {
  return (
    decision === "aprovar" ||
    decision === "aprovar_parcial" ||
    decision === "rejeitar"
  );
}

function getLatestWorkflowApproval(
  approvals: Array<{
    stage:
      | "analise_documental"
      | "aprovacao_administrativa"
      | "triagem"
      | "execucao_financeira"
      | "conciliacao";
    decision: "aprovar" | "aprovar_parcial" | "rejeitar" | "devolver";
    decidedBy: string;
    notes: string | null;
    createdAt: Date;
  }>,
  stage: "aprovacao_administrativa" | "execucao_financeira",
) {
  const latestApproval = approvals
    .filter(
      (item) =>
        item.stage === stage && isAdministrativeApprovalDecision(item.decision),
    )
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

  if (!latestApproval) {
    return undefined;
  }

  return {
    decision: latestApproval.decision as AdministrativeApprovalDecision,
    decidedBy: latestApproval.decidedBy,
    notes: latestApproval.notes,
    createdAt: latestApproval.createdAt,
  };
}

function getLatestAdministrativeApproval(
  approvals: Array<{
    stage:
      | "analise_documental"
      | "aprovacao_administrativa"
      | "triagem"
      | "execucao_financeira"
      | "conciliacao";
    decision: "aprovar" | "aprovar_parcial" | "rejeitar" | "devolver";
    decidedBy: string;
    notes: string | null;
    createdAt: Date;
  }>,
): {
  decision: AdministrativeApprovalDecision;
  decidedBy: string;
  notes: string | null;
  createdAt: Date;
} | undefined {
  return getLatestWorkflowApproval(approvals, "aprovacao_administrativa");
}

function getLatestFinancialPreparationApproval(
  approvals: Array<{
    stage:
      | "analise_documental"
      | "aprovacao_administrativa"
      | "triagem"
      | "execucao_financeira"
      | "conciliacao";
    decision: "aprovar" | "aprovar_parcial" | "rejeitar" | "devolver";
    decidedBy: string;
    notes: string | null;
    createdAt: Date;
  }>,
) {
  return getLatestWorkflowApproval(approvals, "execucao_financeira");
}

function getLatestFinancialExecution(
  executions: Array<{
    bankEntryId: string;
    executedAmount: { toNumber(): number };
    executedAt: Date;
    bankEntry?: {
      description: string;
    } | null;
  }>,
) {
  const latestExecution = executions
    .slice()
    .sort((left, right) => right.executedAt.getTime() - left.executedAt.getTime())[0];

  if (!latestExecution) {
    return undefined;
  }

  return {
    bankEntryId: latestExecution.bankEntryId,
    bankEntryDescription: latestExecution.bankEntry?.description,
    executedAmount: latestExecution.executedAmount.toNumber(),
    executedAt: latestExecution.executedAt.toISOString(),
  };
}

function serializeCalculationMemory(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  return {
    baseAmount:
      typeof record.baseAmount === "number" ? record.baseAmount : undefined,
    proportionalFraction:
      typeof record.proportionalFraction === "number"
        ? record.proportionalFraction
        : undefined,
    referenceMonths:
      typeof record.referenceMonths === "number"
        ? record.referenceMonths
        : undefined,
    notes: typeof record.notes === "string" ? record.notes : undefined,
  };
}

export function serializeTenant(tenant: {
  id: string;
  name: string;
  jurisdiction: string;
}): Tenant {
  return tenant;
}

export function serializeContract(contract: {
  id: string;
  tenantId: string;
  organizationId: string;
  companyId: string;
  code: string;
  name: string;
  object: string;
  signedAt: Date;
  startDate: Date;
  endDate: Date;
  status: "ativo" | "encerrado" | "suspenso";
  normativeRegime: Contract["normativeRegime"];
  linkedAccounts?: Array<{ id: string }>;
}): Contract {
  return {
    ...contract,
    signedAt: contract.signedAt.toISOString().slice(0, 10),
    startDate: contract.startDate.toISOString().slice(0, 10),
    endDate: contract.endDate.toISOString().slice(0, 10),
    bankAccountId: contract.linkedAccounts?.[0]?.id ?? "",
    riskLevel: "medio",
  };
}

export function serializeEmployee(employee: {
  id: string;
  tenantId: string;
  name: string;
  cpf: string;
  role: string;
  status: "ativo" | "afastado" | "desligado";
  admissionDate: Date;
  terminationDate: Date | null;
}): Employee {
  return {
    ...employee,
    admissionDate: employee.admissionDate.toISOString().slice(0, 10),
    terminationDate: employee.terminationDate?.toISOString().slice(0, 10),
  };
}

export function serializeAllocation(allocation: {
  id: string;
  employeeId: string;
  contractId: string;
  startDate: Date;
  endDate: Date | null;
  costCenter: string;
}): EmployeeAllocation {
  return {
    ...allocation,
    startDate: allocation.startDate.toISOString().slice(0, 10),
    endDate: allocation.endDate?.toISOString().slice(0, 10),
  };
}

export function serializeCompetency(competency: {
  id: string;
  contractId: string;
  competency: string;
  status: Competency["status"];
  processedAt: Date | null;
}): Competency {
  return {
    ...competency,
    processedAt: competency.processedAt?.toISOString(),
  };
}

export function serializeProvisionBalance(balance: {
  employeeId: string;
  contractId: string;
  rubric: string;
  balance: { toNumber(): number };
  reservedAmount: { toNumber(): number };
  releasedAmount: { toNumber(): number };
}): ProvisionBalance {
  return {
    employeeId: balance.employeeId,
    contractId: balance.contractId,
    rubric: balance.rubric,
    balance: balance.balance.toNumber(),
    reserved: balance.reservedAmount.toNumber(),
    released: balance.releasedAmount.toNumber(),
  };
}

export function serializeBankEntry(entry: {
  id: string;
  linkedAccountId: string;
  contractId: string;
  competency?: { competency: string } | null;
  type: BankEntry["type"];
  description: string;
  amount: { toNumber(): number };
  occurredOn: Date;
}): BankEntry {
  return {
    id: entry.id,
    accountId: entry.linkedAccountId,
    contractId: entry.contractId,
    competency: entry.competency?.competency,
    type: entry.type,
    description: entry.description,
    amount: entry.amount.toNumber(),
    occurredOn: entry.occurredOn.toISOString().slice(0, 10),
  };
}

export function serializeReleaseRequest(request: {
  id: string;
  contractId: string;
  companyId: string;
  protocol: string;
  releaseType: ReleaseRequest["releaseType"];
  movementMode: ReleaseRequest["movementMode"];
  status: ReleaseRequest["status"];
  requestedByName: string;
  requestedByUserId: string | null;
  analystName: string | null;
  approverName: string | null;
  contract: {
    normativeRegime: Contract["normativeRegime"];
    linkedAccounts?: Array<{
      isOfficialPublicBank: boolean;
      cooperationTermRef: string | null;
      currentBalance: { toNumber(): number };
    }>;
    reconciliations?: Array<{
      approvedPendingExecution: { toNumber(): number };
      unexplainedDifference: { toNumber(): number };
      competency: { competency: string };
    }>;
  };
  factualBasis: string;
  competencyStart: string;
  competencyEnd: string;
  requestedTotalAmount: { toNumber(): number };
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    releaseRequestId: string;
    employeeId: string;
    releaseRubric: ReleaseRequest["items"][number]["releaseRubric"];
    competencyRef: string;
    allocationStartDate: Date;
    allocationEndDate: Date | null;
    employmentStartDate: Date;
    factOccurredOn: Date;
    calculationMemory: unknown;
    requestedAmount: { toNumber(): number };
    validatedAmount: { toNumber(): number };
    approvedAmount: { toNumber(): number };
    decision: ReleaseRequest["items"][number]["decision"];
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  documents: Array<{ kind: ReleaseRequest["requiredDocuments"][number] }>;
  approvals: Array<{
    stage: "analise_documental" | "aprovacao_administrativa" | "triagem" | "execucao_financeira" | "conciliacao";
    decision: "aprovar" | "aprovar_parcial" | "rejeitar" | "devolver";
    decidedBy: string;
    notes: string | null;
    createdAt: Date;
  }>;
  releaseExecutions?: Array<{
    id: string;
    bankEntryId: string;
    executedAmount: { toNumber(): number };
    executedAt: Date;
    bankEntry?: {
      description: string;
    } | null;
  }>;
}): ReleaseRequest {
  const providedDocuments = [...new Set(request.documents.map((item) => item.kind))];
  const documentPlan = getReleaseDocumentPlan(
    request.releaseType,
    request.movementMode,
    request.status,
    providedDocuments,
  );
  const items = request.items.map((item) => ({
    id: item.id,
    releaseRequestId: item.releaseRequestId,
    employeeId: item.employeeId,
    releaseRubric: item.releaseRubric,
    competencyRef: item.competencyRef,
    allocationStartDate: item.allocationStartDate.toISOString().slice(0, 10),
    allocationEndDate: item.allocationEndDate?.toISOString().slice(0, 10),
    employmentStartDate: item.employmentStartDate.toISOString().slice(0, 10),
    factOccurredOn: item.factOccurredOn.toISOString().slice(0, 10),
    calculationMemory: serializeCalculationMemory(item.calculationMemory),
    requestedAmount: item.requestedAmount.toNumber(),
    validatedAmount: item.validatedAmount.toNumber(),
    approvedAmount: item.approvedAmount.toNumber(),
    decision: item.decision,
    notes: item.notes ?? undefined,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
  const latestAdministrativeApproval = getLatestAdministrativeApproval(
    request.approvals,
  );
  const latestFinancialPreparationApproval = getLatestFinancialPreparationApproval(
    request.approvals,
  );
  const latestFinancialExecution = getLatestFinancialExecution(
    request.releaseExecutions ?? [],
  );
  const linkedAccount = request.contract.linkedAccounts?.[0];
  const reconciliation = request.contract.reconciliations?.find(
    (item) => item.competency.competency === request.competencyEnd,
  );
  const workflow = summarizeReleaseRequestWorkflow({
    status: request.status,
    missingDocumentCount: documentPlan.missingCurrentStage.length,
    itemDecisions: items.map((item) => item.decision),
    movementMode: request.movementMode,
    normativeRegime: request.contract.normativeRegime,
    providedDocuments,
    approvedAmount: items.reduce((total, item) => total + item.approvedAmount, 0),
    currentBalance: linkedAccount?.currentBalance.toNumber(),
    approvedPendingExecution: reconciliation?.approvedPendingExecution.toNumber(),
    unexplainedDifference: reconciliation?.unexplainedDifference.toNumber(),
    linkedAccount: linkedAccount
      ? {
          isOfficialPublicBank: linkedAccount.isOfficialPublicBank,
          cooperationTermRef: linkedAccount.cooperationTermRef ?? undefined,
        }
      : undefined,
    latestFinancialPreparationApproval: latestFinancialPreparationApproval
      ? {
          decision: latestFinancialPreparationApproval.decision,
          decidedBy: latestFinancialPreparationApproval.decidedBy,
          decidedAt: latestFinancialPreparationApproval.createdAt.toISOString(),
          notes: latestFinancialPreparationApproval.notes ?? undefined,
        }
      : undefined,
    hasEffectiveExecution: (request.releaseExecutions?.length ?? 0) > 0,
    latestFinancialExecution,
    latestAdministrativeApproval: latestAdministrativeApproval
      ? {
          decision: latestAdministrativeApproval.decision,
          decidedBy: latestAdministrativeApproval.decidedBy,
          decidedAt: latestAdministrativeApproval.createdAt.toISOString(),
          notes: latestAdministrativeApproval.notes ?? undefined,
        }
      : undefined,
  });

  return {
    id: request.id,
    contractId: request.contractId,
    companyId: request.companyId,
    protocol: request.protocol,
    releaseType: request.releaseType,
    movementMode: request.movementMode,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    requestedBy: request.requestedByName,
    requestedByUserId: request.requestedByUserId ?? undefined,
    analyst: request.analystName ?? undefined,
    approver: request.approverName ?? undefined,
    factualBasis: request.factualBasis,
    competencyStart: request.competencyStart,
    competencyEnd: request.competencyEnd,
    requestedTotalAmount: request.requestedTotalAmount.toNumber(),
    notes: request.notes ?? undefined,
    items,
    requiredDocuments: documentPlan.expectedCurrentStage,
    missingDocuments: documentPlan.missingCurrentStage,
    documentSummary: {
      provided: documentPlan.provided,
      expectedCurrentStage: documentPlan.expectedCurrentStage,
      missingCurrentStage: documentPlan.missingCurrentStage,
      expectedByCategory: documentPlan.expectedByCategory,
      missingByCategory: documentPlan.missingByCategory,
      deferredByCategory: documentPlan.deferredByCategory,
    },
    workflow,
  };
}

export function serializeReconciliation(record: {
  id: string;
  contractId: string;
  competency: { competency: string };
  bankBalance: { toNumber(): number };
  provisionBalance: { toNumber(): number };
  approvedPendingExecution: { toNumber(): number };
  explainedDifference: { toNumber(): number };
  unexplainedDifference: { toNumber(): number };
  differenceType: ReconciliationRecord["differenceType"];
}): ReconciliationRecord {
  return {
    id: record.id,
    contractId: record.contractId,
    competency: record.competency.competency,
    bankBalance: record.bankBalance.toNumber(),
    provisionBalance: record.provisionBalance.toNumber(),
    approvedPendingExecution: record.approvedPendingExecution.toNumber(),
    explainedDifference: record.explainedDifference.toNumber(),
    unexplainedDifference: record.unexplainedDifference.toNumber(),
    differenceType: record.differenceType,
  };
}

export function serializeAuditEvent(event: {
  id: string;
  contractId: string;
  actorName: string;
  action: string;
  entity: string;
  createdAt: Date;
  details: string | null;
}): AuditEvent {
  return {
    id: event.id,
    contractId: event.contractId,
    actor: event.actorName,
    action: event.action,
    entity: event.entity,
    happenedAt: event.createdAt.toISOString(),
    details: event.details ?? "",
  };
}

export function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  mfaEnabled: boolean;
}): AppUser {
  return user;
}
