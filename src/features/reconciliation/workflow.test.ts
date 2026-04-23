import assert from "node:assert/strict";
import test from "node:test";
import {
  annotateReconciliationRecurrenceWithinContract,
  matchesReconciliationFilter,
  summarizeCompetencyFormalClosure,
  summarizeCompetencyOperationalHistory,
  summarizeContractReconciliation,
  summarizeReconciliationDifferenceReading,
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
  assert.equal(summary.explainedCoverageState, "itemizacao_parcial");
  assert.equal(summary.requiresDirectedReview, true);
  assert.equal(summary.directedReviewRecommendation, "revisar saldo sem itemizacao");
});

test("reconciliation difference summary marks complete coverage when explained balance is fully itemized", () => {
  const summary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 444.12,
    unexplainedDifference: 0,
    items: [
      {
        id: "rec-item-002",
        justification: "Rendimento identificado no extrato.",
        createdAt: "2026-04-12T15:20:00Z",
        bankEntry: {
          id: "entry-007",
          description: "Rendimento identificado na competencia",
          type: "rendimento",
          amount: 444.12,
          occurredOn: "2026-04-12",
        },
      },
    ],
  });

  assert.equal(summary.explainedCoverageState, "itemizacao_completa");
  assert.equal(summary.explainedCoveragePercentage, 100);
  assert.equal(summary.unitemizedBalanceOrigin, "sem_saldo_remanescente");
  assert.equal(summary.requiresDirectedReview, false);
});

test("reconciliation difference summary marks sufficient coverage for small residual without forcing review", () => {
  const summary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 1000,
    unexplainedDifference: 0,
    items: [
      {
        id: "rec-item-003",
        justification: "Cobranca identificada no extrato.",
        createdAt: "2026-04-15T10:00:00Z",
        bankEntry: {
          id: "entry-008",
          description: "Ajuste identificado",
          type: "ajuste",
          amount: -850,
          occurredOn: "2026-04-15",
        },
      },
    ],
  });

  assert.equal(summary.explainedCoverageState, "itemizacao_suficiente");
  assert.equal(summary.explainedCoveragePercentage, 85);
  assert.equal(
    summary.unitemizedBalanceOrigin,
    "saldo_residual_baixa_materialidade",
  );
  assert.equal(summary.requiresDirectedReview, false);
  assert.equal(summary.directedReviewRecommendation, "acompanhar saldo residual");
  assert.equal(summary.unitemizedBalancePriority, "baixa");
});

test("reconciliation difference summary classifies missing itemization origin as no-detail explained balance", () => {
  const summary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 700,
    unexplainedDifference: 0,
    items: [],
  });

  assert.equal(summary.explainedCoverageState, "sem_itemizacao");
  assert.equal(
    summary.unitemizedBalanceOrigin,
    "saldo_explicado_sem_detalhamento",
  );
  assert.equal(summary.unitemizedBalancePriority, "alta");
  assert.equal(summary.requiresDirectedReview, true);
  assert.equal(summary.directedReviewRecommendation, "iniciar revisao dirigida");
});

test("reconciliation difference summary classifies insufficient justification separately from itemization coverage", () => {
  const summary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 900,
    unexplainedDifference: 0,
    items: [
      {
        id: "rec-item-004",
        justification: "",
        createdAt: "2026-04-18T09:00:00Z",
        bankEntry: {
          id: "entry-009",
          description: "Ajuste operacional",
          type: "ajuste",
          amount: -300,
          occurredOn: "2026-04-18",
        },
      },
    ],
  });

  assert.equal(summary.explainedCoverageState, "itemizacao_parcial");
  assert.equal(summary.unitemizedBalanceOrigin, "justificativa_insuficiente");
  assert.equal(summary.unitemizedBalancePriority, "alta");
  assert.equal(
    summary.directedReviewRecommendation,
    "complementar justificativa operacional",
  );
});

test("reconciliation difference summary derives medium priority when itemization is still in progress", () => {
  const summary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 1200,
    unexplainedDifference: 0,
    items: [
      {
        id: "rec-item-005",
        justification: "Parte do ajuste ja vinculada ao extrato.",
        createdAt: "2026-04-20T09:00:00Z",
        bankEntry: {
          id: "entry-010",
          description: "Ajuste conciliatorio parcial",
          type: "ajuste",
          amount: -400,
          occurredOn: "2026-04-20",
        },
      },
    ],
  });

  assert.equal(summary.unitemizedBalanceOrigin, "itemizacao_em_andamento");
  assert.equal(summary.unitemizedBalancePriority, "media");
  assert.equal(summary.requiresDirectedReview, true);
});

test("reconciliation difference reading marks structural when residual remains open without local treatment", () => {
  const differenceSummary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 0,
    unexplainedDifference: 800,
    items: [],
  });

  const reading = summarizeReconciliationDifferenceReading({
    differenceSummary,
    formalClosure: { state: "aberta" },
    qualification: { priority: "alta" },
  });

  assert.equal(reading.profile, "estrutural");
});

test("reconciliation difference reading marks pontual when coverage is sufficient and residual is localized", () => {
  const differenceSummary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 1000,
    unexplainedDifference: 0,
    items: [
      {
        id: "rec-item-006",
        justification: "Ajuste residual localizado.",
        createdAt: "2026-04-21T09:00:00Z",
        bankEntry: {
          id: "entry-011",
          description: "Ajuste localizado",
          type: "ajuste",
          amount: -850,
          occurredOn: "2026-04-21",
        },
      },
    ],
  });

  const reading = summarizeReconciliationDifferenceReading({
    differenceSummary,
    formalClosure: { state: "aberta" },
    qualification: { priority: "baixa" },
  });

  assert.equal(reading.profile, "pontual");
});

test("reconciliation difference reading marks mixed when residual open coexists with explained remainder", () => {
  const differenceSummary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 2827.3,
    unexplainedDifference: 943.18,
    items: [
      {
        id: "rec-item-007",
        justification: "Rendimento identificado no extrato.",
        createdAt: "2026-04-12T10:40:00Z",
        bankEntry: {
          id: "entry-012",
          description: "Rendimento bancario de marco",
          type: "rendimento",
          amount: 942.18,
          occurredOn: "2026-04-01",
        },
      },
    ],
  });

  const reading = summarizeReconciliationDifferenceReading({
    differenceSummary,
    formalClosure: { state: "aberta" },
    qualification: { priority: "alta" },
  });

  assert.equal(reading.profile, "mista");
});

test("reconciliation difference reading stays indeterminate when no relevant divergence exists", () => {
  const differenceSummary = summarizeReconciliationDifferenceSummary({
    explainedDifference: 0,
    unexplainedDifference: 0,
    items: [],
  });

  const reading = summarizeReconciliationDifferenceReading({
    differenceSummary,
    formalClosure: { state: "apta_para_fechamento" },
    qualification: { priority: "baixa" },
  });

  assert.equal(reading.profile, "indeterminada");
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
    differenceSummary: {
      explainedBalanceStillUnitemized: 0,
      unitemizedBalanceOrigin: "sem_saldo_remanescente",
      unitemizedBalancePriority: "baixa",
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
    differenceSummary: {
      explainedBalanceStillUnitemized: 0,
      unitemizedBalanceOrigin: "sem_saldo_remanescente",
      unitemizedBalancePriority: "baixa",
    },
  };

  assert.equal(matchesReconciliationFilter(aptRecord as never, "aptas_fechamento"), true);
  assert.equal(
    matchesReconciliationFilter(sensitiveRecord as never, "justificativas_sensiveis"),
    true,
  );
});

test("reconciliation filter matches remaining explained balance filters", () => {
  const inProgressRecord = {
    unexplainedDifference: 0,
    formalClosure: {
      state: "aberta",
    },
    qualification: {
      hasPendingJustification: false,
      hasSensitiveJustification: false,
    },
    differenceSummary: {
      explainedBalanceStillUnitemized: 1885.12,
      unitemizedBalanceOrigin: "itemizacao_em_andamento",
      unitemizedBalancePriority: "media",
    },
  };

  const insufficientRecord = {
    ...inProgressRecord,
    differenceSummary: {
      explainedBalanceStillUnitemized: 600,
      unitemizedBalanceOrigin: "justificativa_insuficiente",
      unitemizedBalancePriority: "alta",
    },
  };

  const lowMaterialityRecord = {
    ...inProgressRecord,
    differenceSummary: {
      explainedBalanceStillUnitemized: 120,
      unitemizedBalanceOrigin: "saldo_residual_baixa_materialidade",
      unitemizedBalancePriority: "baixa",
    },
  };

  assert.equal(
    matchesReconciliationFilter(inProgressRecord as never, "remanescentes_relevantes"),
    true,
  );
  assert.equal(
    matchesReconciliationFilter(inProgressRecord as never, "itemizacao_andamento"),
    true,
  );
  assert.equal(
    matchesReconciliationFilter(
      insufficientRecord as never,
      "justificativa_insuficiente_remanescente",
    ),
    true,
  );
  assert.equal(
    matchesReconciliationFilter(
      lowMaterialityRecord as never,
      "baixa_materialidade_remanescente",
    ),
    true,
  );
});

function makeRecord(overrides: Record<string, unknown>) {
  return {
    competency: overrides.competency ?? "2026-01",
    differenceSummary: {
      explainedAmount: overrides.explainedAmount ?? 0,
      explainedItemsAmount: overrides.explainedItemsAmount ?? 0,
      explainedBalanceStillUnitemized: overrides.explainedBalanceStillUnitemized ?? 0,
      unexplainedAmount: overrides.unexplainedAmount ?? 0,
      hasResidualUnexplained: overrides.hasResidualUnexplained ?? false,
      unitemizedBalancePriority: overrides.unitemizedBalancePriority ?? "baixa",
    },
    formalClosure: {
      state: overrides.formalClosureState ?? "aberta",
    },
    differenceReading: {
      profile: overrides.profile ?? "indeterminada",
      profileLabel: overrides.profileLabel ?? "indeterminada",
      profileReason: overrides.profileReason ?? "Sem predominancia relevante.",
      recurrenceContext: overrides.recurrenceContext ?? "isolado",
      recurrenceContextLabel: overrides.recurrenceContextLabel ?? "caso isolado",
      recurrenceContextReason:
        overrides.recurrenceContextReason ??
        "Nao ha recorrencia relevante identificada entre as competencias conciliadas deste contrato.",
      recurrenceTemporalContext:
        overrides.recurrenceTemporalContext ?? "sem_base_suficiente",
      recurrenceTemporalContextLabel:
        overrides.recurrenceTemporalContextLabel ?? "sem base temporal suficiente",
      recurrenceTemporalContextReason:
        overrides.recurrenceTemporalContextReason ??
        "Ainda nao ha base temporal suficiente para indicar se o padrao recorrente segue ativo ou ficou no historico do contrato.",
      recentStabilityContext:
        overrides.recentStabilityContext ?? "sem_base_recente_suficiente",
      recentStabilityContextLabel:
        overrides.recentStabilityContextLabel ?? "sem base recente suficiente",
      recentStabilityContextReason:
        overrides.recentStabilityContextReason ??
        "Ainda nao ha janela recente suficiente para indicar se o perfil esta estavel, alternante ou em consolidacao.",
      recentMaterialityContext:
        overrides.recentMaterialityContext ?? "materialidade_recente_neutra",
      recentMaterialityContextLabel:
        overrides.recentMaterialityContextLabel ?? "materialidade recente neutra",
      recentMaterialityContextReason:
        overrides.recentMaterialityContextReason ??
        "A leitura recente do contrato nao indica impacto operacional suficiente para destacar esta competencia por materialidade.",
      recentPersistenceContext:
        overrides.recentPersistenceContext ?? "persistencia_neutra",
      recentPersistenceContextLabel:
        overrides.recentPersistenceContextLabel ?? "persistencia recente neutra",
      recentPersistenceContextReason:
        overrides.recentPersistenceContextReason ??
        "Ainda nao ha sustentacao suficiente para indicar persistencia forte ou perda clara de intensidade na janela recente.",
    },
  };
}

test("contract reconciliation summary returns sem_competencias for empty array", () => {
  const summary = summarizeContractReconciliation([] as never[]);
  assert.equal(summary.overallCoverageState, "sem_competencias");
  assert.equal(summary.competencyCount, 0);
  assert.equal(summary.managerialAttention, "normal");
});

test("contract reconciliation summary returns sem_divergencia when totals are zero", () => {
  const records = [makeRecord({}), makeRecord({})];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.overallCoverageState, "sem_divergencia");
  assert.equal(summary.managerialAttention, "normal");
});

test("contract reconciliation summary aggregates amounts across competencies", () => {
  const records = [
    makeRecord({ explainedAmount: 1000, explainedItemsAmount: 800, explainedBalanceStillUnitemized: 200 }),
    makeRecord({ explainedAmount: 500, explainedItemsAmount: 300, explainedBalanceStillUnitemized: 200 }),
  ];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.totalExplainedDifference, 1500);
  assert.equal(summary.totalCoveredByItems, 1100);
  assert.equal(summary.totalExplainedStillUnitemized, 400);
  assert.equal(summary.totalUnexplainedResidual, 0);
});

test("contract reconciliation summary marks cobertura_suficiente at 90%+ coverage", () => {
  const records = [makeRecord({ explainedAmount: 1000, explainedItemsAmount: 950 })];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.overallCoverageState, "cobertura_suficiente");
  assert.equal(summary.managerialAttention, "normal");
});

test("contract reconciliation summary marks cobertura_parcial below 90%", () => {
  const records = [makeRecord({ explainedAmount: 1000, explainedItemsAmount: 600 })];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.overallCoverageState, "cobertura_parcial");
});

test("contract reconciliation summary marks requer_revisao with open unexplained", () => {
  const records = [
    makeRecord({ unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ explainedAmount: 1000, explainedItemsAmount: 1000 }),
  ];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.hasOpenUnexplained, true);
  assert.equal(summary.managerialAttention, "requer_revisao");
  assert.equal(summary.overallCoverageState, "sem_cobertura");
});

test("contract reconciliation summary marks requer_revisao with reopened competency", () => {
  const records = [makeRecord({ formalClosureState: "reaberta" }), makeRecord({ formalClosureState: "fechada" })];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.hasReopenedCompetencies, true);
  assert.equal(summary.managerialAttention, "requer_revisao");
});

test("contract reconciliation summary marks requer_acompanhamento with relevant unitemized and no unexplained", () => {
  const records = [makeRecord({ explainedAmount: 1000, explainedBalanceStillUnitemized: 1000, unitemizedBalancePriority: "alta" })];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.hasRelevantUnitemized, true);
  assert.equal(summary.hasOpenUnexplained, false);
  assert.equal(summary.managerialAttention, "requer_acompanhamento");
});

test("contract reconciliation summary ignores low priority unitemized for managerial attention", () => {
  const records = [makeRecord({ explainedAmount: 1000, explainedItemsAmount: 950, explainedBalanceStillUnitemized: 50, unitemizedBalancePriority: "baixa" })];
  const summary = summarizeContractReconciliation(records as never[]);
  assert.equal(summary.hasRelevantUnitemized, false);
  assert.equal(summary.managerialAttention, "normal");
});

test("contract reconciliation summary marks sem recorrencia relevante when no signal repeats", () => {
  const records = [
    makeRecord({ profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ profile: "pontual", explainedAmount: 1000, explainedItemsAmount: 950 }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recurrenceState, "sem_recorrencia_relevante");
  assert.equal(summary.recurringSignals.length, 0);
});

test("contract reconciliation summary marks recorrencia leve when one relevant signal repeats", () => {
  const records = [
    makeRecord({ profile: "pontual", explainedAmount: 1200, explainedItemsAmount: 900 }),
    makeRecord({ profile: "pontual", explainedAmount: 800, explainedItemsAmount: 700 }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recurrenceState, "recorrencia_leve");
  assert.equal(summary.recurringSignals[0]?.code, "pontual");
});

test("contract reconciliation summary marks recorrencia relevante when multiple signals repeat", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "estrutural",
      unexplainedAmount: 500,
      hasResidualUnexplained: true,
    }),
    makeRecord({
      competency: "2026-02",
      profile: "estrutural",
      unexplainedAmount: 300,
      hasResidualUnexplained: true,
    }),
    makeRecord({
      competency: "2026-03",
      profile: "mista",
      explainedAmount: 1000,
      explainedBalanceStillUnitemized: 400,
      unitemizedBalancePriority: "media",
    }),
    makeRecord({
      competency: "2026-04",
      profile: "mista",
      explainedAmount: 900,
      explainedBalanceStillUnitemized: 300,
      unitemizedBalancePriority: "alta",
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recurrenceState, "recorrencia_relevante");
  assert.equal(summary.recurringSignals.length >= 2, true);
});

test("annotate reconciliation recurrence distinguishes isolated case from recurring pattern", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-02", profile: "estrutural", unexplainedAmount: 250, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-03", profile: "pontual", explainedAmount: 800, explainedItemsAmount: 760 }),
  ];

  const annotated = annotateReconciliationRecurrenceWithinContract(
    records as never[],
  );

  assert.equal(annotated[0]?.differenceReading.recurrenceContext, "padrao_recorrente");
  assert.equal(annotated[1]?.differenceReading.recurrenceContext, "padrao_recorrente");
  assert.equal(annotated[2]?.differenceReading.recurrenceContext, "isolado");
});

test("contract reconciliation summary marks temporal recurrence as active when recurring signal remains in recent competencies", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-02", profile: "pontual", explainedAmount: 700, explainedItemsAmount: 650 }),
    makeRecord({ competency: "2026-03", profile: "estrutural", unexplainedAmount: 300, hasResidualUnexplained: true }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recurrenceTemporalState, "recorrencia_ativa");
  assert.equal(summary.recentRecurringSignals[0]?.code, "estrutural");
});

test("contract reconciliation summary marks temporal recurrence as reduction when signal stays recent but part becomes historical", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-02", profile: "estrutural", unexplainedAmount: 250, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-03", profile: "pontual", explainedAmount: 700, explainedItemsAmount: 620 }),
    makeRecord({ competency: "2026-04", profile: "pontual", explainedAmount: 680, explainedItemsAmount: 600 }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recurrenceTemporalState, "recorrencia_em_reducao");
  assert.equal(summary.recentRecurringSignals[0]?.code, "pontual");
  assert.equal(summary.historicalRecurringSignals.some((signal) => signal.code === "estrutural"), true);
});

test("contract reconciliation summary marks temporal recurrence as historical when recurring signal disappears from recent competencies", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-02", profile: "estrutural", unexplainedAmount: 250, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-03", profile: "pontual", explainedAmount: 700, explainedItemsAmount: 690 }),
    makeRecord({ competency: "2026-04", profile: "indeterminada", explainedAmount: 0, explainedItemsAmount: 0 }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recurrenceTemporalState, "historico_superado");
  assert.equal(summary.historicalRecurringSignals[0]?.code, "estrutural");
  assert.equal(summary.recentRecurringSignals.length, 0);
});

test("annotate reconciliation recurrence distinguishes active recent pattern from historical pattern", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-02", profile: "estrutural", unexplainedAmount: 250, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-03", profile: "pontual", explainedAmount: 700, explainedItemsAmount: 620 }),
    makeRecord({ competency: "2026-04", profile: "pontual", explainedAmount: 680, explainedItemsAmount: 600 }),
  ];

  const annotated = annotateReconciliationRecurrenceWithinContract(records as never[]);

  assert.equal(annotated[0]?.differenceReading.recurrenceTemporalContext, "padrao_historico");
  assert.equal(annotated[1]?.differenceReading.recurrenceTemporalContext, "padrao_historico");
  assert.equal(annotated[2]?.differenceReading.recurrenceTemporalContext, "padrao_ativo");
  assert.equal(annotated[3]?.differenceReading.recurrenceTemporalContext, "padrao_ativo");
});

test("contract reconciliation summary marks recent stability as stable when same profile repeats in recent window", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "pontual", explainedAmount: 500, explainedItemsAmount: 450 }),
    makeRecord({ competency: "2026-02", profile: "pontual", explainedAmount: 550, explainedItemsAmount: 500 }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentStabilityState, "padrao_estavel");
  assert.equal(summary.recentProfileSignals[0]?.code, "pontual");
});

test("contract reconciliation summary marks recent stability as alternating when recent window changes profile", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-02", profile: "pontual", explainedAmount: 550, explainedItemsAmount: 500 }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentStabilityState, "padrao_alternante");
  assert.equal(summary.recentProfileSignals.length, 2);
});

test("contract reconciliation summary marks recent stability as consolidation when only one recent profile is meaningful", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "indeterminada" }),
    makeRecord({ competency: "2026-02", profile: "mista", explainedAmount: 600, explainedBalanceStillUnitemized: 200, unitemizedBalancePriority: "media" }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentStabilityState, "padrao_em_consolidacao");
  assert.equal(summary.recentProfileSignals[0]?.code, "mista");
});

test("annotate reconciliation recurrence marks recent competencies with recent stability context", () => {
  const records = [
    makeRecord({ competency: "2026-01", profile: "estrutural", unexplainedAmount: 500, hasResidualUnexplained: true }),
    makeRecord({ competency: "2026-02", profile: "pontual", explainedAmount: 550, explainedItemsAmount: 500 }),
  ];

  const annotated = annotateReconciliationRecurrenceWithinContract(records as never[]);

  assert.equal(annotated[0]?.differenceReading.recentStabilityContext, "padrao_alternante");
  assert.equal(annotated[1]?.differenceReading.recentStabilityContext, "padrao_alternante");
});

test("contract reconciliation summary marks recent materiality as relevant alternating when recent alternation carries residual or high priority", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "estrutural",
      unexplainedAmount: 500,
      hasResidualUnexplained: true,
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 650,
      explainedItemsAmount: 400,
      explainedBalanceStillUnitemized: 250,
      unitemizedBalancePriority: "alta",
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentMaterialityState, "alternancia_relevante");
});

test("contract reconciliation summary marks recent materiality as light alternating when recent alternation has no strong impact", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "estrutural",
      explainedAmount: 400,
      explainedItemsAmount: 400,
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 500,
      explainedItemsAmount: 500,
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentMaterialityState, "alternancia_leve");
});

test("contract reconciliation summary marks recent materiality as relevant consolidation when repeated pattern keeps recent impact", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "pontual",
      explainedAmount: 700,
      explainedBalanceStillUnitemized: 300,
      unitemizedBalancePriority: "media",
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 650,
      explainedBalanceStillUnitemized: 250,
      unitemizedBalancePriority: "alta",
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentMaterialityState, "consolidacao_relevante");
});

test("contract reconciliation summary marks recent materiality as lower impact consolidation when repeated pattern has no strong impact", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "pontual",
      explainedAmount: 500,
      explainedItemsAmount: 500,
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 550,
      explainedItemsAmount: 550,
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentMaterialityState, "consolidacao_menor_impacto");
});

test("annotate reconciliation recurrence marks recent materiality context by impact level", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "estrutural",
      unexplainedAmount: 500,
      hasResidualUnexplained: true,
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 650,
      explainedItemsAmount: 400,
      explainedBalanceStillUnitemized: 250,
      unitemizedBalancePriority: "alta",
    }),
  ];

  const annotated = annotateReconciliationRecurrenceWithinContract(records as never[]);

  assert.equal(
    annotated[0]?.differenceReading.recentMaterialityContext,
    "maior_impacto_recente",
  );
  assert.equal(
    annotated[1]?.differenceReading.recentMaterialityContext,
    "maior_impacto_recente",
  );
});

test("contract reconciliation summary marks recent persistence as strong when impactful signals remain across several recent cycles", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "pontual",
      explainedAmount: 600,
      explainedBalanceStillUnitemized: 200,
      unitemizedBalancePriority: "alta",
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 650,
      explainedBalanceStillUnitemized: 220,
      unitemizedBalancePriority: "alta",
    }),
    makeRecord({
      competency: "2026-03",
      profile: "pontual",
      explainedAmount: 700,
      explainedBalanceStillUnitemized: 250,
      unitemizedBalancePriority: "media",
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentPersistenceState, "persistencia_forte");
});

test("contract reconciliation summary marks recent persistence as moderate when signals remain in more than one cycle without full strength", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "pontual",
      explainedAmount: 600,
      explainedBalanceStillUnitemized: 200,
      unitemizedBalancePriority: "media",
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 650,
      explainedItemsAmount: 650,
    }),
    makeRecord({
      competency: "2026-03",
      profile: "pontual",
      explainedAmount: 700,
      explainedBalanceStillUnitemized: 150,
      unitemizedBalancePriority: "media",
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentPersistenceState, "persistencia_moderada");
});

test("contract reconciliation summary marks loss of strength when latest recent cycle softens previous impact", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "estrutural",
      unexplainedAmount: 500,
      hasResidualUnexplained: true,
    }),
    makeRecord({
      competency: "2026-02",
      profile: "estrutural",
      unexplainedAmount: 300,
      hasResidualUnexplained: true,
    }),
    makeRecord({
      competency: "2026-03",
      profile: "estrutural",
      explainedAmount: 400,
      explainedItemsAmount: 400,
    }),
  ];

  const summary = summarizeContractReconciliation(records as never[]);

  assert.equal(summary.recentPersistenceState, "perda_de_forca");
});

test("annotate reconciliation recurrence marks recent persistence context by strength", () => {
  const records = [
    makeRecord({
      competency: "2026-01",
      profile: "pontual",
      explainedAmount: 600,
      explainedBalanceStillUnitemized: 200,
      unitemizedBalancePriority: "alta",
    }),
    makeRecord({
      competency: "2026-02",
      profile: "pontual",
      explainedAmount: 650,
      explainedBalanceStillUnitemized: 220,
      unitemizedBalancePriority: "alta",
    }),
    makeRecord({
      competency: "2026-03",
      profile: "pontual",
      explainedAmount: 700,
      explainedBalanceStillUnitemized: 250,
      unitemizedBalancePriority: "media",
    }),
  ];

  const annotated = annotateReconciliationRecurrenceWithinContract(records as never[]);

  assert.equal(
    annotated[0]?.differenceReading.recentPersistenceContext,
    "persistencia_forte",
  );
  assert.equal(
    annotated[2]?.differenceReading.recentPersistenceContext,
    "persistencia_forte",
  );
});
