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
  | "comprovante_operacao_bancaria"
  | "folha"
  | "ferias"
  | "rescisao"
  | "fgts"
  | "extrato"
  | "parecer"
  | "despacho"
  | "importacao"
  | "encerramento_contratual"
  | "sucessao_contratual"
  | "termo_cooperacao"
  | "garantia_rescisoria";

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

export type ReleaseType = "ferias" | "decimo_terceiro" | "rescisao";

export type ReleaseMovementMode =
  | "pagamento_direto_empregado"
  | "resgate_contratada";

export type ContractNormativeRegime = "cnj_169_2013" | "cnj_651_2025";

export type ReleaseRubric =
  | "ferias"
  | "terco_constitucional_ferias"
  | "encargos_ferias"
  | "decimo_terceiro"
  | "encargos_decimo_terceiro"
  | "ferias_proporcionais"
  | "decimo_terceiro_proporcional"
  | "multa_fgts_rescisoria"
  | "encargos_rescisorios";

export interface ReleaseDocumentCategoryMap {
  fact: DocumentKind[];
  calculation: DocumentKind[];
  settlement: DocumentKind[];
  operation: DocumentKind[];
  closure: DocumentKind[];
}

export interface ReleaseRequestDocumentSummary {
  provided: DocumentKind[];
  expectedCurrentStage: DocumentKind[];
  missingCurrentStage: DocumentKind[];
  expectedByCategory: ReleaseDocumentCategoryMap;
  missingByCategory: ReleaseDocumentCategoryMap;
  deferredByCategory: ReleaseDocumentCategoryMap;
}

export type ReleaseRequestDocumentState = "regular" | "pendente";

export type ReleaseRequestAnalysisState =
  | "aguardando_analise"
  | "em_exigencia"
  | "em_analise"
  | "concluida";

export type ReleaseRequestDecisionState =
  | "sem_decisao"
  | "parcial"
  | "aprovada"
  | "aprovada_parcial"
  | "rejeitada";

export type AdministrativeApprovalDecision = Extract<
  ApprovalDecision,
  "aprovar" | "aprovar_parcial" | "rejeitar"
>;

export type ReleaseRequestAdministrativeApprovalState =
  | "nao_apta"
  | "apta"
  | "aprovada"
  | "aprovada_parcial"
  | "rejeitada";

export type ReleaseRequestFinancialReadinessState =
  | "nao_apta"
  | "apta_para_execucao_futura";

export type ReleaseRequestFinancialPreparationState =
  | "nao_apta"
  | "apta"
  | "preparada";

export type ReleaseRequestFinancialExecutionState =
  | "nao_apta"
  | "aguardando_execucao"
  | "executada";

export type ReleaseRequestBalanceCheckState =
  | "nao_avaliado"
  | "suficiente"
  | "insuficiente";

export type ReleaseRequestReconciliationCheckState =
  | "nao_avaliado"
  | "regular"
  | "com_atencao";

export interface ReleaseRequestAdministrativeApprovalSummary {
  state: ReleaseRequestAdministrativeApprovalState;
  decision?: AdministrativeApprovalDecision;
  approver?: string;
  decidedAt?: string;
  notes?: string;
  canApprove: boolean;
  reason?: string;
  financialReadiness: ReleaseRequestFinancialReadinessState;
  financialNextStep: string;
}

export interface ReleaseRequestFinancialPreparationSummary {
  state: ReleaseRequestFinancialPreparationState;
  canPrepare: boolean;
  eligibleAmount: number;
  expectedMovement: string;
  requiredEvidence: DocumentKind[];
  missingEvidence: DocumentKind[];
  balanceCheck: ReleaseRequestBalanceCheckState;
  reconciliationCheck: ReleaseRequestReconciliationCheckState;
  currentBalance?: number;
  approvedPendingExecution?: number;
  unexplainedDifference?: number;
  preparedBy?: string;
  preparedAt?: string;
  notes?: string;
  reason?: string;
  effectiveExecutionRecorded: boolean;
}

export interface ReleaseRequestFinancialExecutionSummary {
  state: ReleaseRequestFinancialExecutionState;
  canExecute: boolean;
  pendingAmount: number;
  reason?: string;
  executedAmount?: number;
  executedAt?: string;
  bankEntryId?: string;
  bankEntryDescription?: string;
}

export interface ReleaseRequestWorkflowSummary {
  derivedStatus: ReleaseRequestStatus;
  documentState: ReleaseRequestDocumentState;
  analysisState: ReleaseRequestAnalysisState;
  decisionState: ReleaseRequestDecisionState;
  pendingDocumentCount: number;
  totalItemCount: number;
  pendingItemCount: number;
  decidedItemCount: number;
  canAggregateDecision: boolean;
  administrativeApproval: ReleaseRequestAdministrativeApprovalSummary;
  financialPreparation: ReleaseRequestFinancialPreparationSummary;
  financialExecution: ReleaseRequestFinancialExecutionSummary;
}

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
  signedAt: string;
  startDate: string;
  endDate: string;
  status: "ativo" | "encerrado" | "suspenso";
  normativeRegime: ContractNormativeRegime;
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
  isOfficialPublicBank: boolean;
  cooperationTermRef?: string;
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
  releaseRequestId: string;
  employeeId: string;
  releaseRubric: ReleaseRubric;
  competencyRef: string;
  allocationStartDate: string;
  allocationEndDate?: string;
  employmentStartDate: string;
  factOccurredOn: string;
  calculationMemory?: {
    baseAmount?: number;
    proportionalFraction?: number;
    referenceMonths?: number;
    notes?: string;
  };
  requestedAmount: number;
  validatedAmount: number;
  approvedAmount: number;
  decision: ReleaseItemDecision;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseRequest {
  id: string;
  contractId: string;
  companyId: string;
  protocol: string;
  releaseType: ReleaseType;
  movementMode: ReleaseMovementMode;
  status: ReleaseRequestStatus;
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
  requestedByUserId?: string;
  analyst?: string;
  approver?: string;
  factualBasis: string;
  competencyStart: string;
  competencyEnd: string;
  requestedTotalAmount: number;
  notes?: string;
  items: ReleaseRequestItem[];
  requiredDocuments: DocumentKind[];
  missingDocuments: DocumentKind[];
  documentSummary: ReleaseRequestDocumentSummary;
  workflow: ReleaseRequestWorkflowSummary;
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
