import type {
  CompetencyFormalClosureSummary,
  CompetencyOccurrence,
  CompetencyOperationalHistorySummary,
  CompetencyStatus,
  CompetencyTimelineEvent,
  CompetencyTimelineEventType,
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
