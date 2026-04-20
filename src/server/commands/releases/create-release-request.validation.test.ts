import assert from "node:assert/strict";
import test from "node:test";
import { validateCreateReleaseRequestInput } from "@/server/commands/releases/create-release-request.validation";

function buildValidInput() {
  return {
    contractId: "c-2cjm-001",
    releaseType: "ferias" as const,
    movementMode: "resgate_contratada" as const,
    factualBasis: "Ferias vencidas com programacao para abril.",
    competencyStart: "2026-03",
    competencyEnd: "2026-03",
    requestedTotalAmount: 1560,
    items: [
      {
        employeeId: "emp-001",
        releaseRubric: "ferias" as const,
        competencyRef: "2026-03",
        employmentStartDate: "2024-03-10",
        allocationStartDate: "2025-02-01",
        factOccurredOn: "2026-03-15",
        requestedAmount: 1560,
        calculationMemory: {
          notes: "Base integral da competencia.",
        },
      },
    ],
  };
}

test("validateCreateReleaseRequestInput rejects missing contract", () => {
  const input = buildValidInput();
  input.contractId = "";

  const result = validateCreateReleaseRequestInput(input);

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.contractId, "Selecione um contrato.");
});

test("validateCreateReleaseRequestInput rejects missing employee", () => {
  const input = buildValidInput();
  input.items[0].employeeId = "";

  const result = validateCreateReleaseRequestInput(input);

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.itemErrors?.[0]?.employeeId, "Selecione um empregado.");
});

test("validateCreateReleaseRequestInput rejects invalid competency", () => {
  const input = buildValidInput();
  input.items[0].competencyRef = "03/2026";

  const result = validateCreateReleaseRequestInput(input);

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.itemErrors?.[0]?.competencyRef,
    "Informe a competência do item no formato AAAA-MM.",
  );
});

test("validateCreateReleaseRequestInput rejects empty rubric", () => {
  const input = buildValidInput();
  input.items[0].releaseRubric = "" as never;

  const result = validateCreateReleaseRequestInput(input);

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.itemErrors?.[0]?.releaseRubric,
    "Selecione uma rubrica compatível com o tipo de liberação.",
  );
});

test("validateCreateReleaseRequestInput rejects invalid amount", () => {
  const input = buildValidInput();
  input.items[0].requestedAmount = 0;
  input.requestedTotalAmount = 0;

  const result = validateCreateReleaseRequestInput(input);

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.itemErrors?.[0]?.requestedAmount,
    "Informe um valor solicitado maior que zero.",
  );
});

test("validateCreateReleaseRequestInput accepts a valid payload", () => {
  const result = validateCreateReleaseRequestInput(buildValidInput());

  assert.equal(result.valid, true);
  assert.deepEqual(result.fieldErrors, {});
});
