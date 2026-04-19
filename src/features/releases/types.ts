export interface CreateReleaseRequestInput {
  contractId: string;
  employeeId: string;
  competency: string;
  rubric: string;
  requestedAmount: number;
}

export interface CreateReleaseRequestFieldErrors {
  contractId?: string;
  employeeId?: string;
  competency?: string;
  rubric?: string;
  requestedAmount?: string;
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

export type CreateReleaseRequestErrorCode =
  | "validation_error"
  | "unauthorized"
  | "database_unavailable"
  | "not_found"
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
}

export interface ReleaseRequestCreationOptions {
  contracts: ReleaseRequestCreationContractOption[];
  employeesByContract: Record<string, ReleaseRequestCreationEmployeeOption[]>;
  databaseEnabled: boolean;
}
