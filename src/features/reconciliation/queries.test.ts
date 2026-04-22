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

test("reconciliation overview exposes minimum reconciliation items and explained coverage", async () => {
  const overview = await getReconciliationOverview();
  const reconciliation = overview.reconciliations.find(
    (item) => item.contractId === "c-2cjm-001" && item.competency === "2026-03",
  );

  assert.ok(reconciliation);
  assert.equal(reconciliation?.items[0].kind, "diferenca_explicada");
  assert.equal(reconciliation?.items.at(-1)?.kind, "diferenca_nao_explicada");
  assert.equal(reconciliation?.differenceSummary.explainedItemsCount, 1);
  assert.equal(reconciliation?.differenceSummary.explainedCoverageState, "itemizacao_parcial");
  assert.equal(reconciliation?.differenceSummary.requiresDirectedReview, true);
  assert.equal(
    reconciliation?.differenceSummary.unitemizedBalanceOrigin,
    "itemizacao_em_andamento",
  );
  assert.equal(
    reconciliation?.differenceSummary.directedReviewRecommendation,
    "revisar saldo sem itemizacao",
  );

  const completeCoverage = overview.reconciliations.find(
    (item) => item.contractId === "c-2cjm-002" && item.competency === "2026-03",
  );

  assert.equal(
    completeCoverage?.differenceSummary.explainedCoverageState,
    "itemizacao_completa",
  );
  assert.equal(
    completeCoverage?.differenceSummary.unitemizedBalanceOrigin,
    "sem_saldo_remanescente",
  );
});
