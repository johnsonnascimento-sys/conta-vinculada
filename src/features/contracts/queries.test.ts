import assert from "node:assert/strict";
import test from "node:test";
import { getContractDetail } from "@/features/contracts/queries";
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
  assert.deepEqual(
    detailReconciliation?.history.timeline,
    listReconciliation?.history.timeline,
  );
});
