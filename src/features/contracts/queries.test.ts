import assert from "node:assert/strict";
import test from "node:test";
import { getContractDetail, getContractsOverview } from "@/features/contracts/queries";
import { getReconciliations } from "@/server/repositories/platform.repository";

test("contract detail reuses the same derived reconciliation history shown in reconciliation list", async () => {
  const [detail, reconciliations] = await Promise.all([
    getContractDetail("c-2cjm-002"),
    getReconciliations(),
  ]);

  assert.ok(detail);

  const detailReconciliation = detail?.reconciliations.find(
    (item) => item.competency === "2026-03",
  );
  const listReconciliation = reconciliations.find(
    (item) => item.contractId === "c-2cjm-002" && item.competency === "2026-03",
  );

  assert.ok(detailReconciliation);
  assert.ok(listReconciliation);
  assert.equal(
    detailReconciliation?.history.recommendedAction,
    listReconciliation?.history.recommendedAction,
  );
  assert.equal(
    detailReconciliation?.qualification.classification,
    listReconciliation?.qualification.classification,
  );
  assert.deepEqual(detailReconciliation?.items, listReconciliation?.items);
  assert.deepEqual(
    detailReconciliation?.differenceSummary,
    listReconciliation?.differenceSummary,
  );
  assert.equal(
    detailReconciliation?.differenceSummary.directedReviewRecommendation,
    listReconciliation?.differenceSummary.directedReviewRecommendation,
  );
  assert.equal(
    detailReconciliation?.differenceSummary.unitemizedBalanceOrigin,
    listReconciliation?.differenceSummary.unitemizedBalanceOrigin,
  );
  assert.equal(
    detailReconciliation?.differenceSummary.unitemizedBalancePriority,
    listReconciliation?.differenceSummary.unitemizedBalancePriority,
  );
  assert.deepEqual(
    detailReconciliation?.differenceReading,
    listReconciliation?.differenceReading,
  );
  assert.deepEqual(
    detailReconciliation?.history.timeline,
    listReconciliation?.history.timeline,
  );
});

test("contracts overview reuses the same contract reconciliation summary shown in contract detail", async () => {
  const [overview, detail] = await Promise.all([
    getContractsOverview(),
    getContractDetail("c-2cjm-001"),
  ]);

  const overviewContract = overview.find((item) => item.id === "c-2cjm-001");

  assert.ok(overviewContract);
  assert.ok(detail);
  assert.deepEqual(
    overviewContract?.contractReconciliationSummary,
    detail?.contractReconciliationSummary,
  );
  assert.equal(
    overviewContract?.unexplainedDifference,
    detail?.contractReconciliationSummary.totalUnexplainedResidual,
  );
});

test("contracts overview keeps transversal managerial attention consistent with aggregated contract summary", async () => {
  const [overview, detail] = await Promise.all([
    getContractsOverview(),
    getContractDetail("c-2cjm-002"),
  ]);

  const reviewContract = overview.find((item) => item.id === "c-2cjm-001");
  const secondContract = overview.find((item) => item.id === "c-2cjm-002");

  assert.ok(reviewContract);
  assert.ok(secondContract);
  assert.ok(detail);
  assert.equal(
    reviewContract?.contractReconciliationSummary.managerialAttention,
    "requer_revisao",
  );
  assert.equal(
    reviewContract?.contractReconciliationSummary.totalUnexplainedResidual,
    943.18,
  );
  assert.equal(secondContract?.companyName.length ? true : false, true);
  assert.equal(secondContract?.bankBalance !== undefined, true);
  assert.equal(
    secondContract?.contractReconciliationSummary.managerialAttention,
    detail?.contractReconciliationSummary.managerialAttention,
  );
  assert.equal(
    secondContract?.contractReconciliationSummary.totalExplainedStillUnitemized,
    detail?.contractReconciliationSummary.totalExplainedStillUnitemized,
  );
});
