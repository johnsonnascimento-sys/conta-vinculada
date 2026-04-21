import assert from "node:assert/strict";
import test from "node:test";
import { summarizeReleaseRequestWorkflow } from "@/features/releases/workflow";

test("workflow summary separates documentary pendency from awaiting analysis", () => {
  const summary = summarizeReleaseRequestWorkflow({
    status: "enviada",
    missingDocumentCount: 2,
    itemDecisions: ["pendente"],
  });

  assert.equal(summary.derivedStatus, "enviada");
  assert.equal(summary.documentState, "pendente");
  assert.equal(summary.analysisState, "aguardando_analise");
  assert.equal(summary.decisionState, "sem_decisao");
  assert.equal(summary.canAggregateDecision, false);
});

test("workflow summary keeps explicit documentary requirement apart from decision state", () => {
  const summary = summarizeReleaseRequestWorkflow({
    status: "em_exigencia",
    missingDocumentCount: 1,
    itemDecisions: ["pendente", "pendente"],
  });

  assert.equal(summary.derivedStatus, "em_exigencia");
  assert.equal(summary.analysisState, "em_exigencia");
  assert.equal(summary.documentState, "pendente");
  assert.equal(summary.decisionState, "sem_decisao");
});

test("workflow summary reports aggregate decision only when all items are decided", () => {
  const summary = summarizeReleaseRequestWorkflow({
    status: "em_analise",
    missingDocumentCount: 0,
    itemDecisions: ["aprovado", "pendente"],
  });

  assert.equal(summary.derivedStatus, "em_analise");
  assert.equal(summary.analysisState, "em_analise");
  assert.equal(summary.decisionState, "parcial");
  assert.equal(summary.canAggregateDecision, false);
});

test("workflow summary consolidates the request when item decisions are complete", () => {
  const summary = summarizeReleaseRequestWorkflow({
    status: "em_analise",
    missingDocumentCount: 0,
    itemDecisions: ["aprovado", "glosado"],
  });

  assert.equal(summary.derivedStatus, "aprovada_parcial");
  assert.equal(summary.analysisState, "concluida");
  assert.equal(summary.decisionState, "aprovada_parcial");
  assert.equal(summary.canAggregateDecision, true);
});
