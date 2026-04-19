import type {
  ReviewReleaseRequestFieldErrors,
  ReviewReleaseRequestInput,
} from "@/features/releases/types";

const REVIEW_DECISIONS = new Set([
  "aprovar",
  "aprovar_parcial",
  "rejeitar",
]);

export function validateReviewReleaseRequestInput(
  input: ReviewReleaseRequestInput,
) {
  const fieldErrors: ReviewReleaseRequestFieldErrors = {};
  const trimmedNotes = input.notes.trim();

  if (!input.requestId.trim()) {
    fieldErrors.requestId = "Solicitação não informada.";
  }

  if (!input.itemId.trim()) {
    fieldErrors.itemId = "Item da solicitação não informado.";
  }

  if (!REVIEW_DECISIONS.has(input.decision)) {
    fieldErrors.decision = "Decisão inválida para análise da solicitação.";
  }

  if (!Number.isFinite(input.approvedAmount) || input.approvedAmount < 0) {
    fieldErrors.approvedAmount =
      "Informe um valor aprovado igual ou maior que zero.";
  }

  if (
    (input.decision === "aprovar_parcial" || input.decision === "rejeitar") &&
    !trimmedNotes
  ) {
    fieldErrors.notes =
      "Informe uma justificativa curta para aprovação parcial ou rejeição.";
  } else if (trimmedNotes.length > 500) {
    fieldErrors.notes = "A justificativa deve ter no máximo 500 caracteres.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}
