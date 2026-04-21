import type {
  AdministrativeApprovalDecision,
  ContractNormativeRegime,
  ReleaseItemDecision,
  ReleaseMovementMode,
  ReleaseRequest,
  ReleaseRequestAdministrativeApprovalSummary,
  ReleaseRequestAnalysisState,
  ReleaseRequestDecisionState,
  ReleaseRequestDocumentState,
  ReleaseRequestFinancialReadinessState,
  ReleaseRequestStatus,
  ReleaseRequestWorkflowSummary,
} from "@/features/platform/types";

const TERMINAL_RELEASE_REQUEST_STATUSES = new Set<ReleaseRequestStatus>([
  "em_elaboracao",
  "em_exigencia",
  "liberada",
  "cancelada",
]);

export function deriveOpenReleaseRequestStatusFromItemDecisions(
  decisions: ReleaseItemDecision[],
): Extract<
  ReleaseRequestStatus,
  "enviada" | "em_analise" | "aprovada" | "aprovada_parcial" | "rejeitada"
> {
  if (decisions.length === 0 || decisions.every((decision) => decision === "pendente")) {
    return "enviada";
  }

  if (decisions.some((decision) => decision === "pendente")) {
    return "em_analise";
  }

  if (decisions.every((decision) => decision === "aprovado")) {
    return "aprovada";
  }

  if (decisions.every((decision) => decision === "glosado")) {
    return "rejeitada";
  }

  return "aprovada_parcial";
}

export function getAllowedAdministrativeApprovalDecisions(
  decisionState: ReleaseRequestDecisionState,
): AdministrativeApprovalDecision[] {
  if (decisionState === "aprovada") {
    return ["aprovar", "rejeitar"];
  }

  if (decisionState === "aprovada_parcial") {
    return ["aprovar_parcial", "rejeitar"];
  }

  if (decisionState === "rejeitada") {
    return ["rejeitar"];
  }

  return [];
}

function deriveDecisionState(
  derivedStatus: ReleaseRequestStatus,
  decidedItemCount: number,
): ReleaseRequestDecisionState {
  if (derivedStatus === "aprovada") {
    return "aprovada";
  }

  if (derivedStatus === "aprovada_parcial") {
    return "aprovada_parcial";
  }

  if (derivedStatus === "rejeitada") {
    return "rejeitada";
  }

  if (decidedItemCount > 0) {
    return "parcial";
  }

  return "sem_decisao";
}

function deriveAnalysisState(
  derivedStatus: ReleaseRequestStatus,
): ReleaseRequestAnalysisState {
  if (
    derivedStatus === "aprovada" ||
    derivedStatus === "aprovada_parcial" ||
    derivedStatus === "rejeitada" ||
    derivedStatus === "liberada" ||
    derivedStatus === "cancelada"
  ) {
    return "concluida";
  }

  if (derivedStatus === "em_exigencia") {
    return "em_exigencia";
  }

  if (derivedStatus === "em_analise") {
    return "em_analise";
  }

  return "aguardando_analise";
}

function mapAdministrativeApprovalState(
  decision: AdministrativeApprovalDecision,
) {
  if (decision === "aprovar") {
    return "aprovada" as const;
  }

  if (decision === "aprovar_parcial") {
    return "aprovada_parcial" as const;
  }

  return "rejeitada" as const;
}

function buildFinancialNextStepLabel(input: {
  readiness: ReleaseRequestFinancialReadinessState;
  decision?: AdministrativeApprovalDecision;
  movementMode: ReleaseMovementMode;
  normativeRegime: ContractNormativeRegime;
}) {
  if (input.readiness === "nao_apta") {
    if (input.decision === "rejeitar") {
      return "Sem aptidão para etapa financeira futura, porque a consolidação administrativa foi rejeitada.";
    }

    return "Ainda não apta para futura etapa financeira, pois a aprovação administrativa consolidada não foi concluída.";
  }

  const regimeLabel =
    input.normativeRegime === "cnj_651_2025"
      ? "regime CNJ 651/2025"
      : "regime CNJ 169/2013";
  const movementLabel =
    input.movementMode === "pagamento_direto_empregado"
      ? "pagamento direto aos empregados"
      : "resgate/reembolso à contratada";

  return `Apta apenas para futura etapa financeira por ${movementLabel}, observando o ${regimeLabel}.`;
}

function deriveAdministrativeApprovalSummary(input: {
  latestAdministrativeApproval?: {
    decision: AdministrativeApprovalDecision;
    decidedBy: string;
    decidedAt: string;
    notes?: string;
  };
  missingDocumentCount: number;
  canAggregateDecision: boolean;
  derivedStatus: ReleaseRequestStatus;
  pendingItemCount: number;
  movementMode: ReleaseMovementMode;
  normativeRegime: ContractNormativeRegime;
}): ReleaseRequestAdministrativeApprovalSummary {
  if (input.latestAdministrativeApproval) {
    const financialReadiness =
      input.latestAdministrativeApproval.decision === "rejeitar"
        ? "nao_apta"
        : ("apta_para_execucao_futura" satisfies ReleaseRequestFinancialReadinessState);

    return {
      state: mapAdministrativeApprovalState(input.latestAdministrativeApproval.decision),
      decision: input.latestAdministrativeApproval.decision,
      approver: input.latestAdministrativeApproval.decidedBy,
      decidedAt: input.latestAdministrativeApproval.decidedAt,
      notes: input.latestAdministrativeApproval.notes,
      canApprove: false,
      financialReadiness,
      financialNextStep: buildFinancialNextStepLabel({
        readiness: financialReadiness,
        decision: input.latestAdministrativeApproval.decision,
        movementMode: input.movementMode,
        normativeRegime: input.normativeRegime,
      }),
    };
  }

  if (input.missingDocumentCount > 0) {
    return {
      state: "nao_apta",
      canApprove: false,
      reason: "A solicitação ainda possui pendência documental na etapa atual.",
      financialReadiness: "nao_apta",
      financialNextStep: buildFinancialNextStepLabel({
        readiness: "nao_apta",
        movementMode: input.movementMode,
        normativeRegime: input.normativeRegime,
      }),
    };
  }

  if (!input.canAggregateDecision) {
    return {
      state: "nao_apta",
      canApprove: false,
      reason:
        input.pendingItemCount > 0
          ? "A solicitação ainda não possui decisão suficiente em todos os itens."
          : "A solicitação ainda não está consolidada para decisão administrativa.",
      financialReadiness: "nao_apta",
      financialNextStep: buildFinancialNextStepLabel({
        readiness: "nao_apta",
        movementMode: input.movementMode,
        normativeRegime: input.normativeRegime,
      }),
    };
  }

  if (!["aprovada", "aprovada_parcial", "rejeitada"].includes(input.derivedStatus)) {
    return {
      state: "nao_apta",
      canApprove: false,
      reason: "A solicitação ainda não encerrou a etapa de análise por item.",
      financialReadiness: "nao_apta",
      financialNextStep: buildFinancialNextStepLabel({
        readiness: "nao_apta",
        movementMode: input.movementMode,
        normativeRegime: input.normativeRegime,
      }),
    };
  }

  return {
    state: "apta",
    canApprove: true,
    reason: "A solicitação já pode receber decisão administrativa consolidada.",
    financialReadiness: "nao_apta",
    financialNextStep: buildFinancialNextStepLabel({
      readiness: "nao_apta",
      movementMode: input.movementMode,
      normativeRegime: input.normativeRegime,
    }),
  };
}

export function summarizeReleaseRequestWorkflow(input: {
  status: ReleaseRequestStatus;
  missingDocumentCount: number;
  itemDecisions: ReleaseItemDecision[];
  movementMode: ReleaseMovementMode;
  normativeRegime: ContractNormativeRegime;
  latestAdministrativeApproval?: {
    decision: AdministrativeApprovalDecision;
    decidedBy: string;
    decidedAt: string;
    notes?: string;
  };
}): ReleaseRequestWorkflowSummary {
  const totalItemCount = input.itemDecisions.length;
  const pendingItemCount = input.itemDecisions.filter(
    (decision) => decision === "pendente",
  ).length;
  const decidedItemCount = totalItemCount - pendingItemCount;
  const derivedStatus = TERMINAL_RELEASE_REQUEST_STATUSES.has(input.status)
    ? input.status
    : deriveOpenReleaseRequestStatusFromItemDecisions(input.itemDecisions);
  const canAggregateDecision =
    totalItemCount > 0 &&
    pendingItemCount === 0 &&
    !["em_elaboracao", "em_exigencia", "cancelada"].includes(derivedStatus);

  return {
    derivedStatus,
    documentState:
      input.missingDocumentCount > 0 ? "pendente" : "regular" satisfies ReleaseRequestDocumentState,
    analysisState: deriveAnalysisState(derivedStatus),
    decisionState: deriveDecisionState(derivedStatus, decidedItemCount),
    pendingDocumentCount: input.missingDocumentCount,
    totalItemCount,
    pendingItemCount,
    decidedItemCount,
    canAggregateDecision,
    administrativeApproval: deriveAdministrativeApprovalSummary({
      latestAdministrativeApproval: input.latestAdministrativeApproval,
      missingDocumentCount: input.missingDocumentCount,
      canAggregateDecision,
      derivedStatus,
      pendingItemCount,
      movementMode: input.movementMode,
      normativeRegime: input.normativeRegime,
    }),
  };
}

export function summarizeWorkflowForReleaseRequest(
  request: Pick<
    ReleaseRequest,
    "status" | "missingDocuments" | "items" | "movementMode"
  > & {
    normativeRegime: ContractNormativeRegime;
    latestAdministrativeApproval?: {
      decision: AdministrativeApprovalDecision;
      decidedBy: string;
      decidedAt: string;
      notes?: string;
    };
  },
) {
  return summarizeReleaseRequestWorkflow({
    status: request.status,
    missingDocumentCount: request.missingDocuments.length,
    itemDecisions: request.items.map((item) => item.decision),
    movementMode: request.movementMode,
    normativeRegime: request.normativeRegime,
    latestAdministrativeApproval: request.latestAdministrativeApproval,
  });
}
