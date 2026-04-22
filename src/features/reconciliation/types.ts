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

export interface RegisterReconciliationItemInput {
  reconciliationId: string;
  bankEntryId: string;
  justification: string;
}

export interface RegisterReconciliationItemFieldErrors {
  reconciliationId?: string;
  bankEntryId?: string;
  justification?: string;
}

export interface RegisterReconciliationItemSuccess {
  itemId: string;
  reconciliationId: string;
  contractId: string;
  competency: string;
  bankEntryId: string;
}

export type RegisterReconciliationItemErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
  | "invalid_state"
  | "conflict"
  | "unexpected_error";

export type RegisterReconciliationItemCommandResult =
  | {
      ok: true;
      data: RegisterReconciliationItemSuccess;
    }
  | {
      ok: false;
      code: RegisterReconciliationItemErrorCode;
      message: string;
      fieldErrors?: RegisterReconciliationItemFieldErrors;
    };

export interface RegisterReconciliationItemActionState {
  status: "idle" | "success" | "error";
  code?: RegisterReconciliationItemErrorCode;
  message?: string;
  fieldErrors?: RegisterReconciliationItemFieldErrors;
  data?: RegisterReconciliationItemSuccess;
}
