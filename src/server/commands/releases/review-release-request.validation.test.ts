import assert from "node:assert/strict";
import test from "node:test";
import { validateReviewReleaseRequestInput } from "@/server/commands/releases/review-release-request.validation";

test("validateReviewReleaseRequestInput rejects missing request", () => {
  const result = validateReviewReleaseRequestInput({
    requestId: "",
    itemId: "rr-item-001",
    decision: "aprovar",
    approvedAmount: 1560,
    notes: "",
  });

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.requestId, "Solicitação não informada.");
});

test("validateReviewReleaseRequestInput rejects missing item", () => {
  const result = validateReviewReleaseRequestInput({
    requestId: "rr-001",
    itemId: "",
    decision: "aprovar",
    approvedAmount: 1560,
    notes: "",
  });

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.itemId,
    "Item da solicitação não informado.",
  );
});

test("validateReviewReleaseRequestInput rejects invalid decision", () => {
  const result = validateReviewReleaseRequestInput({
    requestId: "rr-001",
    itemId: "rr-item-001",
    decision: "devolver" as never,
    approvedAmount: 1560,
    notes: "",
  });

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.decision,
    "Decisão inválida para análise da solicitação.",
  );
});

test("validateReviewReleaseRequestInput requires notes for partial approval", () => {
  const result = validateReviewReleaseRequestInput({
    requestId: "rr-001",
    itemId: "rr-item-001",
    decision: "aprovar_parcial",
    approvedAmount: 1200,
    notes: "",
  });

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.notes,
    "Informe uma justificativa curta para aprovação parcial ou rejeição.",
  );
});

test("validateReviewReleaseRequestInput rejects negative approved amount", () => {
  const result = validateReviewReleaseRequestInput({
    requestId: "rr-001",
    itemId: "rr-item-001",
    decision: "rejeitar",
    approvedAmount: -1,
    notes: "Memória de cálculo inconsistente.",
  });

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.approvedAmount,
    "Informe um valor aprovado igual ou maior que zero.",
  );
});

test("validateReviewReleaseRequestInput accepts a valid payload", () => {
  const result = validateReviewReleaseRequestInput({
    requestId: "rr-001",
    itemId: "rr-item-001",
    decision: "aprovar",
    approvedAmount: 1560,
    notes: "",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.fieldErrors, {});
});
