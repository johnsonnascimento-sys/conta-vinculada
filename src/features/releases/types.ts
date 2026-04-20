import type {
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

export interface OpenReleaseRequestDuplicate {
  id: string;
  status: ReleaseRequestStatus;
  matchingItemCount: number;
}
