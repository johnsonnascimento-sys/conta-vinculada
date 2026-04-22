import type {
  AdministrativeApprovalDecision,
  ReleaseMovementMode,
  ReleaseRequest,
  ReleaseRequestStatus,
  ReleaseRubric,
  ReleaseType,
} from "@/features/platform/types";

export interface CreateReleaseRequestItemInput {
  employeeId: string;
  releaseRubric: ReleaseRubric;
  competencyRef: string;
  employmentStartDate: string;
  allocationStartDate: string;
  allocationEndDate?: string;
  factOccurredOn: string;
  calculationMemory?: {
    baseAmount?: number;
    proportionalFraction?: number;
    referenceMonths?: number;
    notes?: string;
  };
  requestedAmount: number;
  notes?: string;
}

export interface CreateReleaseRequestInput {
  contractId: string;
  releaseType: ReleaseType;
  movementMode: ReleaseMovementMode;
  factualBasis: string;
  competencyStart: string;
  competencyEnd: string;
  requestedTotalAmount: number;
  notes?: string;
  items: CreateReleaseRequestItemInput[];
}

export interface CreateReleaseRequestItemFieldErrors {
  employeeId?: string;
  releaseRubric?: string;
  competencyRef?: string;
  employmentStartDate?: string;
  allocationStartDate?: string;
  allocationEndDate?: string;
  factOccurredOn?: string;
  requestedAmount?: string;
  calculationMemory?: string;
  notes?: string;
}

export interface CreateReleaseRequestFieldErrors {
  contractId?: string;
  releaseType?: string;
  movementMode?: string;
  factualBasis?: string;
  competencyStart?: string;
  competencyEnd?: string;
  requestedTotalAmount?: string;
  notes?: string;
  items?: string;
  itemErrors?: Record<number, CreateReleaseRequestItemFieldErrors>;
}

export interface CreateReleaseRequestSuccess {
  releaseRequestId: string;
  protocol: string;
  status: "enviada";
  releaseType: ReleaseType;
  movementMode: ReleaseMovementMode;
  contractId: string;
  companyId: string;
  competencyStart: string;
  competencyEnd: string;
  requestedTotalAmount: number;
  itemCount: number;
  createdAt: string;
}

export type CreateReleaseRequestErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "duplicate_request"
  | "unexpected_error";

export type CreateReleaseRequestCommandResult =
  | {
      ok: true;
      data: CreateReleaseRequestSuccess;
    }
  | {
      ok: false;
      code: CreateReleaseRequestErrorCode;
      message: string;
      fieldErrors?: CreateReleaseRequestFieldErrors;
    };

export interface CreateReleaseRequestActionState {
  status: "idle" | "success" | "error";
  code?: CreateReleaseRequestErrorCode;
  message?: string;
  fieldErrors?: CreateReleaseRequestFieldErrors;
  data?: CreateReleaseRequestSuccess;
}

export interface ReleaseRequestCreationContractOption {
  id: string;
  code: string;
  name: string;
}

export interface ReleaseRequestCreationEmployeeOption {
  id: string;
  name: string;
  role: string;
  admissionDate: string;
  allocationStartDate: string;
  allocationEndDate?: string;
}

export interface ReleaseRequestCreationOptions {
  contracts: ReleaseRequestCreationContractOption[];
  employeesByContract: Record<string, ReleaseRequestCreationEmployeeOption[]>;
  databaseEnabled: boolean;
}

export interface ReleaseRequestsBoardData {
  requests: ReleaseRequest[];
  databaseEnabled: boolean;
  reviewableRequestIds: string[];
  administrativelyApprovableRequestIds: string[];
  financiallyPreparableRequestIds: string[];
  financiallyExecutableRequestIds: string[];
  executableBankEntriesByRequestId: Record<
    string,
    Array<{
      id: string;
      description: string;
      amount: number;
      occurredOn: string;
    }>
  >;
}

export type ReviewReleaseRequestDecision =
  | "aprovar"
  | "aprovar_parcial"
  | "rejeitar";

export interface ReviewReleaseRequestInput {
  requestId: string;
  itemId: string;
  decision: ReviewReleaseRequestDecision;
  approvedAmount: number;
  notes: string;
}

export interface ReviewReleaseRequestFieldErrors {
  requestId?: string;
  itemId?: string;
  decision?: string;
  approvedAmount?: string;
  notes?: string;
}

export interface ReviewReleaseRequestSuccess {
  releaseRequestId: string;
  releaseRequestItemId: string;
  contractId: string;
  requestStatus:
    | "em_analise"
    | "aprovada"
    | "aprovada_parcial"
    | "rejeitada";
  itemDecision: "aprovado" | "aprovado_parcial" | "glosado";
  approvedAmount: number;
  analystName: string;
  decidedAt: string;
}

export type ReviewReleaseRequestErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
  | "unexpected_error";

export type ReviewReleaseRequestCommandResult =
  | {
      ok: true;
      data: ReviewReleaseRequestSuccess;
    }
  | {
      ok: false;
      code: ReviewReleaseRequestErrorCode;
      message: string;
      fieldErrors?: ReviewReleaseRequestFieldErrors;
    };

export interface ReviewReleaseRequestActionState {
  status: "idle" | "success" | "error";
  code?: ReviewReleaseRequestErrorCode;
  message?: string;
  fieldErrors?: ReviewReleaseRequestFieldErrors;
  data?: ReviewReleaseRequestSuccess;
}

export interface AdministrativeApproveReleaseRequestInput {
  requestId: string;
  decision: AdministrativeApprovalDecision;
  notes: string;
}

export interface AdministrativeApproveReleaseRequestFieldErrors {
  requestId?: string;
  decision?: string;
  notes?: string;
}

export interface AdministrativeApproveReleaseRequestSuccess {
  releaseRequestId: string;
  contractId: string;
  decision: AdministrativeApprovalDecision;
  approverName: string;
  decidedAt: string;
}

export type AdministrativeApproveReleaseRequestErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
  | "unexpected_error";

export type AdministrativeApproveReleaseRequestCommandResult =
  | {
      ok: true;
      data: AdministrativeApproveReleaseRequestSuccess;
    }
  | {
      ok: false;
      code: AdministrativeApproveReleaseRequestErrorCode;
      message: string;
      fieldErrors?: AdministrativeApproveReleaseRequestFieldErrors;
    };

export interface AdministrativeApproveReleaseRequestActionState {
  status: "idle" | "success" | "error";
  code?: AdministrativeApproveReleaseRequestErrorCode;
  message?: string;
  fieldErrors?: AdministrativeApproveReleaseRequestFieldErrors;
  data?: AdministrativeApproveReleaseRequestSuccess;
}

export interface PrepareReleaseRequestForExecutionInput {
  requestId: string;
  notes: string;
}

export interface PrepareReleaseRequestForExecutionFieldErrors {
  requestId?: string;
  notes?: string;
}

export interface PrepareReleaseRequestForExecutionSuccess {
  releaseRequestId: string;
  contractId: string;
  preparedBy: string;
  preparedAt: string;
  eligibleAmount: number;
}

export type PrepareReleaseRequestForExecutionErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
  | "unexpected_error";

export type PrepareReleaseRequestForExecutionCommandResult =
  | {
      ok: true;
      data: PrepareReleaseRequestForExecutionSuccess;
    }
  | {
      ok: false;
      code: PrepareReleaseRequestForExecutionErrorCode;
      message: string;
      fieldErrors?: PrepareReleaseRequestForExecutionFieldErrors;
    };

export interface PrepareReleaseRequestForExecutionActionState {
  status: "idle" | "success" | "error";
  code?: PrepareReleaseRequestForExecutionErrorCode;
  message?: string;
  fieldErrors?: PrepareReleaseRequestForExecutionFieldErrors;
  data?: PrepareReleaseRequestForExecutionSuccess;
}

export interface ExecuteReleaseRequestEffectivelyInput {
  requestId: string;
  bankEntryId: string;
  notes: string;
}

export interface ExecuteReleaseRequestEffectivelyFieldErrors {
  requestId?: string;
  bankEntryId?: string;
  notes?: string;
}

export interface ExecuteReleaseRequestEffectivelySuccess {
  releaseRequestId: string;
  contractId: string;
  bankEntryId: string;
  executedAmount: number;
  executedAt: string;
}

export type ExecuteReleaseRequestEffectivelyErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
  | "unexpected_error";

export type ExecuteReleaseRequestEffectivelyCommandResult =
  | {
      ok: true;
      data: ExecuteReleaseRequestEffectivelySuccess;
    }
  | {
      ok: false;
      code: ExecuteReleaseRequestEffectivelyErrorCode;
      message: string;
      fieldErrors?: ExecuteReleaseRequestEffectivelyFieldErrors;
    };

export interface ExecuteReleaseRequestEffectivelyActionState {
  status: "idle" | "success" | "error";
  code?: ExecuteReleaseRequestEffectivelyErrorCode;
  message?: string;
  fieldErrors?: ExecuteReleaseRequestEffectivelyFieldErrors;
  data?: ExecuteReleaseRequestEffectivelySuccess;
}

export interface OpenReleaseRequestDuplicate {
  id: string;
  status: ReleaseRequestStatus;
  matchingItemCount: number;
}
