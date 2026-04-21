import {
  getAllocations,
  getContracts,
  getEmployees,
  getReleaseRequests,
} from "@/server/repositories/platform.repository";
import { getCurrentUser } from "@/features/auth/queries";
import {
  canApproveReleaseRequestAdministratively,
  canInitiateReleaseRequest,
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
  const [requests, contracts, user] = await Promise.all([
    getReleaseRequests(),
    getContracts(),
    getCurrentUser(),
  ]);
  const contractsById = new Map(
    contracts.map((contract: Contract) => [contract.id, contract]),
  );

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
