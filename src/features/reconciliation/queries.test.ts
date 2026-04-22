import assert from "node:assert/strict";
import test from "node:test";
import { getReconciliationOverview } from "@/features/reconciliation/queries";

test("reconciliation overview filters residual divergences", async () => {
  const overview = await getReconciliationOverview("divergencias_residuais");

  assert.equal(overview.selectedFilter, "divergencias_residuais");
  assert.equal(overview.reconciliations.length, 1);
  assert.equal(overview.reconciliations[0].qualification.classification, "divergencia_residual");
});

test("reconciliation overview exposes simple tracking filters", async () => {
  const overview = await getReconciliationOverview("justificativas_sensiveis");

  assert.equal(overview.selectedFilter, "justificativas_sensiveis");
  assert.equal(overview.reconciliations.length, 1);
  assert.equal(
    overview.reconciliations[0].qualification.hasSensitiveJustification,
    true,
  );
  assert.ok(
    overview.filters.find((item) => item.key === "reabertas" && item.count >= 1),
  );
});
