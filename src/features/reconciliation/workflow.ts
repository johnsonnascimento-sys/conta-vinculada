import type {
  CompetencyFormalClosureSummary,
  CompetencyOccurrence,
  CompetencyStatus,
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
