export type CompetencyStatus =
  | "aberta"
  | "em_calculo"
  | "calculada"
  | "conciliada"
  | "fechada"
  | "reaberta";

export type ReleaseRequestStatus =
  | "em_elaboracao"
  | "enviada"
  | "em_exigencia"
  | "em_analise"
  | "aprovada_parcial"
  | "aprovada"
  | "rejeitada"
  | "liberada"
  | "cancelada";

export type BankEntryType =
  | "deposito"
  | "rendimento"
  | "liberacao"
  | "tarifa"
  | "estorno"
  | "ajuste";

export type ApprovalDecision =
  | "aprovar"
  | "aprovar_parcial"
  | "rejeitar"
  | "devolver";

export type DocumentKind =
  | "comprovante_pagamento"
  | "folha"
  | "ferias"
  | "rescisao"
  | "fgts"
  | "extrato"
  | "parecer"
  | "despacho"
  | "importacao";

export type ReconciliationDifferenceType = "explicada" | "nao_explicada";

export type WorkflowStage =
  | "triagem"
  | "analise_documental"
  | "aprovacao_administrativa"
  | "execucao_financeira"
  | "conciliacao";

export type ReleaseItemDecision =
  | "pendente"
  | "aprovado"
  | "aprovado_parcial"
  | "glosado";

export interface Tenant {
  id: string;
  name: string;
  jurisdiction: string;
}

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  code: string;
}

export interface Company {
  id: string;
  tenantId: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  organizationId: string;
  companyId: string;
  code: string;
  name: string;
  object: string;
  startDate: string;
  endDate: string;
  status: "ativo" | "encerrado" | "suspenso";
  bankAccountId: string;
  riskLevel: "alto" | "medio" | "baixo";
}

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  cpf: string;
  role: string;
  status: "ativo" | "afastado" | "desligado";
  admissionDate: string;
  terminationDate?: string;
}

export interface EmployeeAllocation {
  id: string;
  employeeId: string;
  contractId: string;
  startDate: string;
  endDate?: string;
  costCenter: string;
}

export interface Competency {
  id: string;
  contractId: string;
  competency: string;
  status: CompetencyStatus;
  processedAt?: string;
}

export interface ProvisionBalance {
  employeeId: string;
  contractId: string;
  rubric: string;
  balance: number;
  reserved: number;
  released: number;
}

export interface BankAccount {
  id: string;
  contractId: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  currentBalance: number;
}

export interface BankEntry {
  id: string;
  accountId: string;
  contractId: string;
  competency?: string;
  type: BankEntryType;
  description: string;
  amount: number;
  occurredOn: string;
}

export interface ReleaseRequestItem {
  id: string;
  employeeId: string;
  rubric: string;
  competency: string;
  requestedAmount: number;
  approvedAmount: number;
  decision: ReleaseItemDecision;
}

export interface ReleaseRequest {
  id: string;
  contractId: string;
  companyId: string;
  protocol: string;
  status: ReleaseRequestStatus;
  createdAt: string;
  requestedBy: string;
  analyst?: string;
  approver?: string;
  items: ReleaseRequestItem[];
  requiredDocuments: DocumentKind[];
  missingDocuments: DocumentKind[];
}

export interface ReconciliationRecord {
  id: string;
  contractId: string;
  competency: string;
  bankBalance: number;
  provisionBalance: number;
  approvedPendingExecution: number;
  explainedDifference: number;
  unexplainedDifference: number;
  differenceType: ReconciliationDifferenceType;
}

export interface AuditEvent {
  id: string;
  contractId: string;
  actor: string;
  action: string;
  entity: string;
  happenedAt: string;
  details: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  mfaEnabled: boolean;
}
