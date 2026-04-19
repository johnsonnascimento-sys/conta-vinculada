import assert from "node:assert/strict";
import test from "node:test";
import { canInitiateReleaseRequest, canReviewReleaseRequest } from "@/features/releases/policy";
import type { AppUser } from "@/features/platform/types";

const adminUser: AppUser = {
  id: "user-001",
  name: "Beatriz Campos",
  email: "beatriz.campos@jmu.mil.br",
  role: "Administrador do órgão",
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

const auditUser: AppUser = {
  id: "user-004",
  name: "Henrique Dias",
  email: "henrique.dias@jmu.mil.br",
  role: "Auditoria interna",
  scope: "Leitura institucional",
  mfaEnabled: true,
};

test("canInitiateReleaseRequest allows administrator in any contract", () => {
  assert.equal(canInitiateReleaseRequest(adminUser, "CT 07/2025"), true);
});

test("canInitiateReleaseRequest restricts analyst to own contract scope", () => {
  assert.equal(canInitiateReleaseRequest(analystUser, "CT 07/2025"), true);
  assert.equal(canInitiateReleaseRequest(analystUser, "CT 21/2024"), false);
});

test("canReviewReleaseRequest follows the same scoped authorization", () => {
  assert.equal(canReviewReleaseRequest(analystUser, "CT 07/2025"), true);
  assert.equal(canReviewReleaseRequest(analystUser, "CT 21/2024"), false);
});

test("canReviewReleaseRequest denies read-only audit profile", () => {
  assert.equal(canReviewReleaseRequest(auditUser, "CT 07/2025"), false);
});
