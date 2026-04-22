import assert from "node:assert/strict";
import test from "node:test";
import {
  summarizeCompetencyFormalClosure,
  summarizeReconciliationOperationalClosure,
} from "@/features/reconciliation/workflow";

test("operational closure marks competency as ready only without pending execution and unexplained difference", () => {
  const summary = summarizeReconciliationOperationalClosure({
    approvedPendingExecution: 0,
    unexplainedDifference: 0,
  });

  assert.equal(summary.state, "pronta_para_fechamento_minimo");
});

test("formal closure marks regular competency as ready for formal close when minimum closure is ready", () => {
  const summary = summarizeCompetencyFormalClosure({
    status: "conciliada",
    operationalClosureState: "pronta_para_fechamento_minimo",
    occurrences: [],
  });

  assert.equal(summary.state, "apta_para_fechamento");
  assert.equal(summary.canClose, true);
  assert.equal(summary.canReopen, false);
});

test("formal closure keeps reopened competency explicit while allowing reclose when pending issues are solved", () => {
  const summary = summarizeCompetencyFormalClosure({
    status: "reaberta",
    operationalClosureState: "pronta_para_fechamento_minimo",
    reopeningJustification: "Reprocessamento operacional necessário.",
    occurrences: [],
  });

  assert.equal(summary.state, "reaberta");
  assert.equal(summary.canClose, true);
  assert.equal(summary.canReopen, false);
});

test("formal closure exposes closed competency as reopenable", () => {
  const summary = summarizeCompetencyFormalClosure({
    status: "fechada",
    operationalClosureState: "pronta_para_fechamento_minimo",
    closureJustification: "Competência formalmente encerrada.",
    occurrences: [],
  });

  assert.equal(summary.state, "fechada");
  assert.equal(summary.canClose, false);
  assert.equal(summary.canReopen, true);
});
