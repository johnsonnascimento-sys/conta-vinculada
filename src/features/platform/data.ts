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

export const tenant: Tenant = {
  id: "tenant-jmu",
  name: "Justiça Militar da União",
  jurisdiction: "2ª Circunscrição Judiciária Militar",
};

export const organizations: Organization[] = [
  { id: "org-2cjm", tenantId: tenant.id, name: "2ª Circunscrição Judiciária Militar", code: "2CJM" },
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
    object: "Prestação continuada com dedicação exclusiva de mão de obra para recepção e apoio administrativo.",
    startDate: "2025-02-01",
    endDate: "2027-01-31",
    status: "ativo",
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
    startDate: "2024-08-01",
    endDate: "2026-07-31",
    status: "ativo",
    bankAccountId: "bank-002",
    riskLevel: "medio",
  },
];

export const employees: Employee[] = [
  { id: "emp-001", tenantId: tenant.id, name: "Luciana Freitas", cpf: "123.456.789-10", role: "Recepcionista", status: "ativo", admissionDate: "2024-03-10" },
  { id: "emp-002", tenantId: tenant.id, name: "Carlos Menezes", cpf: "987.654.321-00", role: "Assistente administrativo", status: "ativo", admissionDate: "2023-11-01" },
  { id: "emp-003", tenantId: tenant.id, name: "Aline Tavares", cpf: "111.222.333-44", role: "Vigilante", status: "ativo", admissionDate: "2024-08-14" },
  { id: "emp-004", tenantId: tenant.id, name: "Marcos Faria", cpf: "444.555.666-77", role: "Vigilante", status: "desligado", admissionDate: "2024-08-14", terminationDate: "2026-03-20" },
];

export const allocations: EmployeeAllocation[] = [
  { id: "alloc-001", employeeId: "emp-001", contractId: "c-2cjm-001", startDate: "2025-02-01", costCenter: "Recepção" },
  { id: "alloc-002", employeeId: "emp-002", contractId: "c-2cjm-001", startDate: "2025-02-01", costCenter: "Apoio administrativo" },
  { id: "alloc-003", employeeId: "emp-003", contractId: "c-2cjm-002", startDate: "2024-08-01", costCenter: "Vigilância armada" },
  { id: "alloc-004", employeeId: "emp-004", contractId: "c-2cjm-002", startDate: "2024-08-01", endDate: "2026-03-20", costCenter: "Vigilância desarmada" },
];

export const competencies: Competency[] = [
  { id: "comp-2026-01-c1", contractId: "c-2cjm-001", competency: "2026-01", status: "fechada", processedAt: "2026-02-03T15:00:00Z" },
  { id: "comp-2026-02-c1", contractId: "c-2cjm-001", competency: "2026-02", status: "conciliada", processedAt: "2026-03-05T13:00:00Z" },
  { id: "comp-2026-03-c1", contractId: "c-2cjm-001", competency: "2026-03", status: "calculada", processedAt: "2026-04-02T18:10:00Z" },
  { id: "comp-2026-03-c2", contractId: "c-2cjm-002", competency: "2026-03", status: "reaberta", processedAt: "2026-04-04T11:00:00Z" },
];

export const provisionBalances: ProvisionBalance[] = [
  { employeeId: "emp-001", contractId: "c-2cjm-001", rubric: "13º salário", balance: 6840, reserved: 0, released: 1260 },
  { employeeId: "emp-001", contractId: "c-2cjm-001", rubric: "Férias + 1/3", balance: 9120, reserved: 1560, released: 880 },
  { employeeId: "emp-002", contractId: "c-2cjm-001", rubric: "Férias + 1/3", balance: 10830, reserved: 0, released: 2310 },
  { employeeId: "emp-003", contractId: "c-2cjm-002", rubric: "13º salário", balance: 7740, reserved: 0, released: 0 },
  { employeeId: "emp-004", contractId: "c-2cjm-002", rubric: "Multa FGTS", balance: 3920, reserved: 3920, released: 0 },
];

export const bankAccounts: BankAccount[] = [
  { id: "bank-001", contractId: "c-2cjm-001", bankName: "Banco do Brasil", branch: "1234-5", accountNumber: "98765-4", currentBalance: 148320.48 },
  { id: "bank-002", contractId: "c-2cjm-002", bankName: "Caixa Econômica Federal", branch: "0021", accountNumber: "778899-0", currentBalance: 232904.12 },
];

export const bankEntries: BankEntry[] = [
  { id: "entry-001", accountId: "bank-001", contractId: "c-2cjm-001", competency: "2026-03", type: "deposito", description: "Depósito mensal da competência 03/2026", amount: 25480, occurredOn: "2026-04-05" },
  { id: "entry-002", accountId: "bank-001", contractId: "c-2cjm-001", competency: "2026-03", type: "rendimento", description: "Rendimento bancário de março", amount: 942.18, occurredOn: "2026-04-01" },
  { id: "entry-003", accountId: "bank-001", contractId: "c-2cjm-001", competency: "2026-03", type: "liberacao", description: "Liberação aprovada RR-2026-00018", amount: -3120, occurredOn: "2026-04-09" },
  { id: "entry-004", accountId: "bank-002", contractId: "c-2cjm-002", competency: "2026-03", type: "deposito", description: "Depósito mensal da competência 03/2026", amount: 41820, occurredOn: "2026-04-04" },
  { id: "entry-005", accountId: "bank-002", contractId: "c-2cjm-002", competency: "2026-03", type: "ajuste", description: "Ajuste pendente de classificação do extrato", amount: -1940, occurredOn: "2026-04-10" },
];

export const releaseRequests: ReleaseRequest[] = [
  {
    id: "rr-001",
    contractId: "c-2cjm-001",
    companyId: "company-atlas",
    protocol: "RR-2026-00018",
    status: "em_analise",
    createdAt: "2026-04-11T12:45:00Z",
    requestedBy: "Marina Gomes",
    analyst: "Felipe Costa",
    items: [{ id: "rr-item-001", employeeId: "emp-001", rubric: "Férias + 1/3", competency: "2026-03", requestedAmount: 1560, approvedAmount: 0, decision: "pendente" }],
    requiredDocuments: ["ferias", "comprovante_pagamento", "folha"],
    missingDocuments: ["folha"],
  },
  {
    id: "rr-002",
    contractId: "c-2cjm-002",
    companyId: "company-vigil",
    protocol: "RR-2026-00021",
    status: "aprovada_parcial",
    createdAt: "2026-04-08T09:12:00Z",
    requestedBy: "Priscila Moraes",
    analyst: "Guilherme Nunes",
    approver: "Cap. Rodrigo Neves",
    items: [{ id: "rr-item-002", employeeId: "emp-004", rubric: "Multa FGTS", competency: "2026-03", requestedAmount: 3920, approvedAmount: 3650, decision: "aprovado_parcial" }],
    requiredDocuments: ["rescisao", "fgts", "comprovante_pagamento"],
    missingDocuments: [],
  },
];

export const reconciliations: ReconciliationRecord[] = [
  { id: "rec-001", contractId: "c-2cjm-001", competency: "2026-03", bankBalance: 148320.48, provisionBalance: 142990, approvedPendingExecution: 1560, explainedDifference: 2827.3, unexplainedDifference: 943.18, differenceType: "nao_explicada" },
  { id: "rec-002", contractId: "c-2cjm-002", competency: "2026-03", bankBalance: 232904.12, provisionBalance: 230810, approvedPendingExecution: 3650, explainedDifference: 444.12, unexplainedDifference: 0, differenceType: "explicada" },
];

export const auditEvents: AuditEvent[] = [
  { id: "audit-001", contractId: "c-2cjm-001", actor: "Felipe Costa", action: "Solicitação em exigência", entity: "release_request", happenedAt: "2026-04-12T10:20:00Z", details: "Folha da competência 03/2026 não anexada. Pedido devolvido para complementação." },
  { id: "audit-002", contractId: "c-2cjm-002", actor: "Cap. Rodrigo Neves", action: "Aprovação parcial", entity: "release_request_item", happenedAt: "2026-04-10T15:04:00Z", details: "Glosa de R$ 270,00 por divergência em memória de cálculo da multa FGTS." },
  { id: "audit-003", contractId: "c-2cjm-002", actor: "Beatriz Campos", action: "Reabertura de competência", entity: "competency", happenedAt: "2026-04-04T11:00:00Z", details: "Competência 03/2026 reaberta para reprocessamento após desligamento retroativo." },
];

export const users: AppUser[] = [
  { id: "user-001", name: "Beatriz Campos", email: "beatriz.campos@jmu.mil.br", role: "Administrador do órgão", scope: "2CJM", mfaEnabled: true },
  { id: "user-002", name: "Felipe Costa", email: "felipe.costa@jmu.mil.br", role: "Analista", scope: "CT 07/2025", mfaEnabled: true },
  { id: "user-003", name: "Rafaela Vasques", email: "rafaela.vasques@jmu.mil.br", role: "Financeiro", scope: "2CJM", mfaEnabled: true },
  { id: "user-004", name: "Henrique Dias", email: "henrique.dias@jmu.mil.br", role: "Auditoria interna", scope: "Leitura institucional", mfaEnabled: true },
];
