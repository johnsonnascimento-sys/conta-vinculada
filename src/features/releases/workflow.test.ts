import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllowedAdministrativeApprovalDecisions,
  summarizeReleaseRequestWorkflow,
} from "@/features/releases/workflow";

function buildSummary(
  overrides?: Partial<Parameters<typeof summarizeReleaseRequestWorkflow>[0]>,
) {
  return summarizeReleaseRequestWorkflow({
    status: "enviada",
    missingDocumentCount: 0,
    itemDecisions: ["pendente"],
    movementMode: "resgate_contratada",
    normativeRegime: "cnj_651_2025",
    ...overrides,
  });
}

test("workflow summary separates documentary pendency from awaiting analysis", () => {
  const summary = buildSummary({
    missingDocumentCount: 2,
  });

  assert.equal(summary.derivedStatus, "enviada");
  assert.equal(summary.documentState, "pendente");
  assert.equal(summary.analysisState, "aguardando_analise");
  assert.equal(summary.decisionState, "sem_decisao");
  assert.equal(summary.canAggregateDecision, false);
  assert.equal(summary.administrativeApproval.state, "nao_apta");
});

test("workflow summary keeps explicit documentary requirement apart from decision state", () => {
  const summary = buildSummary({
    status: "em_exigencia",
    missingDocumentCount: 1,
    itemDecisions: ["pendente", "pendente"],
  });

  assert.equal(summary.derivedStatus, "em_exigencia");
  assert.equal(summary.analysisState, "em_exigencia");
  assert.equal(summary.documentState, "pendente");
  assert.equal(summary.decisionState, "sem_decisao");
  assert.equal(summary.administrativeApproval.canApprove, false);
});

test("workflow summary reports aggregate decision only when all items are decided", () => {
  const summary = buildSummary({
    status: "em_analise",
    itemDecisions: ["aprovado", "pendente"],
  });

  assert.equal(summary.derivedStatus, "em_analise");
  assert.equal(summary.analysisState, "em_analise");
  assert.equal(summary.decisionState, "parcial");
  assert.equal(summary.canAggregateDecision, false);
  assert.equal(summary.administrativeApproval.state, "nao_apta");
});

test("workflow summary marks request as ready for administrative approval after item consolidation", () => {
  const summary = buildSummary({
    status: "em_analise",
    itemDecisions: ["aprovado", "glosado"],
  });

  assert.equal(summary.derivedStatus, "aprovada_parcial");
  assert.equal(summary.analysisState, "concluida");
  assert.equal(summary.decisionState, "aprovada_parcial");
  assert.equal(summary.canAggregateDecision, true);
  assert.equal(summary.administrativeApproval.state, "apta");
  assert.equal(summary.administrativeApproval.canApprove, true);
  assert.equal(summary.administrativeApproval.financialReadiness, "nao_apta");
});

test("workflow summary exposes recorded administrative approval and future financial readiness", () => {
  const summary = buildSummary({
    status: "aprovada",
    itemDecisions: ["aprovado"],
    movementMode: "pagamento_direto_empregado",
    normativeRegime: "cnj_169_2013",
    latestAdministrativeApproval: {
      decision: "aprovar",
      decidedBy: "Beatriz Campos",
      decidedAt: "2026-04-21T12:00:00.000Z",
      notes: "Consolidação administrativa registrada.",
    },
  });

  assert.equal(summary.administrativeApproval.state, "aprovada");
  assert.equal(summary.administrativeApproval.canApprove, false);
  assert.equal(
    summary.administrativeApproval.financialReadiness,
    "apta_para_execucao_futura",
  );
  assert.match(
    summary.administrativeApproval.financialNextStep,
    /pagamento direto aos empregados/i,
  );
});

test("workflow summary blocks financial preparation when operation evidence is missing", () => {
  const summary = buildSummary({
    status: "aprovada_parcial",
    itemDecisions: ["aprovado_parcial"],
    approvedAmount: 3650,
    providedDocuments: ["rescisao", "fgts", "comprovante_pagamento"],
    currentBalance: 232904.12,
    approvedPendingExecution: 3650,
    unexplainedDifference: 0,
    linkedAccount: {
      isOfficialPublicBank: true,
      cooperationTermRef: "TCT-CNJ-CEF-2024",
    },
    latestAdministrativeApproval: {
      decision: "aprovar_parcial",
      decidedBy: "Beatriz Campos",
      decidedAt: "2026-04-21T12:00:00.000Z",
    },
  });

  assert.equal(summary.financialPreparation.state, "nao_apta");
  assert.equal(summary.financialPreparation.canPrepare, false);
  assert.deepEqual(summary.financialPreparation.requiredEvidence, [
    "despacho",
    "parecer",
  ]);
  assert.deepEqual(summary.financialPreparation.missingEvidence, [
    "despacho",
    "parecer",
  ]);
});

test("workflow summary marks request as ready for future execution preparation when conditions are met", () => {
  const summary = buildSummary({
    status: "aprovada_parcial",
    itemDecisions: ["aprovado_parcial"],
    approvedAmount: 3650,
    providedDocuments: [
      "rescisao",
      "fgts",
      "comprovante_pagamento",
      "despacho",
      "parecer",
    ],
    currentBalance: 232904.12,
    approvedPendingExecution: 3650,
    unexplainedDifference: 0,
    linkedAccount: {
      isOfficialPublicBank: true,
      cooperationTermRef: "TCT-CNJ-CEF-2024",
    },
    latestAdministrativeApproval: {
      decision: "aprovar_parcial",
      decidedBy: "Beatriz Campos",
      decidedAt: "2026-04-21T12:00:00.000Z",
    },
  });

  assert.equal(summary.financialPreparation.state, "apta");
  assert.equal(summary.financialPreparation.canPrepare, true);
  assert.equal(summary.financialPreparation.eligibleAmount, 3650);
  assert.equal(summary.financialPreparation.balanceCheck, "suficiente");
  assert.equal(summary.financialPreparation.reconciliationCheck, "regular");
  assert.equal(summary.financialPreparation.effectiveExecutionRecorded, false);
});

test("workflow summary keeps preparation distinct from effective financial execution", () => {
  const summary = buildSummary({
    status: "aprovada",
    itemDecisions: ["aprovado"],
    approvedAmount: 1560,
    providedDocuments: ["ferias", "folha", "comprovante_pagamento", "despacho", "parecer"],
    currentBalance: 148320.48,
    approvedPendingExecution: 1560,
    unexplainedDifference: 0,
    linkedAccount: {
      isOfficialPublicBank: true,
      cooperationTermRef: "TCT-CNJ-BB-2025",
    },
    latestAdministrativeApproval: {
      decision: "aprovar",
      decidedBy: "Beatriz Campos",
      decidedAt: "2026-04-21T12:00:00.000Z",
    },
    latestFinancialPreparationApproval: {
      decision: "aprovar",
      decidedBy: "Rafaela Vasques",
      decidedAt: "2026-04-21T14:00:00.000Z",
      notes: "Checklist financeiro interno concluído.",
    },
  });

  assert.equal(summary.financialPreparation.state, "preparada");
  assert.equal(summary.financialPreparation.canPrepare, false);
  assert.equal(summary.financialPreparation.preparedBy, "Rafaela Vasques");
  assert.equal(summary.financialPreparation.effectiveExecutionRecorded, false);
});

test("workflow summary marks prepared request as awaiting effective execution", () => {
  const summary = summarizeReleaseRequestWorkflow({
    status: "aprovada_parcial",
    missingDocumentCount: 0,
    itemDecisions: ["aprovado_parcial"],
    movementMode: "resgate_contratada",
    normativeRegime: "cnj_169_2013",
    approvedAmount: 3650,
    providedDocuments: ["rescisao", "fgts", "comprovante_pagamento", "despacho"],
    currentBalance: 232904.12,
    approvedPendingExecution: 3650,
    unexplainedDifference: 0,
    linkedAccount: {
      isOfficialPublicBank: true,
      cooperationTermRef: "TCT-CNJ-CEF-2024",
    },
    latestAdministrativeApproval: {
      decision: "aprovar_parcial",
      decidedBy: "Beatriz Campos",
      decidedAt: "2026-04-21T12:00:00.000Z",
    },
    latestFinancialPreparationApproval: {
      decision: "aprovar",
      decidedBy: "Rafaela Vasques",
      decidedAt: "2026-04-21T14:00:00.000Z",
      notes: "Checklist financeiro interno concluído.",
    },
  });

  assert.equal(summary.financialExecution.state, "aguardando_execucao");
  assert.equal(summary.financialExecution.canExecute, true);
  assert.equal(summary.financialExecution.pendingAmount, 3650);
});

test("workflow summary exposes effective execution details from persisted execution", () => {
  const summary = buildSummary({
    status: "aprovada_parcial",
    itemDecisions: ["aprovado_parcial"],
    approvedAmount: 3650,
    providedDocuments: ["rescisao", "fgts", "comprovante_pagamento", "despacho"],
    currentBalance: 232904.12,
    approvedPendingExecution: 0,
    unexplainedDifference: 0,
    linkedAccount: {
      isOfficialPublicBank: true,
      cooperationTermRef: "TCT-CNJ-CEF-2024",
    },
    latestAdministrativeApproval: {
      decision: "aprovar_parcial",
      decidedBy: "Beatriz Campos",
      decidedAt: "2026-04-21T12:00:00.000Z",
    },
    latestFinancialPreparationApproval: {
      decision: "aprovar",
      decidedBy: "Rafaela Vasques",
      decidedAt: "2026-04-21T14:00:00.000Z",
    },
    latestFinancialExecution: {
      bankEntryId: "entry-006",
      bankEntryDescription: "Liberação preparada para RR-2026-00021",
      executedAmount: 3650,
      executedAt: "2026-04-22T12:00:00.000Z",
    },
  });

  assert.equal(summary.derivedStatus, "liberada");
  assert.equal(summary.financialExecution.state, "executada");
  assert.equal(summary.financialExecution.canExecute, false);
  assert.equal(summary.financialExecution.bankEntryId, "entry-006");
  assert.equal(summary.financialExecution.executedAmount, 3650);
});

test("allowed administrative decisions follow the consolidated item result", () => {
  assert.deepEqual(getAllowedAdministrativeApprovalDecisions("aprovada"), [
    "aprovar",
    "rejeitar",
  ]);
  assert.deepEqual(
    getAllowedAdministrativeApprovalDecisions("aprovada_parcial"),
    ["aprovar_parcial", "rejeitar"],
  );
  assert.deepEqual(getAllowedAdministrativeApprovalDecisions("rejeitada"), [
    "rejeitar",
  ]);
  assert.deepEqual(getAllowedAdministrativeApprovalDecisions("sem_decisao"), []);
});
