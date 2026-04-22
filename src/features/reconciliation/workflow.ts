import type {
  CompetencyFormalClosureSummary,
  CompetencyOccurrence,
  CompetencyOperationalHistorySummary,
  ReconciliationFilterKey,
  ReconciliationItem,
  ReconciliationDifferenceSummary,
  ReconciliationOperationalPointing,
  ReconciliationOperationalQualificationSummary,
  CompetencyStatus,
  CompetencyTimelineEvent,
  CompetencyTimelineEventType,
  ReconciliationRecord,
  ReconciliationOperationalClosureSummary,
  ReconciliationOperationalClosureState,
} from "@/features/platform/types";

interface OperationalClosureInput {
  approvedPendingExecution: number;
  unexplainedDifference: number;
}

interface FormalClosureInput {
  status: CompetencyStatus;
  operationalClosureState: ReconciliationOperationalClosureState;
  closureJustification?: string;
  reopeningJustification?: string;
  occurrences?: CompetencyOccurrence[];
}

interface CompetencyHistoryInput {
  status: CompetencyStatus;
  processedAt?: string;
  closedAt?: string;
  closedBy?: string;
  closureJustification?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopeningJustification?: string;
  occurrences?: CompetencyOccurrence[];
  approvedPendingExecution: number;
  unexplainedDifference: number;
  operationalClosure: ReconciliationOperationalClosureSummary;
  formalClosure: CompetencyFormalClosureSummary;
}

interface ReconciliationQualificationInput {
  approvedPendingExecution: number;
  unexplainedDifference: number;
  formalClosure: CompetencyFormalClosureSummary;
  closureJustification?: string;
  reopeningJustification?: string;
}

interface PersistedReconciliationItemInput {
  id: string;
  justification?: string;
  createdAt?: string;
  bankEntry?: {
    id: string;
    description: string;
    type: ReconciliationItem["bankEntryType"];
    amount: number;
    occurredOn: string;
  };
}

function getTimelineLabel(type: CompetencyTimelineEventType) {
  if (type === "processamento") {
    return "Processamento da competencia";
  }

  if (type === "fechamento_formal") {
    return "Fechamento formal";
  }

  if (type === "reabertura_controlada") {
    return "Reabertura controlada";
  }

  return "Ocorrencia operacional";
}

function compareIsoDateStrings(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return left.localeCompare(right);
  }

  return leftTime - rightTime;
}

function isSameInstant(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);

  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
    return leftTime === rightTime;
  }

  return left === right;
}

function buildTimeline({
  processedAt,
  closedAt,
  closedBy,
  closureJustification,
  reopenedAt,
  reopenedBy,
  reopeningJustification,
  occurrences = [],
}: Omit<
  CompetencyHistoryInput,
  | "status"
  | "approvedPendingExecution"
  | "unexplainedDifference"
  | "operationalClosure"
  | "formalClosure"
>): CompetencyTimelineEvent[] {
  const timeline: CompetencyTimelineEvent[] = [];

  if (processedAt) {
    timeline.push({
      id: `processamento-${processedAt}`,
      type: "processamento",
      label: getTimelineLabel("processamento"),
      actor: "Sistema",
      description: "Competencia processada para leitura operacional.",
      happenedAt: processedAt,
    });
  }

  timeline.push(
    ...occurrences.map((occurrence) => ({
      id: occurrence.id,
      type: occurrence.type,
      label: getTimelineLabel(occurrence.type),
      actor: occurrence.actor,
      description: occurrence.description,
      happenedAt: occurrence.happenedAt,
    })),
  );

  if (
    closedAt &&
    !occurrences.some(
      (occurrence) =>
        occurrence.type === "fechamento_formal" &&
        isSameInstant(occurrence.happenedAt, closedAt),
    )
  ) {
    timeline.push({
      id: `fechamento-formal-${closedAt}`,
      type: "fechamento_formal",
      label: getTimelineLabel("fechamento_formal"),
      actor: closedBy ?? "Usuario nao identificado",
      description:
        closureJustification?.trim() ||
        "Fechamento formal registrado para a competencia.",
      happenedAt: closedAt,
    });
  }

  if (
    reopenedAt &&
    !occurrences.some(
      (occurrence) =>
        occurrence.type === "reabertura_controlada" &&
        isSameInstant(occurrence.happenedAt, reopenedAt),
    )
  ) {
    timeline.push({
      id: `reabertura-controlada-${reopenedAt}`,
      type: "reabertura_controlada",
      label: getTimelineLabel("reabertura_controlada"),
      actor: reopenedBy ?? "Usuario nao identificado",
      description:
        reopeningJustification?.trim() ||
        "Reabertura controlada registrada para a competencia.",
      happenedAt: reopenedAt,
    });
  }

  return timeline.sort((left, right) => {
    const dateComparison = compareIsoDateStrings(left.happenedAt, right.happenedAt);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return left.id.localeCompare(right.id);
  });
}

const sensitiveJustificationKeywords = [
  "retroativ",
  "reprocess",
  "ajuste",
  "diverg",
  "residual",
  "rescis",
  "manual",
  "sensivel",
];

function includesSensitiveJustificationKeyword(value?: string) {
  if (!value?.trim()) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();
  return sensitiveJustificationKeywords.some((keyword) =>
    normalizedValue.includes(keyword),
  );
}

function buildPointings(input: ReconciliationQualificationInput) {
  const pointings: ReconciliationOperationalPointing[] = [];

  if (input.unexplainedDifference > 0) {
    pointings.push({
      code: "divergencia_residual",
      label: "Divergencia residual",
      description:
        "Ainda existe diferenca nao explicada na conciliacao desta competencia.",
    });
  }

  if (input.approvedPendingExecution > 0) {
    pointings.push({
      code: "pendencia_execucao",
      label: "Pendencia de execucao",
      description:
        "Ainda existe valor aprovado pendente de execucao financeira.",
    });
  }

  if (input.formalClosure.state === "reaberta") {
    pointings.push({
      code: "competencia_reaberta",
      label: "Competencia reaberta",
      description:
        "A competencia foi reaberta e exige nova leitura operacional.",
    });
  }

  const hasPendingJustification =
    (input.formalClosure.state === "fechada" && !input.closureJustification?.trim()) ||
    (input.formalClosure.state === "reaberta" && !input.reopeningJustification?.trim());

  if (hasPendingJustification) {
    pointings.push({
      code: "justificativa_pendente",
      label: "Justificativa pendente",
      description:
        "Existe fechamento ou reabertura registrada sem justificativa suficiente.",
    });
  }

  const hasSensitiveJustification =
    input.formalClosure.state === "reaberta" ||
    includesSensitiveJustificationKeyword(input.closureJustification) ||
    includesSensitiveJustificationKeyword(input.reopeningJustification);

  if (hasSensitiveJustification) {
    pointings.push({
      code: "justificativa_sensivel",
      label: "Justificativa sensivel",
      description:
        "A justificativa registrada merece acompanhamento mais atento.",
    });
  }

  if (input.formalClosure.state === "apta_para_fechamento") {
    pointings.push({
      code: "apta_para_fechamento",
      label: "Apta para fechamento",
      description:
        "A competencia nao possui pendencias residuais e pode seguir para avaliacao de fechamento.",
    });
  }

  return {
    pointings,
    hasPendingJustification,
    hasSensitiveJustification,
  };
}

function compareOptionalIsoDateStrings(left?: string, right?: string) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return compareIsoDateStrings(left, right);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercentage(value: number) {
  return Math.round(value * 10) / 10;
}

export function summarizeReconciliationItems({
  unexplainedDifference,
  items = [],
}: {
  unexplainedDifference: number;
  items?: PersistedReconciliationItemInput[];
}): ReconciliationItem[] {
  const normalizedItems = items
    .filter((item) => item.bankEntry)
    .map((item) => ({
      id: item.id,
      kind: "diferenca_explicada" as const,
      kindLabel: "diferenca explicada",
      source: "registrado" as const,
      amount: Math.abs(item.bankEntry!.amount),
      summary: "Diferenca explicada vinculada a lancamento bancario.",
      justification: item.justification?.trim() || undefined,
      bankEntryId: item.bankEntry!.id,
      bankEntryDescription: item.bankEntry!.description,
      bankEntryType: item.bankEntry!.type,
      bankEntryAmount: item.bankEntry!.amount,
      bankEntryOccurredOn: item.bankEntry!.occurredOn,
      createdAt: item.createdAt,
    }))
    .sort((left, right) => {
      const dateComparison = compareOptionalIsoDateStrings(
        left.createdAt,
        right.createdAt,
      );

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return left.id.localeCompare(right.id);
    });

  if (unexplainedDifference <= 0) {
    return normalizedItems;
  }

  return [
    ...normalizedItems,
    {
      id: "residual-unexplained-difference",
      kind: "diferenca_nao_explicada",
      kindLabel: "diferenca nao explicada",
      source: "derivado",
      amount: unexplainedDifference,
      summary: "Saldo residual ainda nao explicado na competencia.",
    },
  ];
}

export function summarizeReconciliationDifferenceSummary({
  explainedDifference,
  unexplainedDifference,
  items = [],
}: {
  explainedDifference: number;
  unexplainedDifference: number;
  items?: PersistedReconciliationItemInput[];
}): ReconciliationDifferenceSummary {
  const explainedItemsAmount = items.reduce((total, item) => {
    if (!item.bankEntry) {
      return total;
    }

    return total + Math.abs(item.bankEntry.amount);
  }, 0);

  const roundedExplainedItemsAmount = roundCurrency(explainedItemsAmount);
  const explainedBalanceStillUnitemized = roundCurrency(
    Math.max(explainedDifference - explainedItemsAmount, 0),
  );
  const explainedCoveragePercentage =
    explainedDifference <= 0
      ? 100
      : roundPercentage(
          Math.min((roundedExplainedItemsAmount / explainedDifference) * 100, 100),
        );

  let explainedCoverageState:
    | "sem_itemizacao"
    | "itemizacao_parcial"
    | "itemizacao_suficiente"
    | "itemizacao_completa";
  let explainedCoverageStateLabel: string;
  let explainedCoverageReason: string;
  let requiresDirectedReview: boolean;
  let directedReviewRecommendation: string;
  let directedReviewReason: string;

  if (explainedDifference <= 0 || explainedBalanceStillUnitemized === 0) {
    explainedCoverageState = "itemizacao_completa";
    explainedCoverageStateLabel = "cobertura completa";
    explainedCoverageReason =
      explainedDifference <= 0
        ? "Nao ha diferenca explicada pendente de itemizacao nesta competencia."
        : "Toda a diferenca explicada ja possui itemizacao minima vinculada.";
    requiresDirectedReview = false;
    directedReviewRecommendation = "acompanhar cobertura";
    directedReviewReason =
      "A leitura atual nao indica saldo explicado remanescente sem itemizacao.";
  } else if (roundedExplainedItemsAmount === 0) {
    explainedCoverageState = "sem_itemizacao";
    explainedCoverageStateLabel = "sem cobertura";
    explainedCoverageReason =
      "A competencia possui diferenca explicada, mas ainda sem item conciliatorio minimo registrado.";
    requiresDirectedReview = true;
    directedReviewRecommendation = "iniciar revisao dirigida";
    directedReviewReason =
      "O saldo explicado ainda precisa de itemizacao minima para rastreabilidade operacional.";
  } else if (
    explainedCoveragePercentage >= 80 ||
    explainedBalanceStillUnitemized <= 500
  ) {
    explainedCoverageState = "itemizacao_suficiente";
    explainedCoverageStateLabel = "cobertura suficiente";
    explainedCoverageReason =
      "A maior parte da diferenca explicada ja esta coberta por itemizacao minima, restando apenas saldo residual.";
    requiresDirectedReview = false;
    directedReviewRecommendation = "acompanhar saldo residual";
    directedReviewReason =
      "Ainda existe pequena faixa sem itemizacao, mas a cobertura minima ja esta operacionalmente suficiente.";
  } else {
    explainedCoverageState = "itemizacao_parcial";
    explainedCoverageStateLabel = "cobertura parcial";
    explainedCoverageReason =
      "A diferenca explicada ja tem itemizacao minima inicial, mas ainda depende de revisao dirigida do saldo remanescente.";
    requiresDirectedReview = true;
    directedReviewRecommendation = "revisar saldo sem itemizacao";
    directedReviewReason =
      "O saldo explicado ainda sem itemizacao segue relevante para acompanhamento diario.";
  }

  return {
    explainedAmount: explainedDifference,
    explainedItemsAmount: roundedExplainedItemsAmount,
    explainedItemsCount: items.filter((item) => item.bankEntry).length,
    explainedBalanceStillUnitemized,
    explainedCoveragePercentage,
    explainedCoverageState,
    explainedCoverageStateLabel,
    explainedCoverageReason,
    requiresDirectedReview,
    directedReviewRecommendation,
    directedReviewReason,
    unexplainedAmount: roundCurrency(unexplainedDifference),
    hasResidualUnexplained: unexplainedDifference > 0,
  };
}

export function summarizeReconciliationOperationalClosure({
  approvedPendingExecution,
  unexplainedDifference,
}: OperationalClosureInput): ReconciliationOperationalClosureSummary {
  if (approvedPendingExecution === 0 && unexplainedDifference === 0) {
    return {
      state: "pronta_para_fechamento_minimo",
      reason:
        "Competência sem valor aprovado pendente de execução e sem diferença não explicada.",
    };
  }

  if (approvedPendingExecution > 0 && unexplainedDifference > 0) {
    return {
      state: "com_pendencias",
      reason:
        "Ainda existe valor aprovado pendente de execução e diferença não explicada nesta competência.",
    };
  }

  if (approvedPendingExecution > 0) {
    return {
      state: "com_pendencias",
      reason:
        "Ainda existe valor aprovado pendente de execução para esta competência.",
    };
  }

  return {
    state: "com_pendencias",
    reason:
      "A competência ainda possui diferença não explicada na conciliação.",
  };
}

export function summarizeCompetencyFormalClosure({
  status,
  operationalClosureState,
  closureJustification,
  reopeningJustification,
  occurrences = [],
}: FormalClosureInput): CompetencyFormalClosureSummary {
  if (status === "fechada") {
    return {
      state: "fechada",
      canClose: false,
      canReopen: true,
      reason:
        closureJustification?.trim() ||
        "Competência formalmente fechada para acompanhamento operacional.",
      occurrenceCount: occurrences.length,
    };
  }

  if (status === "reaberta") {
    return {
      state: "reaberta",
      canClose: operationalClosureState === "pronta_para_fechamento_minimo",
      canReopen: false,
      reason:
        reopeningJustification?.trim() ||
        "Competência reaberta para acompanhamento controlado.",
      occurrenceCount: occurrences.length,
    };
  }

  if (operationalClosureState === "pronta_para_fechamento_minimo") {
    return {
      state: "apta_para_fechamento",
      canClose: true,
      canReopen: false,
      reason:
        "Competência apta ao fechamento formal mínimo, sem pendências operacionais remanescentes.",
      occurrenceCount: occurrences.length,
    };
  }

  return {
    state: "aberta",
    canClose: false,
    canReopen: false,
    reason:
      "Competência ainda aberta para acompanhamento operacional da conciliação.",
    occurrenceCount: occurrences.length,
  };
}

export function summarizeCompetencyOperationalHistory({
  status,
  processedAt,
  closedAt,
  closedBy,
  closureJustification,
  reopenedAt,
  reopenedBy,
  reopeningJustification,
  occurrences = [],
  approvedPendingExecution,
  unexplainedDifference,
  operationalClosure,
  formalClosure,
}: CompetencyHistoryInput): CompetencyOperationalHistorySummary {
  const timeline = buildTimeline({
    processedAt,
    closedAt,
    closedBy,
    closureJustification,
    reopenedAt,
    reopenedBy,
    reopeningJustification,
    occurrences,
  });
  const lastRelevantOccurrence = timeline.at(-1);

  if (formalClosure.state === "fechada") {
    if (!closureJustification?.trim()) {
      return {
        currentSituationLabel: "Competencia fechada formalmente",
        currentSituationReason: formalClosure.reason,
        recommendedAction: "revisar_justificativa",
        recommendedActionLabel: "revisar justificativa",
        recommendedActionReason:
          "O fechamento formal existe, mas a justificativa operacional precisa ficar explicita para leitura futura.",
        lastRelevantOccurrence,
        timeline,
      };
    }

    return {
      currentSituationLabel: "Competencia fechada formalmente",
      currentSituationReason: formalClosure.reason,
      recommendedAction: "acompanhar",
      recommendedActionLabel: "acompanhar",
      recommendedActionReason:
        "A competencia esta fechada formalmente; mantenha apenas acompanhamento e use o historico para consultas futuras.",
      lastRelevantOccurrence,
      timeline,
    };
  }

  if (formalClosure.state === "reaberta") {
    if (!reopeningJustification?.trim()) {
      return {
        currentSituationLabel: "Competencia reaberta em acompanhamento",
        currentSituationReason: formalClosure.reason,
        recommendedAction: "revisar_justificativa",
        recommendedActionLabel: "revisar justificativa",
        recommendedActionReason:
          "A reabertura foi registrada, mas a justificativa precisa ficar clara para orientar o tratamento subsequente.",
        lastRelevantOccurrence,
        timeline,
      };
    }

    return {
      currentSituationLabel: "Competencia reaberta em acompanhamento",
      currentSituationReason: formalClosure.reason,
      recommendedAction: "reavaliar_apos_reabertura",
      recommendedActionLabel: "reavaliar apos reabertura",
      recommendedActionReason:
        operationalClosure.state === "pronta_para_fechamento_minimo"
          ? "A reavaliacao minima foi concluida; confirme se cabe novo fechamento formal."
          : "A competencia foi reaberta e precisa de nova leitura operacional antes de eventual fechamento.",
      lastRelevantOccurrence,
      timeline,
    };
  }

  if (formalClosure.state === "apta_para_fechamento") {
    return {
      currentSituationLabel: "Competencia apta para fechamento formal",
      currentSituationReason: formalClosure.reason,
      recommendedAction: "apta_para_fechamento",
      recommendedActionLabel: "apta para fechamento",
      recommendedActionReason:
        "A leitura minima ja esta regular; o sistema recomenda apenas avaliar o fechamento formal, sem torna-lo automatico.",
      lastRelevantOccurrence,
      timeline,
    };
  }

  if (unexplainedDifference > 0) {
    return {
      currentSituationLabel: "Competencia aberta com divergencia residual",
      currentSituationReason: operationalClosure.reason,
      recommendedAction: "verificar_divergencia_residual",
      recommendedActionLabel: "verificar divergencia residual",
      recommendedActionReason:
        "Ainda existe diferenca nao explicada na conciliacao e ela deve ser revisada antes de considerar o fechamento.",
      lastRelevantOccurrence,
      timeline,
    };
  }

  return {
    currentSituationLabel:
      status === "conciliada"
        ? "Competencia aberta em acompanhamento"
        : "Competencia em acompanhamento operacional",
    currentSituationReason: operationalClosure.reason,
    recommendedAction: "acompanhar",
    recommendedActionLabel: "acompanhar",
    recommendedActionReason:
      approvedPendingExecution > 0
        ? "Ainda existe valor aprovado pendente de execucao; acompanhe a baixa antes de avaliar fechamento."
        : "Mantenha o acompanhamento operacional desta competencia sem criar etapa formal adicional.",
    lastRelevantOccurrence,
    timeline,
  };
}

export function summarizeReconciliationOperationalQualification(
  input: ReconciliationQualificationInput,
): ReconciliationOperationalQualificationSummary {
  const { pointings, hasPendingJustification, hasSensitiveJustification } =
    buildPointings(input);

  if (input.unexplainedDifference > 0) {
    return {
      classification: "divergencia_residual",
      classificationLabel: "divergencia residual",
      classificationReason:
        "A competencia ainda possui diferenca nao explicada e requer revisao operacional.",
      trackingState: "exige_revisao",
      trackingStateLabel: "exige revisao",
      priority: "alta",
      priorityLabel: "alta",
      priorityReason:
        "A diferenca residual deve aparecer primeiro na leitura diaria.",
      hasSensitiveJustification,
      hasPendingJustification,
      pointings,
    };
  }

  if (hasPendingJustification || hasSensitiveJustification) {
    return {
      classification: "justificativa_sensivel",
      classificationLabel: "justificativa sensivel",
      classificationReason: hasPendingJustification
        ? "Existe justificativa pendente ou insuficiente para fechamento ou reabertura."
        : "A justificativa registrada indica situacao que merece leitura mais atenta.",
      trackingState: "exige_revisao",
      trackingStateLabel: "exige revisao",
      priority: hasPendingJustification ? "alta" : "media",
      priorityLabel: hasPendingJustification ? "alta" : "media",
      priorityReason: hasPendingJustification
        ? "A ausencia de justificativa suficiente compromete a rastreabilidade minima."
        : "A justificativa sugere reavaliacao operacional, mas sem divergencia residual aberta.",
      hasSensitiveJustification,
      hasPendingJustification,
      pointings,
    };
  }

  if (input.approvedPendingExecution > 0) {
    return {
      classification: "pendencia_execucao",
      classificationLabel: "pendencia de execucao",
      classificationReason:
        "A diferenca principal desta competencia esta ligada a valor aprovado ainda pendente de execucao.",
      trackingState: "em_acompanhamento",
      trackingStateLabel: "em acompanhamento",
      priority: "media",
      priorityLabel: "media",
      priorityReason:
        "A competencia exige acompanhamento da baixa, sem caracterizar divergencia residual.",
      hasSensitiveJustification,
      hasPendingJustification,
      pointings,
    };
  }

  if (input.formalClosure.state === "apta_para_fechamento") {
    return {
      classification: "apta_para_fechamento",
      classificationLabel: "apta para fechamento",
      classificationReason:
        "A competencia ja passou pelo tratamento minimo e pode seguir para avaliacao de fechamento formal.",
      trackingState: "tratada_minimamente",
      trackingStateLabel: "tratada minimamente",
      priority: "baixa",
      priorityLabel: "baixa",
      priorityReason:
        "Nao ha divergencia residual aberta; a leitura serve apenas para consolidacao final.",
      hasSensitiveJustification,
      hasPendingJustification,
      pointings,
    };
  }

  return {
    classification: "acompanhamento_regular",
    classificationLabel: "acompanhamento regular",
    classificationReason:
      "A competencia segue em acompanhamento simples, sem divergencia residual aberta nem alerta justificatorio adicional.",
    trackingState:
      input.formalClosure.state === "fechada"
        ? "tratada_minimamente"
        : "em_acompanhamento",
    trackingStateLabel:
      input.formalClosure.state === "fechada"
        ? "tratada minimamente"
        : "em acompanhamento",
    priority: "baixa",
    priorityLabel: "baixa",
    priorityReason:
      "A leitura atual nao indica necessidade de intervencao prioritaria.",
    hasSensitiveJustification,
    hasPendingJustification,
    pointings,
  };
}

export function matchesReconciliationFilter(
  record: Pick<ReconciliationRecord, "unexplainedDifference" | "formalClosure" | "qualification">,
  filter: ReconciliationFilterKey,
) {
  if (filter === "todas") {
    return true;
  }

  if (filter === "divergencias_residuais") {
    return record.unexplainedDifference > 0;
  }

  if (filter === "reabertas") {
    return record.formalClosure.state === "reaberta";
  }

  if (filter === "aptas_fechamento") {
    return record.formalClosure.state === "apta_para_fechamento";
  }

  return (
    record.qualification.hasPendingJustification ||
    record.qualification.hasSensitiveJustification
  );
}
