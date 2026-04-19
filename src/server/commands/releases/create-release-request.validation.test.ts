import assert from "node:assert/strict";
import test from "node:test";
import { validateCreateReleaseRequestInput } from "@/server/commands/releases/create-release-request.validation";

test("validateCreateReleaseRequestInput rejects missing contract", () => {
  const result = validateCreateReleaseRequestInput({
    contractId: "",
    employeeId: "emp-001",
    competency: "2026-03",
    rubric: "Ferias + 1/3",
    requestedAmount: 1560,
  });

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.contractId, "Selecione um contrato.");
});

test("validateCreateReleaseRequestInput rejects missing employee", () => {
  const result = validateCreateReleaseRequestInput({
    contractId: "c-2cjm-001",
    employeeId: "",
    competency: "2026-03",
    rubric: "Ferias + 1/3",
    requestedAmount: 1560,
  });

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.employeeId, "Selecione um empregado.");
});

test("validateCreateReleaseRequestInput rejects invalid competency", () => {
  const result = validateCreateReleaseRequestInput({
    contractId: "c-2cjm-001",
    employeeId: "emp-001",
    competency: "03/2026",
    rubric: "Ferias + 1/3",
    requestedAmount: 1560,
  });

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.competency,
    "Informe a competencia no formato AAAA-MM.",
  );
});

test("validateCreateReleaseRequestInput rejects empty rubric", () => {
  const result = validateCreateReleaseRequestInput({
    contractId: "c-2cjm-001",
    employeeId: "emp-001",
    competency: "2026-03",
    rubric: "",
    requestedAmount: 1560,
  });

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.rubric, "Informe a rubrica.");
});

test("validateCreateReleaseRequestInput rejects invalid amount", () => {
  const result = validateCreateReleaseRequestInput({
    contractId: "c-2cjm-001",
    employeeId: "emp-001",
    competency: "2026-03",
    rubric: "Ferias + 1/3",
    requestedAmount: 0,
  });

  assert.equal(result.valid, false);
  assert.equal(
    result.fieldErrors.requestedAmount,
    "Informe um valor solicitado maior que zero.",
  );
});

test("validateCreateReleaseRequestInput rejects empty required fields together", () => {
  const result = validateCreateReleaseRequestInput({
    contractId: "",
    employeeId: "",
    competency: "",
    rubric: "",
    requestedAmount: 0,
  });

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.contractId, "Selecione um contrato.");
  assert.equal(result.fieldErrors.employeeId, "Selecione um empregado.");
  assert.equal(result.fieldErrors.competency, "Informe a competencia no formato AAAA-MM.");
  assert.equal(result.fieldErrors.rubric, "Informe a rubrica.");
  assert.equal(result.fieldErrors.requestedAmount, "Informe um valor solicitado maior que zero.");
});

test("validateCreateReleaseRequestInput accepts a minimal valid payload", () => {
  const result = validateCreateReleaseRequestInput({
    contractId: "c-2cjm-001",
    employeeId: "emp-001",
    competency: "2026-03",
    rubric: "Ferias + 1/3",
    requestedAmount: 1560,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.fieldErrors, {});
});
