export interface CloseCompetencyReconciliationInput {
  competencyId: string;
  justification: string;
}

export interface CloseCompetencyReconciliationFieldErrors {
  competencyId?: string;
  justification?: string;
}

export interface CloseCompetencyReconciliationSuccess {
  competencyId: string;
  contractId: string;
  competency: string;
  closedAt: string;
  closedBy: string;
}

export type CloseCompetencyReconciliationErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
  | "unexpected_error";

export type CloseCompetencyReconciliationCommandResult =
  | {
      ok: true;
      data: CloseCompetencyReconciliationSuccess;
    }
  | {
      ok: false;
      code: CloseCompetencyReconciliationErrorCode;
      message: string;
      fieldErrors?: CloseCompetencyReconciliationFieldErrors;
    };

export interface CloseCompetencyReconciliationActionState {
  status: "idle" | "success" | "error";
  code?: CloseCompetencyReconciliationErrorCode;
  message?: string;
  fieldErrors?: CloseCompetencyReconciliationFieldErrors;
  data?: CloseCompetencyReconciliationSuccess;
}

export interface ReopenCompetencyReconciliationInput {
  competencyId: string;
  justification: string;
}

export interface ReopenCompetencyReconciliationFieldErrors {
  competencyId?: string;
  justification?: string;
}

export interface ReopenCompetencyReconciliationSuccess {
  competencyId: string;
  contractId: string;
  competency: string;
  reopenedAt: string;
  reopenedBy: string;
}

export type ReopenCompetencyReconciliationErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
  | "unexpected_error";

export type ReopenCompetencyReconciliationCommandResult =
  | {
      ok: true;
      data: ReopenCompetencyReconciliationSuccess;
    }
  | {
      ok: false;
      code: ReopenCompetencyReconciliationErrorCode;
      message: string;
      fieldErrors?: ReopenCompetencyReconciliationFieldErrors;
    };

export interface ReopenCompetencyReconciliationActionState {
  status: "idle" | "success" | "error";
  code?: ReopenCompetencyReconciliationErrorCode;
  message?: string;
  fieldErrors?: ReopenCompetencyReconciliationFieldErrors;
  data?: ReopenCompetencyReconciliationSuccess;
}
