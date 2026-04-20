import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllowedRubricsForReleaseType,
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
