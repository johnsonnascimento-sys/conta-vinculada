import type {
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
  startDate: Date;
  endDate: Date;
  status: "ativo" | "encerrado" | "suspenso";
  linkedAccounts?: Array<{ id: string }>;
}): Contract {
  return {
    ...contract,
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
  status: ReleaseRequest["status"];
  createdAt: Date;
  requestedByName: string;
  analystName: string | null;
  approverName: string | null;
  items: Array<{
    id: string;
    employeeId: string;
    rubric: string;
    competencyRef: string;
    requestedAmount: { toNumber(): number };
    approvedAmount: { toNumber(): number };
    decision: ReleaseRequest["items"][number]["decision"];
  }>;
  documents: Array<{ kind: ReleaseRequest["requiredDocuments"][number] }>;
}): ReleaseRequest {
  const requiredDocuments = [...new Set(request.documents.map((item) => item.kind))];

  return {
    id: request.id,
    contractId: request.contractId,
    companyId: request.companyId,
    protocol: request.protocol,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    requestedBy: request.requestedByName,
    analyst: request.analystName ?? undefined,
    approver: request.approverName ?? undefined,
    requiredDocuments,
    missingDocuments: [],
    items: request.items.map((item) => ({
      id: item.id,
      employeeId: item.employeeId,
      rubric: item.rubric,
      competency: item.competencyRef,
      requestedAmount: item.requestedAmount.toNumber(),
      approvedAmount: item.approvedAmount.toNumber(),
      decision: item.decision,
    })),
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
