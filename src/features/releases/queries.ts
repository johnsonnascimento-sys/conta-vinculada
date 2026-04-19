import {
  getAllocations,
  getContracts,
  getEmployees,
  getReleaseRequests,
} from "@/server/repositories/platform.repository";
import { isDatabaseEnabled } from "@/server/db/prisma";
import type {
  Contract,
  Employee,
  EmployeeAllocation,
} from "@/features/platform/types";
import type { ReleaseRequestCreationOptions } from "@/features/releases/types";

export async function getReleaseRequestsBoard() {
  return getReleaseRequests();
}

export async function getReleaseRequestCreationOptions(): Promise<ReleaseRequestCreationOptions> {
  const [contracts, employees, allocations] = await Promise.all([
    getContracts(),
    getEmployees(),
    getAllocations(),
  ]);

  return {
    databaseEnabled: isDatabaseEnabled(),
    contracts: contracts.map((contract: Contract) => ({
      id: contract.id,
      code: contract.code,
      name: contract.name,
    })),
    employeesByContract: allocations.reduce<
      ReleaseRequestCreationOptions["employeesByContract"]
    >((accumulator, allocation: EmployeeAllocation) => {
      const employee = employees.find(
        (item: Employee) => item.id === allocation.employeeId,
      );

      if (!employee) {
        return accumulator;
      }

      accumulator[allocation.contractId] ??= [];

      if (!accumulator[allocation.contractId].some((item) => item.id === employee.id)) {
        accumulator[allocation.contractId].push({
          id: employee.id,
          name: employee.name,
          role: employee.role,
        });
      }

      return accumulator;
    }, {}),
  };
}
