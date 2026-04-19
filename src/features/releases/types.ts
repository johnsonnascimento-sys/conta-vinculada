export interface CreateReleaseRequestInput {
  contractId: string;
  employeeId: string;
  competency: string;
  rubric: string;
  requestedAmount: number;
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

export interface CreateReleaseRequestFieldErrors {
  contractId?: string;
  employeeId?: string;
  competency?: string;
  rubric?: string;
  requestedAmount?: string;
}

export interface ReviewReleaseRequestFieldErrors {
  requestId?: string;
  itemId?: string;
  decision?: string;
  approvedAmount?: string;
  notes?: string;
}

export interface CreateReleaseRequestSuccess {
  releaseRequestId: string;
  protocol: string;
  status: "em_elaboracao";
  contractId: string;
  employeeId: string;
  competency: string;
  rubric: string;
  requestedAmount: number;
  createdAt: string;
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

export type CreateReleaseRequestErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "unexpected_error";

export type ReviewReleaseRequestErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
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

export interface CreateReleaseRequestActionState {
  status: "idle" | "success" | "error";
  code?: CreateReleaseRequestErrorCode;
  message?: string;
  fieldErrors?: CreateReleaseRequestFieldErrors;
  data?: CreateReleaseRequestSuccess;
}

export interface ReviewReleaseRequestActionState {
  status: "idle" | "success" | "error";
  code?: ReviewReleaseRequestErrorCode;
  message?: string;
  fieldErrors?: ReviewReleaseRequestFieldErrors;
  data?: ReviewReleaseRequestSuccess;
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
}
import type { ReleaseRequest } from "@/features/platform/types";
