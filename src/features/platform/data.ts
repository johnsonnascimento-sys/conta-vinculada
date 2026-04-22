import type {
  AppUser,
  AuditEvent,
  BankAccount,
  BankEntry,
  Company,
  Competency,
  Contract,
  Employee,
  EmployeeAllocation,
  Organization,
  ProvisionBalance,
  ReconciliationRecord,
  ReleaseRequest,
  Tenant,
} from "@/features/platform/types";
import { getReleaseDocumentPlan } from "@/features/releases/rules";
import { summarizeReleaseRequestWorkflow } from "@/features/releases/workflow";

export const tenant: Tenant = {
  id: "tenant-jmu",
  name: "Justiça Militar da União",
  jurisdiction: "2ª Circunscrição Judiciária Militar",
};

export const organizations: Organization[] = [
  {
    id: "org-2cjm",
    tenantId: tenant.id,
    name: "2ª Circunscrição Judiciária Militar",
    code: "2CJM",
  },
];

export const companies: Company[] = [
  {
    id: "company-atlas",
    tenantId: tenant.id,
    legalName: "Atlas Serviços Integrados Ltda.",
    tradeName: "Atlas Serviços",
    cnpj: "12.345.678/0001-90",
  },
  {
    id: "company-vigil",
    tenantId: tenant.id,
    legalName: "Vigil Prime Segurança Patrimonial S.A.",
    tradeName: "Vigil Prime",
    cnpj: "98.765.432/0001-10",
  },
];

export const contracts: Contract[] = [
  {
    id: "c-2cjm-001",
    tenantId: tenant.id,
    organizationId: "org-2cjm",
    companyId: "company-atlas",
    code: "CT 07/2025",
    name: "Apoio administrativo e recepção",
    object:
      "Prestação continuada com dedicação exclusiva de mão de obra para recepção e apoio administrativo.",
    signedAt: "2025-01-15",
    startDate: "2025-02-01",
    endDate: "2027-01-31",
    status: "ativo",
    normativeRegime: "cnj_651_2025",
    bankAccountId: "bank-001",
    riskLevel: "alto",
  },
  {
    id: "c-2cjm-002",
    tenantId: tenant.id,
    organizationId: "org-2cjm",
    companyId: "company-vigil",
    code: "CT 12/2024",
    name: "Vigilância armada e desarmada",
    object: "Serviços continuados de vigilância armada e desarmada.",
    signedAt: "2024-07-15",
    startDate: "2024-08-01",
    endDate: "2026-07-31",
    status: "ativo",
    normativeRegime: "cnj_169_2013",
    bankAccountId: "bank-002",
    riskLevel: "medio",
  },
];

export const employees: Employee[] = [
  {
    id: "emp-001",
    tenantId: tenant.id,
    name: "Luciana Freitas",
    cpf: "123.456.789-10",
    role: "Recepcionista",
    status: "ativo",
    admissionDate: "2024-03-10",
  },
  {
    id: "emp-002",
    tenantId: tenant.id,
    name: "Carlos Menezes",
    cpf: "987.654.321-00",
    role: "Assistente administrativo",
    status: "ativo",
    admissionDate: "2023-11-01",
  },
  {
    id: "emp-003",
    tenantId: tenant.id,
    name: "Aline Tavares",
    cpf: "111.222.333-44",
    role: "Vigilante",
    status: "ativo",
    admissionDate: "2024-08-14",
  },
  {
    id: "emp-004",
    tenantId: tenant.id,
    name: "Marcos Faria",
    cpf: "444.555.666-77",
    role: "Vigilante",
    status: "desligado",
    admissionDate: "2024-08-14",
    terminationDate: "2026-03-20",
  },
];

export const allocations: EmployeeAllocation[] = [
  {
    id: "alloc-001",
    employeeId: "emp-001",
    contractId: "c-2cjm-001",
    startDate: "2025-02-01",
    costCenter: "Recepção",
  },
  {
    id: "alloc-002",
    employeeId: "emp-002",
    contractId: "c-2cjm-001",
    startDate: "2025-02-01",
    costCenter: "Apoio administrativo",
  },
  {
    id: "alloc-003",
    employeeId: "emp-003",
    contractId: "c-2cjm-002",
    startDate: "2024-08-01",
    costCenter: "Vigilância armada",
  },
  {
    id: "alloc-004",
    employeeId: "emp-004",
    contractId: "c-2cjm-002",
    startDate: "2024-08-01",
    endDate: "2026-03-20",
    costCenter: "Vigilância desarmada",
  },
];

export const competencies: Competency[] = [
  {
    id: "comp-2026-01-c1",
    contractId: "c-2cjm-001",
    competency: "2026-01",
    status: "fechada",
    processedAt: "2026-02-03T15:00:00Z",
  },
  {
    id: "comp-2026-02-c1",
    contractId: "c-2cjm-001",
    competency: "2026-02",
    status: "conciliada",
    processedAt: "2026-03-05T13:00:00Z",
  },
  {
    id: "comp-2026-03-c1",
    contractId: "c-2cjm-001",
    competency: "2026-03",
    status: "calculada",
    processedAt: "2026-04-02T18:10:00Z",
  },
  {
    id: "comp-2026-03-c2",
    contractId: "c-2cjm-002",
    competency: "2026-03",
    status: "reaberta",
    processedAt: "2026-04-04T11:00:00Z",
  },
];

export const provisionBalances: ProvisionBalance[] = [
  {
    employeeId: "emp-001",
    contractId: "c-2cjm-001",
    rubric: "13º salário",
    balance: 6840,
    reserved: 0,
    released: 1260,
  },
  {
    employeeId: "emp-001",
    contractId: "c-2cjm-001",
    rubric: "Férias + 1/3",
    balance: 9120,
    reserved: 1560,
    released: 880,
  },
  {
    employeeId: "emp-002",
    contractId: "c-2cjm-001",
    rubric: "Férias + 1/3",
    balance: 10830,
    reserved: 0,
    released: 2310,
  },
  {
    employeeId: "emp-003",
    contractId: "c-2cjm-002",
    rubric: "13º salário",
    balance: 7740,
    reserved: 0,
    released: 0,
  },
  {
    employeeId: "emp-004",
    contractId: "c-2cjm-002",
    rubric: "Multa FGTS",
    balance: 3920,
    reserved: 3920,
    released: 0,
  },
];

export const bankAccounts: BankAccount[] = [
  {
    id: "bank-001",
    contractId: "c-2cjm-001",
    bankName: "Banco do Brasil",
    isOfficialPublicBank: true,
    cooperationTermRef: "TCT-CNJ-BB-2025",
    branch: "1234-5",
    accountNumber: "98765-4",
    currentBalance: 148320.48,
  },
  {
    id: "bank-002",
    contractId: "c-2cjm-002",
    isOfficialPublicBank: true,
    cooperationTermRef: "TCT-CNJ-CEF-2024",
    bankName: "Caixa Econômica Federal",
    branch: "0021",
    accountNumber: "778899-0",
    currentBalance: 232904.12,
  },
];

export const bankEntries: BankEntry[] = [
  {
    id: "entry-001",
    accountId: "bank-001",
    contractId: "c-2cjm-001",
    competency: "2026-03",
    type: "deposito",
    description: "Depósito mensal da competência 03/2026",
    amount: 25480,
    occurredOn: "2026-04-05",
  },
  {
    id: "entry-002",
    accountId: "bank-001",
    contractId: "c-2cjm-001",
    competency: "2026-03",
    type: "rendimento",
    description: "Rendimento bancário de março",
    amount: 942.18,
    occurredOn: "2026-04-01",
  },
  {
    id: "entry-003",
    accountId: "bank-001",
    contractId: "c-2cjm-001",
    competency: "2026-03",
    type: "liberacao",
    description: "Liberação aprovada RR-2026-00018",
    amount: -3120,
    occurredOn: "2026-04-09",
  },
  {
    id: "entry-004",
    accountId: "bank-002",
    contractId: "c-2cjm-002",
    competency: "2026-03",
    type: "deposito",
    description: "Depósito mensal da competência 03/2026",
    amount: 41820,
    occurredOn: "2026-04-04",
  },
  {
    id: "entry-005",
    accountId: "bank-002",
    contractId: "c-2cjm-002",
    competency: "2026-03",
    type: "ajuste",
    description: "Ajuste pendente de classificação do extrato",
    amount: -1940,
    occurredOn: "2026-04-10",
  },
  {
    id: "entry-006",
    accountId: "bank-002",
    contractId: "c-2cjm-002",
    competency: "2026-03",
    type: "liberacao",
    description: "Liberação preparada para RR-2026-00021",
    amount: -3650,
    occurredOn: "2026-04-15",
  },
];

const releaseRequestOneDocumentPlan = getReleaseDocumentPlan(
  "ferias",
  "resgate_contratada",
  "enviada",
  ["ferias", "comprovante_pagamento"],
);

const releaseRequestTwoDocumentPlan = getReleaseDocumentPlan(
  "rescisao",
  "resgate_contratada",
  "aprovada_parcial",
  ["rescisao", "fgts", "comprovante_pagamento", "despacho"],
);

const releaseRequestOneItems: ReleaseRequest["items"] = [
  {
    id: "rr-item-001",
    releaseRequestId: "rr-001",
    employeeId: "emp-001",
    releaseRubric: "ferias",
    competencyRef: "2026-03",
    allocationStartDate: "2025-02-01",
    employmentStartDate: "2024-03-10",
    factOccurredOn: "2026-03-15",
    calculationMemory: {
      baseAmount: 1560,
      proportionalFraction: 1,
      referenceMonths: 12,
      notes: "F?rias integrais do per?odo aquisitivo.",
    },
    requestedAmount: 1560,
    validatedAmount: 1560,
    approvedAmount: 0,
    decision: "pendente",
    createdAt: "2026-04-11T12:45:00Z",
    updatedAt: "2026-04-11T12:45:00Z",
  },
];

const releaseRequestTwoItems: ReleaseRequest["items"] = [
  {
    id: "rr-item-002",
    releaseRequestId: "rr-002",
    employeeId: "emp-004",
    releaseRubric: "multa_fgts_rescisoria",
    competencyRef: "2026-03",
    allocationStartDate: "2024-08-01",
    allocationEndDate: "2026-03-20",
    employmentStartDate: "2024-08-14",
    factOccurredOn: "2026-03-20",
    calculationMemory: {
      baseAmount: 3920,
      proportionalFraction: 1,
      referenceMonths: 19,
      notes: "Multa rescis?ria calculada conforme desligamento.",
    },
    requestedAmount: 3920,
    validatedAmount: 3920,
    approvedAmount: 3650,
    decision: "aprovado_parcial",
    createdAt: "2026-04-08T09:12:00Z",
    updatedAt: "2026-04-10T15:04:00Z",
  },
];

export const releaseRequests: ReleaseRequest[] = [
  {
    id: "rr-001",
    contractId: "c-2cjm-001",
    companyId: "company-atlas",
    protocol: "RR-2026-00018",
    releaseType: "ferias",
    movementMode: "resgate_contratada",
    status: "enviada",
    createdAt: "2026-04-11T12:45:00Z",
    updatedAt: "2026-04-11T12:45:00Z",
    requestedBy: "Marina Gomes",
    requestedByUserId: "user-002",
    factualBasis: "Gozo de f?rias do empregado vinculado ao contrato.",
    competencyStart: "2026-03",
    competencyEnd: "2026-03",
    requestedTotalAmount: 1560,
    notes: "Solicita??o inicial do fluxo de f?rias.",
    analyst: "Felipe Costa",
    items: releaseRequestOneItems,
    requiredDocuments: releaseRequestOneDocumentPlan.expectedCurrentStage,
    missingDocuments: releaseRequestOneDocumentPlan.missingCurrentStage,
    documentSummary: {
      provided: releaseRequestOneDocumentPlan.provided,
      expectedCurrentStage: releaseRequestOneDocumentPlan.expectedCurrentStage,
      missingCurrentStage: releaseRequestOneDocumentPlan.missingCurrentStage,
      expectedByCategory: releaseRequestOneDocumentPlan.expectedByCategory,
      missingByCategory: releaseRequestOneDocumentPlan.missingByCategory,
      deferredByCategory: releaseRequestOneDocumentPlan.deferredByCategory,
    },
    workflow: summarizeReleaseRequestWorkflow({
      status: "enviada",
      missingDocumentCount: releaseRequestOneDocumentPlan.missingCurrentStage.length,
      itemDecisions: releaseRequestOneItems.map((item) => item.decision),
      movementMode: "resgate_contratada",
      normativeRegime: "cnj_651_2025",
      providedDocuments: releaseRequestOneDocumentPlan.provided,
      approvedAmount: releaseRequestOneItems.reduce(
        (total, item) => total + item.approvedAmount,
        0,
      ),
      currentBalance: 148320.48,
      approvedPendingExecution: 1560,
      unexplainedDifference: 943.18,
      linkedAccount: {
        isOfficialPublicBank: true,
        cooperationTermRef: "TCT-CNJ-BB-2025",
      },
    }),
  },
  {
    id: "rr-002",
    contractId: "c-2cjm-002",
    companyId: "company-vigil",
    protocol: "RR-2026-00021",
    releaseType: "rescisao",
    movementMode: "resgate_contratada",
    status: "aprovada_parcial",
    createdAt: "2026-04-08T09:12:00Z",
    updatedAt: "2026-04-10T15:04:00Z",
    requestedBy: "Priscila Moraes",
    requestedByUserId: "user-001",
    analyst: "Guilherme Nunes",
    approver: "Cap. Rodrigo Neves",
    factualBasis: "Desligamento sem justa causa do empregado vinculado ao contrato.",
    competencyStart: "2026-03",
    competencyEnd: "2026-03",
    requestedTotalAmount: 3920,
    notes: "Rescis?o com multa do FGTS.",
    items: releaseRequestTwoItems,
    requiredDocuments: releaseRequestTwoDocumentPlan.expectedCurrentStage,
    missingDocuments: releaseRequestTwoDocumentPlan.missingCurrentStage,
    documentSummary: {
      provided: releaseRequestTwoDocumentPlan.provided,
      expectedCurrentStage: releaseRequestTwoDocumentPlan.expectedCurrentStage,
      missingCurrentStage: releaseRequestTwoDocumentPlan.missingCurrentStage,
      expectedByCategory: releaseRequestTwoDocumentPlan.expectedByCategory,
      missingByCategory: releaseRequestTwoDocumentPlan.missingByCategory,
      deferredByCategory: releaseRequestTwoDocumentPlan.deferredByCategory,
    },
    workflow: summarizeReleaseRequestWorkflow({
      status: "aprovada_parcial",
      missingDocumentCount: releaseRequestTwoDocumentPlan.missingCurrentStage.length,
      itemDecisions: releaseRequestTwoItems.map((item) => item.decision),
      movementMode: "resgate_contratada",
      normativeRegime: "cnj_169_2013",
      providedDocuments: releaseRequestTwoDocumentPlan.provided,
      approvedAmount: releaseRequestTwoItems.reduce(
        (total, item) => total + item.approvedAmount,
        0,
      ),
      currentBalance: 232904.12,
      approvedPendingExecution: 3650,
      unexplainedDifference: 0,
      linkedAccount: {
        isOfficialPublicBank: true,
        cooperationTermRef: "TCT-CNJ-CEF-2024",
      },
      latestAdministrativeApproval: {
        decision: "aprovar_parcial",
        decidedBy: "Cap. Rodrigo Neves",
        decidedAt: "2026-04-10T15:04:00Z",
        notes: "Aprovação administrativa parcial mantida após glosa da análise.",
      },
      latestFinancialPreparationApproval: {
        decision: "aprovar",
        decidedBy: "Rafaela Vasques",
        decidedAt: "2026-04-11T10:30:00Z",
        notes: "Preparo financeiro interno concluído para futura execução.",
      },
    }),
  },
];

export const reconciliations: ReconciliationRecord[] = [
  {
    id: "rec-001",
    contractId: "c-2cjm-001",
    competency: "2026-03",
    bankBalance: 148320.48,
    provisionBalance: 142990,
    approvedPendingExecution: 1560,
    explainedDifference: 2827.3,
    unexplainedDifference: 943.18,
    differenceType: "nao_explicada",
    operationalClosure: {
      state: "com_pendencias",
      reason:
        "Ainda existe diferença não explicada e valor pendente de execução nesta competência.",
    },
  },
  {
    id: "rec-002",
    contractId: "c-2cjm-002",
    competency: "2026-03",
    bankBalance: 232904.12,
    provisionBalance: 230810,
    approvedPendingExecution: 3650,
    explainedDifference: 444.12,
    unexplainedDifference: 0,
    differenceType: "explicada",
    operationalClosure: {
      state: "com_pendencias",
      reason: "Ainda existe valor aprovado pendente de execução nesta competência.",
    },
  },
];

export const auditEvents: AuditEvent[] = [
  {
    id: "audit-001",
    contractId: "c-2cjm-001",
    actor: "Felipe Costa",
    action: "Solicitação em exigência",
    entity: "release_request",
    happenedAt: "2026-04-12T10:20:00Z",
    details:
      "Folha da competência 03/2026 não anexada. Pedido devolvido para complementação.",
  },
  {
    id: "audit-002",
    contractId: "c-2cjm-002",
    actor: "Cap. Rodrigo Neves",
    action: "Aprovação parcial",
    entity: "release_request_item",
    happenedAt: "2026-04-10T15:04:00Z",
    details:
      "Glosa de R$ 270,00 por divergência em memória de cálculo da multa FGTS.",
  },
  {
    id: "audit-003",
    contractId: "c-2cjm-002",
    actor: "Beatriz Campos",
    action: "Reabertura de competência",
    entity: "competency",
    happenedAt: "2026-04-04T11:00:00Z",
    details:
      "Competência 03/2026 reaberta para reprocessamento após desligamento retroativo.",
  },
];

export const users: AppUser[] = [
  {
    id: "user-001",
    name: "Beatriz Campos",
    email: "beatriz.campos@jmu.mil.br",
    role: "Administrador do órgão",
    scope: "2CJM",
    mfaEnabled: true,
  },
  {
    id: "user-002",
    name: "Felipe Costa",
    email: "felipe.costa@jmu.mil.br",
    role: "Analista",
    scope: "CT 07/2025",
    mfaEnabled: true,
  },
  {
    id: "user-003",
    name: "Rafaela Vasques",
    email: "rafaela.vasques@jmu.mil.br",
    role: "Financeiro",
    scope: "2CJM",
    mfaEnabled: true,
  },
  {
    id: "user-004",
    name: "Henrique Dias",
    email: "henrique.dias@jmu.mil.br",
    role: "Auditoria interna",
    scope: "Leitura institucional",
    mfaEnabled: true,
  },
];
