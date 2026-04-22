import {
  getAllocations,
  getBankEntries,
  getContracts,
  getEmployees,
  getReleaseRequests,
} from "@/server/repositories/platform.repository";
import { getCurrentUser } from "@/features/auth/queries";
import {
  canApproveReleaseRequestAdministratively,
  canExecuteReleaseRequestEffectively,
  canInitiateReleaseRequest,
  canPrepareReleaseRequestForExecution,
  canReviewReleaseRequest,
} from "@/features/releases/policy";
import { isDatabaseEnabled } from "@/server/db/prisma";
import type {
  Contract,
  Employee,
  EmployeeAllocation,
} from "@/features/platform/types";
import type {
  ReleaseRequestCreationOptions,
  ReleaseRequestsBoardData,
} from "@/features/releases/types";

export async function getReleaseRequestsBoardData(): Promise<ReleaseRequestsBoardData> {
  const [requests, contracts, bankEntries, user] = await Promise.all([
    getReleaseRequests(),
    getContracts(),
    getBankEntries(),
    getCurrentUser(),
  ]);
  const contractsById = new Map(
    contracts.map((contract: Contract) => [contract.id, contract]),
  );
  const usedBankEntryIds = new Set(
    requests
      .map((request) => request.workflow.financialExecution.bankEntryId)
      .filter((value): value is string => Boolean(value)),
  );
  const executableBankEntriesByRequestId = requests.reduce<
    ReleaseRequestsBoardData["executableBankEntriesByRequestId"]
  >((accumulator, request) => {
    accumulator[request.id] = bankEntries
      .filter((entry) => {
        if (entry.contractId !== request.contractId) {
          return false;
        }

        if (entry.type !== "liberacao" || entry.amount >= 0) {
          return false;
        }

        if (usedBankEntryIds.has(entry.id)) {
          return false;
        }

        return (
          Math.abs(entry.amount) === request.workflow.financialExecution.pendingAmount
        );
      })
      .map((entry) => ({
        id: entry.id,
        description: entry.description,
        amount: entry.amount,
        occurredOn: entry.occurredOn,
      }));

    return accumulator;
  }, {});

  return {
    requests,
    databaseEnabled: isDatabaseEnabled(),
    reviewableRequestIds: user
      ? requests
          .filter((request) => {
            const contract = contractsById.get(request.contractId);
            return contract
              ? canReviewReleaseRequest(user, contract.code)
              : false;
          })
          .map((request) => request.id)
      : [],
    administrativelyApprovableRequestIds: user
      ? requests
          .filter((request) => {
            const contract = contractsById.get(request.contractId);
            return contract
              ? canApproveReleaseRequestAdministratively(user, contract.code)
              : false;
          })
          .map((request) => request.id)
      : [],
    financiallyPreparableRequestIds: user
      ? requests
          .filter((request) =>
            canPrepareReleaseRequestForExecution(user) &&
            request.workflow.financialPreparation.canPrepare,
          )
          .map((request) => request.id)
      : [],
    financiallyExecutableRequestIds: user
      ? requests
          .filter(
            (request) =>
              canExecuteReleaseRequestEffectively(user) &&
              request.workflow.financialExecution.canExecute &&
              (executableBankEntriesByRequestId[request.id]?.length ?? 0) > 0,
          )
          .map((request) => request.id)
      : [],
    executableBankEntriesByRequestId,
  };
}

export async function getReleaseRequestCreationOptions(): Promise<ReleaseRequestCreationOptions> {
  const [contracts, employees, allocations, user] = await Promise.all([
    getContracts(),
    getEmployees(),
    getAllocations(),
    getCurrentUser(),
  ]);

  const allowedContracts = user
    ? contracts.filter((contract: Contract) =>
        canInitiateReleaseRequest(user, contract.code),
      )
    : [];
  const allowedContractIds = new Set(allowedContracts.map((contract) => contract.id));

  return {
    databaseEnabled: isDatabaseEnabled(),
    contracts: allowedContracts.map((contract: Contract) => ({
      id: contract.id,
      code: contract.code,
      name: contract.name,
    })),
    employeesByContract: allocations.reduce<
      ReleaseRequestCreationOptions["employeesByContract"]
    >((accumulator, allocation: EmployeeAllocation) => {
      if (!allowedContractIds.has(allocation.contractId)) {
        return accumulator;
      }

      const employee = employees.find(
        (item: Employee) => item.id === allocation.employeeId,
      );

      if (!employee) {
        return accumulator;
      }

      accumulator[allocation.contractId] ??= [];

      if (
        !accumulator[allocation.contractId].some((item) => item.id === employee.id)
      ) {
        accumulator[allocation.contractId].push({
          id: employee.id,
          name: employee.name,
          role: employee.role,
          admissionDate: employee.admissionDate,
          allocationStartDate: allocation.startDate,
          allocationEndDate: allocation.endDate,
        });
      }

      return accumulator;
    }, {}),
  };
}
