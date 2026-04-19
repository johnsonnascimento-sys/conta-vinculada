import type {
  CreateReleaseRequestFieldErrors,
  CreateReleaseRequestInput,
} from "@/features/releases/types";

const COMPETENCY_PATTERN = /^\d{4}-\d{2}$/;

export function validateCreateReleaseRequestInput(input: CreateReleaseRequestInput) {
  const fieldErrors: CreateReleaseRequestFieldErrors = {};

  if (!input.contractId.trim()) {
    fieldErrors.contractId = "Selecione um contrato.";
  }

  if (!input.employeeId.trim()) {
    fieldErrors.employeeId = "Selecione um empregado.";
  }

  if (!COMPETENCY_PATTERN.test(input.competency.trim())) {
    fieldErrors.competency = "Informe a competencia no formato AAAA-MM.";
  }

  if (!input.rubric.trim()) {
    fieldErrors.rubric = "Informe a rubrica.";
  } else if (input.rubric.trim().length > 120) {
    fieldErrors.rubric = "A rubrica deve ter no maximo 120 caracteres.";
  }

  if (!Number.isFinite(input.requestedAmount) || input.requestedAmount <= 0) {
    fieldErrors.requestedAmount = "Informe um valor solicitado maior que zero.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}
