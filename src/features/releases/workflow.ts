import type {
  ReleaseItemDecision,
  ReleaseRequest,
  ReleaseRequestAnalysisState,
  ReleaseRequestDecisionState,
  ReleaseRequestDocumentState,
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

export function summarizeReleaseRequestWorkflow(input: {
  status: ReleaseRequestStatus;
  missingDocumentCount: number;
  itemDecisions: ReleaseItemDecision[];
}): ReleaseRequestWorkflowSummary {
  const totalItemCount = input.itemDecisions.length;
  const pendingItemCount = input.itemDecisions.filter(
    (decision) => decision === "pendente",
  ).length;
  const decidedItemCount = totalItemCount - pendingItemCount;
  const derivedStatus = TERMINAL_RELEASE_REQUEST_STATUSES.has(input.status)
    ? input.status
    : deriveOpenReleaseRequestStatusFromItemDecisions(input.itemDecisions);

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
    canAggregateDecision:
      totalItemCount > 0 &&
      pendingItemCount === 0 &&
      !["em_elaboracao", "em_exigencia", "cancelada"].includes(derivedStatus),
  };
}

export function summarizeWorkflowForReleaseRequest(
  request: Pick<ReleaseRequest, "status" | "missingDocuments" | "items">,
) {
  return summarizeReleaseRequestWorkflow({
    status: request.status,
    missingDocumentCount: request.missingDocuments.length,
    itemDecisions: request.items.map((item) => item.decision),
  });
}
