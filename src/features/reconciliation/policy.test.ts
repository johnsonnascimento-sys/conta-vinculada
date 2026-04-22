import assert from "node:assert/strict";
import test from "node:test";
import type { AppUser } from "@/features/platform/types";
import {
  canCloseCompetencyReconciliation,
  canRegisterReconciliationItem,
  canReopenCompetencyReconciliation,
} from "@/features/reconciliation/policy";

const adminUser: AppUser = {
  id: "user-001",
  name: "Beatriz Campos",
  email: "beatriz.campos@jmu.mil.br",
  role: "Administrador do órgão",
  scope: "2CJM",
  mfaEnabled: true,
};

const financialUser: AppUser = {
  id: "user-003",
  name: "Rafaela Vasques",
  email: "rafaela.vasques@jmu.mil.br",
  role: "Financeiro",
  scope: "2CJM",
  mfaEnabled: true,
};

const analystUser: AppUser = {
  id: "user-002",
  name: "Felipe Costa",
  email: "felipe.costa@jmu.mil.br",
  role: "Analista",
  scope: "CT 07/2025",
  mfaEnabled: true,
};

test("reconciliation closing is restricted to admin and financeiro", () => {
  assert.equal(canCloseCompetencyReconciliation(adminUser), true);
  assert.equal(canCloseCompetencyReconciliation(financialUser), true);
  assert.equal(canCloseCompetencyReconciliation(analystUser), false);
});

test("reconciliation reopening follows the same authorization boundary", () => {
  assert.equal(canReopenCompetencyReconciliation(adminUser), true);
  assert.equal(canReopenCompetencyReconciliation(financialUser), true);
  assert.equal(canReopenCompetencyReconciliation(analystUser), false);
});

test("reconciliation item registration follows the same authorization boundary", () => {
  assert.equal(canRegisterReconciliationItem(adminUser), true);
  assert.equal(canRegisterReconciliationItem(financialUser), true);
  assert.equal(canRegisterReconciliationItem(analystUser), false);
});
