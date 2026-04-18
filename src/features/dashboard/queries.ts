import { getContractsOverview } from "@/features/contracts/queries";
import { getReconciliations, getReleaseRequests } from "@/server/repositories/platform.repository";
import type { ReconciliationRecord, ReleaseRequest } from "@/features/platform/types";

export async function getDashboardSummary() {
  const [contracts, releaseRequests, reconciliations] = await Promise.all([
    getContractsOverview(),
    getReleaseRequests(),
    getReconciliations(),
  ]);
  const totalBankBalance = contracts.reduce(
    (total: number, item) => total + item.bankBalance,
    0,
  );
  const totalProvisionBalance = contracts.reduce(
    (total: number, item) => total + item.provisionBalance,
    0,
  );
  const pendingReleaseRequests = releaseRequests.filter((item: ReleaseRequest) =>
    ["enviada", "em_analise", "em_exigencia", "aprovada_parcial"].includes(item.status),
  ).length;
  const pendingApprovalItems = releaseRequests.reduce(
    (total: number, request: ReleaseRequest) =>
      total + request.items.filter((item) => item.decision === "pendente").length,
    0,
  );
  const unexplainedDifference = reconciliations.reduce(
    (total: number, item: ReconciliationRecord) => total + item.unexplainedDifference,
    0,
  );

  return {
    totalBankBalance,
    totalProvisionBalance,
    pendingReleaseRequests,
    pendingApprovalItems,
    unexplainedDifference,
    unexplainedDifferenceRatio:
      totalBankBalance === 0 ? 0 : unexplainedDifference / totalBankBalance,
  };
}

export async function getRiskContracts() {
  const contracts = await getContractsOverview();
  return contracts
    .sort((left, right) => right.unexplainedDifference - left.unexplainedDifference)
    .slice(0, 3);
}
