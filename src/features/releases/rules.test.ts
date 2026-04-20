import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllowedRubricsForReleaseType,
  getReleaseDocumentPlan,
  getExpectedOperationDocumentsForRelease,
  getExpectedDocumentsForReleaseType,
  isRubricAllowedForReleaseType,
} from "@/features/releases/rules";

test("release rules expose rubrics allowed for ferias", () => {
  assert.deepEqual(getAllowedRubricsForReleaseType("ferias"), [
    "ferias",
    "terco_constitucional_ferias",
    "encargos_ferias",
  ]);
});

test("release rules validate rubric against release type", () => {
  assert.equal(
    isRubricAllowedForReleaseType("decimo_terceiro", "decimo_terceiro"),
    true,
  );
  assert.equal(
    isRubricAllowedForReleaseType("decimo_terceiro", "multa_fgts_rescisoria"),
    false,
  );
});

test("release rules expose expected documents grouped by category", () => {
  assert.deepEqual(getExpectedDocumentsForReleaseType("rescisao"), [
    "rescisao",
    "fgts",
    "folha",
    "comprovante_pagamento",
  ]);
});

test("release rules expose movement-specific operation documents", () => {
  assert.deepEqual(
    getExpectedOperationDocumentsForRelease("pagamento_direto_empregado"),
    ["comprovante_operacao_bancaria"],
  );
});

test("release document plan exposes only current-stage requirements before execution", () => {
  const plan = getReleaseDocumentPlan(
    "ferias",
    "resgate_contratada",
    "enviada",
    ["ferias"],
  );

  assert.deepEqual(plan.expectedCurrentStage, [
    "ferias",
    "folha",
    "comprovante_pagamento",
  ]);
  assert.deepEqual(plan.missingCurrentStage, ["folha", "comprovante_pagamento"]);
  assert.deepEqual(plan.deferredByCategory.operation, [
    "comprovante_operacao_bancaria",
    "comprovante_pagamento",
  ]);
});

test("release document plan includes operation documents after execution", () => {
  const plan = getReleaseDocumentPlan(
    "rescisao",
    "pagamento_direto_empregado",
    "liberada",
    ["rescisao", "fgts", "folha", "comprovante_pagamento"],
  );

  assert.deepEqual(plan.missingByCategory.operation, ["comprovante_operacao_bancaria"]);
  assert.deepEqual(plan.missingCurrentStage, ["comprovante_operacao_bancaria"]);
});

test("release document plan clears current-stage pendings for cancelled requests", () => {
  const plan = getReleaseDocumentPlan(
    "decimo_terceiro",
    "resgate_contratada",
    "cancelada",
    [],
  );

  assert.deepEqual(plan.expectedCurrentStage, []);
  assert.deepEqual(plan.missingCurrentStage, []);
});
