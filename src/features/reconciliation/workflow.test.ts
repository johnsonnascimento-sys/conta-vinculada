import assert from "node:assert/strict";
import test from "node:test";
import {
  matchesReconciliationFilter,
  summarizeCompetencyFormalClosure,
  summarizeCompetencyOperationalHistory,
  summarizeReconciliationDifferenceSummary,
  summarizeReconciliationItems,
  summarizeReconciliationOperationalQualification,
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

test("operational history sorts events chronologically and exposes last relevant occurrence", () => {
  const operationalClosure = summarizeReconciliationOperationalClosure({
    approvedPendingExecution: 0,
    unexplainedDifference: 120,
  });
  const formalClosure = summarizeCompetencyFormalClosure({
    status: "calculada",
    operationalClosureState: operationalClosure.state,
    occurrences: [],
  });

  const summary = summarizeCompetencyOperationalHistory({
    status: "calculada",
    processedAt: "2026-04-02T18:10:00Z",
    occurrences: [
      {
        id: "occ-2",
        type: "apontamento",
        actor: "Analista B",
        description: "Divergencia ainda nao explicada.",
        happenedAt: "2026-04-12T10:20:00Z",
      },
      {
        id: "occ-1",
        type: "apontamento",
        actor: "Analista A",
        description: "Leitura inicial da competencia.",
        happenedAt: "2026-04-05T09:00:00Z",
      },
    ],
    approvedPendingExecution: 0,
    unexplainedDifference: 120,
    operationalClosure,
    formalClosure,
  });

  assert.deepEqual(
    summary.timeline.map((event) => event.id),
    ["processamento-2026-04-02T18:10:00Z", "occ-1", "occ-2"],
  );
  assert.equal(summary.lastRelevantOccurrence?.id, "occ-2");
});

test("operational history recommends residual difference review when competency remains open", () => {
  const operationalClosure = summarizeReconciliationOperationalClosure({
    approvedPendingExecution: 0,
    unexplainedDifference: 50,
  });
  const formalClosure = summarizeCompetencyFormalClosure({
    status: "conciliada",
    operationalClosureState: operationalClosure.state,
    occurrences: [],
  });

  const summary = summarizeCompetencyOperationalHistory({
    status: "conciliada",
    approvedPendingExecution: 0,
    unexplainedDifference: 50,
    operationalClosure,
    formalClosure,
    occurrences: [],
  });

  assert.equal(summary.recommendedAction, "verificar_divergencia_residual");
});

test("operational history keeps reopened competency in re-evaluation mode", () => {
  const operationalClosure = summarizeReconciliationOperationalClosure({
    approvedPendingExecution: 0,
    unexplainedDifference: 0,
  });
  const formalClosure = summarizeCompetencyFormalClosure({
    status: "reaberta",
    operationalClosureState: operationalClosure.state,
    reopeningJustification: "Reprocessamento necessario.",
    occurrences: [],
  });

  const summary = summarizeCompetencyOperationalHistory({
    status: "reaberta",
    reopenedAt: "2026-04-04T11:00:00Z",
    reopenedBy: "Beatriz Campos",
    reopeningJustification: "Reprocessamento necessario.",
    approvedPendingExecution: 0,
    unexplainedDifference: 0,
    operationalClosure,
    formalClosure,
    occurrences: [],
  });

  assert.equal(summary.recommendedAction, "reavaliar_apos_reabertura");
  assert.equal(summary.currentSituationLabel, "Competencia reaberta em acompanhamento");
});

test("reconciliation qualification prioritizes residual divergence as high priority", () => {
  const operationalClosure = summarizeReconciliationOperationalClosure({
    approvedPendingExecution: 120,
    unexplainedDifference: 35,
  });
  const formalClosure = summarizeCompetencyFormalClosure({
    status: "calculada",
    operationalClosureState: operationalClosure.state,
    occurrences: [],
  });

  const summary = summarizeReconciliationOperationalQualification({
    approvedPendingExecution: 120,
    unexplainedDifference: 35,
    formalClosure,
  });

  assert.equal(summary.classification, "divergencia_residual");
  assert.equal(summary.trackingState, "exige_revisao");
  assert.equal(summary.priority, "alta");
});

test("reconciliation qualification identifies sensitive justification after reopening", () => {
  const operationalClosure = summarizeReconciliationOperationalClosure({
    approvedPendingExecution: 0,
    unexplainedDifference: 0,
  });
  const formalClosure = summarizeCompetencyFormalClosure({
    status: "reaberta",
    operationalClosureState: operationalClosure.state,
    reopeningJustification: "Reprocessamento retroativo necessario.",
    occurrences: [],
  });

  const summary = summarizeReconciliationOperationalQualification({
    approvedPendingExecution: 0,
    unexplainedDifference: 0,
    formalClosure,
    reopeningJustification: "Reprocessamento retroativo necessario.",
  });

  assert.equal(summary.classification, "justificativa_sensivel");
  assert.equal(summary.hasSensitiveJustification, true);
});

test("reconciliation items distinguish explained linkage from residual unexplained difference", () => {
  const items = summarizeReconciliationItems({
    unexplainedDifference: 943.18,
    items: [
      {
        id: "rec-item-001",
        justification: "Rendimento identificado no extrato.",
        createdAt: "2026-04-12T10:40:00Z",
        bankEntry: {
          id: "entry-002",
          description: "Rendimento bancario de marco",
          type: "rendimento",
          amount: 942.18,
          occurredOn: "2026-04-01",
        },
      },
    ],
  });

  const summary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 2827.3,
    unexplainedDifference: 943.18,
    items: [
      {
        id: "rec-item-001",
        justification: "Rendimento identificado no extrato.",
        createdAt: "2026-04-12T10:40:00Z",
        bankEntry: {
          id: "entry-002",
          description: "Rendimento bancario de marco",
          type: "rendimento",
          amount: 942.18,
          occurredOn: "2026-04-01",
        },
      },
    ],
  });

  assert.equal(items.length, 2);
  assert.equal(items[0].kind, "diferenca_explicada");
  assert.equal(items[1].kind, "diferenca_nao_explicada");
  assert.equal(summary.explainedItemsCount, 1);
  assert.equal(summary.hasResidualUnexplained, true);
  assert.equal(summary.explainedBalanceStillUnitemized, 1885.12);
});

test("reconciliation filter matches apt and sensitive cases without changing closure rules", () => {
  const aptRecord = {
    unexplainedDifference: 0,
    formalClosure: {
      state: "apta_para_fechamento",
    },
    qualification: {
      hasPendingJustification: false,
      hasSensitiveJustification: false,
    },
  };

  const sensitiveRecord = {
    unexplainedDifference: 0,
    formalClosure: {
      state: "fechada",
    },
    qualification: {
      hasPendingJustification: true,
      hasSensitiveJustification: true,
    },
  };

  assert.equal(matchesReconciliationFilter(aptRecord as never, "aptas_fechamento"), true);
  assert.equal(
    matchesReconciliationFilter(sensitiveRecord as never, "justificativas_sensiveis"),
    true,
  );
});
