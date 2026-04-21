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
