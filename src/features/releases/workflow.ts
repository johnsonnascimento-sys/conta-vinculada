import type {
  AdministrativeApprovalDecision,
  ContractNormativeRegime,
  DocumentKind,
  ReleaseItemDecision,
  ReleaseRequestBalanceCheckState,
  ReleaseMovementMode,
  ReleaseRequest,
  ReleaseRequestAdministrativeApprovalSummary,
  ReleaseRequestAnalysisState,
  ReleaseRequestFinancialPreparationSummary,
  ReleaseRequestFinancialPreparationState,
  ReleaseRequestReconciliationCheckState,
  ReleaseRequestDecisionState,
  ReleaseRequestDocumentState,
  ReleaseRequestFinancialReadinessState,
  ReleaseRequestStatus,
  ReleaseRequestWorkflowSummary,
} from "@/features/platform/types";
import { getExpectedFinancialPreparationEvidence } from "@/features/releases/rules";

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

function buildExpectedMovementLabel(movementMode: ReleaseMovementMode) {
  if (movementMode === "pagamento_direto_empregado") {
    return "Pagamento direto aos empregados";
  }

  return "Resgate/reembolso à contratada";
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

function deriveBalanceCheckState(currentBalance?: number, eligibleAmount?: number) {
  if (currentBalance === undefined || eligibleAmount === undefined) {
    return "nao_avaliado" satisfies ReleaseRequestBalanceCheckState;
  }

  return currentBalance >= eligibleAmount
    ? ("suficiente" satisfies ReleaseRequestBalanceCheckState)
    : ("insuficiente" satisfies ReleaseRequestBalanceCheckState);
}

function deriveReconciliationCheckState(unexplainedDifference?: number) {
  if (unexplainedDifference === undefined) {
    return "nao_avaliado" satisfies ReleaseRequestReconciliationCheckState;
  }

  return unexplainedDifference > 0
    ? ("com_atencao" satisfies ReleaseRequestReconciliationCheckState)
    : ("regular" satisfies ReleaseRequestReconciliationCheckState);
}

function deriveFinancialPreparationStateFromApproval(
  decision: AdministrativeApprovalDecision,
): ReleaseRequestFinancialPreparationState {
  if (decision === "rejeitar") {
    return "nao_apta";
  }

  return "preparada";
}

function deriveFinancialPreparationSummary(input: {
  latestAdministrativeApproval?: {
    decision: AdministrativeApprovalDecision;
  };
  latestFinancialPreparationApproval?: {
    decision: AdministrativeApprovalDecision;
    decidedBy: string;
    decidedAt: string;
    notes?: string;
  };
  movementMode: ReleaseMovementMode;
  normativeRegime: ContractNormativeRegime;
  providedDocuments: DocumentKind[];
  eligibleAmount: number;
  currentBalance?: number;
  approvedPendingExecution?: number;
  unexplainedDifference?: number;
  hasEffectiveExecution: boolean;
  linkedAccount?: {
    isOfficialPublicBank: boolean;
    cooperationTermRef?: string;
  };
}): ReleaseRequestFinancialPreparationSummary {
  const expectedMovement = buildExpectedMovementLabel(input.movementMode);
  const requiredEvidence = getExpectedFinancialPreparationEvidence({
    movementMode: input.movementMode,
    normativeRegime: input.normativeRegime,
  });
  const providedSet = new Set(input.providedDocuments);
  const missingEvidence = requiredEvidence.filter((item) => !providedSet.has(item));
  const balanceCheck = deriveBalanceCheckState(
    input.currentBalance,
    input.eligibleAmount,
  );
  const reconciliationCheck = deriveReconciliationCheckState(
    input.unexplainedDifference,
  );

  if (input.hasEffectiveExecution) {
    return {
      state: "preparada",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "A solicitação já possui registro de execução financeira efetiva no sistema.",
      effectiveExecutionRecorded: true,
    };
  }

  if (
    !input.latestAdministrativeApproval ||
    input.latestAdministrativeApproval.decision === "rejeitar"
  ) {
    return {
      state: "nao_apta",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "A solicitação ainda não possui aprovação administrativa apta para seguir à etapa financeira.",
      effectiveExecutionRecorded: false,
    };
  }

  if (input.eligibleAmount <= 0) {
    return {
      state: "nao_apta",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "A solicitação não possui valor consolidado apto para futura execução financeira.",
      effectiveExecutionRecorded: false,
    };
  }

  if (missingEvidence.length > 0) {
    return {
      state: "nao_apta",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "Ainda faltam evidências mínimas para registrar o preparo da futura execução.",
      effectiveExecutionRecorded: false,
    };
  }

  if (!input.linkedAccount) {
    return {
      state: "nao_apta",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "O contrato ainda não possui conta vinculada identificada para a futura etapa financeira.",
      effectiveExecutionRecorded: false,
    };
  }

  if (
    input.normativeRegime === "cnj_651_2025" &&
    (!input.linkedAccount.isOfficialPublicBank ||
      !input.linkedAccount.cooperationTermRef)
  ) {
    return {
      state: "nao_apta",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "A conta vinculada ainda não atende aos elementos mínimos de banco público oficial e termo de cooperação para esta etapa.",
      effectiveExecutionRecorded: false,
    };
  }

  if (balanceCheck === "insuficiente") {
    return {
      state: "nao_apta",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "O saldo atual da conta vinculada não cobre o valor apto à futura execução.",
      effectiveExecutionRecorded: false,
    };
  }

  if (reconciliationCheck === "com_atencao") {
    return {
      state: "nao_apta",
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      reason:
        "A conciliação ainda possui diferença não explicada para esta competência.",
      effectiveExecutionRecorded: false,
    };
  }

  if (input.latestFinancialPreparationApproval) {
    return {
      state: deriveFinancialPreparationStateFromApproval(
        input.latestFinancialPreparationApproval.decision,
      ),
      canPrepare: false,
      eligibleAmount: input.eligibleAmount,
      expectedMovement,
      requiredEvidence,
      missingEvidence,
      balanceCheck,
      reconciliationCheck,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      preparedBy: input.latestFinancialPreparationApproval.decidedBy,
      preparedAt: input.latestFinancialPreparationApproval.decidedAt,
      notes: input.latestFinancialPreparationApproval.notes,
      effectiveExecutionRecorded: false,
    };
  }

  return {
    state: "apta",
    canPrepare: true,
    eligibleAmount: input.eligibleAmount,
    expectedMovement,
    requiredEvidence,
    missingEvidence,
    balanceCheck,
    reconciliationCheck,
    currentBalance: input.currentBalance,
    approvedPendingExecution: input.approvedPendingExecution,
    unexplainedDifference: input.unexplainedDifference,
    reason:
      "A solicitação já pode ter o preparo da futura execução financeira registrado internamente.",
    effectiveExecutionRecorded: false,
  };
}

export function summarizeReleaseRequestWorkflow(input: {
  status: ReleaseRequestStatus;
  missingDocumentCount: number;
  itemDecisions: ReleaseItemDecision[];
  movementMode: ReleaseMovementMode;
  normativeRegime: ContractNormativeRegime;
  providedDocuments?: DocumentKind[];
  approvedAmount?: number;
  currentBalance?: number;
  approvedPendingExecution?: number;
  unexplainedDifference?: number;
  linkedAccount?: {
    isOfficialPublicBank: boolean;
    cooperationTermRef?: string;
  };
  latestFinancialPreparationApproval?: {
    decision: AdministrativeApprovalDecision;
    decidedBy: string;
    decidedAt: string;
    notes?: string;
  };
  hasEffectiveExecution?: boolean;
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
    financialPreparation: deriveFinancialPreparationSummary({
      latestAdministrativeApproval: input.latestAdministrativeApproval,
      latestFinancialPreparationApproval: input.latestFinancialPreparationApproval,
      movementMode: input.movementMode,
      normativeRegime: input.normativeRegime,
      providedDocuments: input.providedDocuments ?? [],
      eligibleAmount: input.approvedAmount ?? 0,
      currentBalance: input.currentBalance,
      approvedPendingExecution: input.approvedPendingExecution,
      unexplainedDifference: input.unexplainedDifference,
      hasEffectiveExecution: input.hasEffectiveExecution ?? false,
      linkedAccount: input.linkedAccount,
    }),
  };
}

export function summarizeWorkflowForReleaseRequest(
  request: Pick<
    ReleaseRequest,
    "status" | "missingDocuments" | "items" | "movementMode"
  > & {
    normativeRegime: ContractNormativeRegime;
    providedDocuments?: DocumentKind[];
    currentBalance?: number;
    approvedPendingExecution?: number;
    unexplainedDifference?: number;
    linkedAccount?: {
      isOfficialPublicBank: boolean;
      cooperationTermRef?: string;
    };
    latestFinancialPreparationApproval?: {
      decision: AdministrativeApprovalDecision;
      decidedBy: string;
      decidedAt: string;
      notes?: string;
    };
    hasEffectiveExecution?: boolean;
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
    providedDocuments: request.providedDocuments,
    approvedAmount: request.items.reduce(
      (total, item) => total + item.approvedAmount,
      0,
    ),
    currentBalance: request.currentBalance,
    approvedPendingExecution: request.approvedPendingExecution,
    unexplainedDifference: request.unexplainedDifference,
    linkedAccount: request.linkedAccount,
    latestFinancialPreparationApproval: request.latestFinancialPreparationApproval,
    hasEffectiveExecution: request.hasEffectiveExecution,
    latestAdministrativeApproval: request.latestAdministrativeApproval,
  });
}
