import {
  auditEvents as mockAuditEvents,
  bankAccounts as mockBankAccounts,
  bankEntries as mockBankEntries,
  companies as mockCompanies,
  competencies as mockCompetencies,
  contracts as mockContracts,
  employees as mockEmployees,
  organizations as mockOrganizations,
  provisionBalances as mockProvisionBalances,
  reconciliations as mockReconciliations,
  releaseRequests as mockReleaseRequests,
  tenant as mockTenant,
  users as mockUsers,
  allocations as mockAllocations,
} from "@/features/platform/data";
import type {
  AppUser,
  AuditEvent,
  BankAccount,
  BankEntry,
  Company,
  Competency,
  Contract,
  Employee,
  EmployeeAllocation,
  Organization,
  ProvisionBalance,
  ReconciliationRecord,
  ReleaseRequest,
  Tenant,
} from "@/features/platform/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";
import {
  serializeAllocation,
  serializeAuditEvent,
  serializeBankEntry,
  serializeCompetency,
  serializeContract,
  serializeEmployee,
  serializeProvisionBalance,
  serializeReconciliation,
  serializeReleaseRequest,
  serializeTenant,
  serializeUser,
} from "@/server/db/serializers";

export async function getTenant(): Promise<Tenant> {
  if (!isDatabaseEnabled()) {
    return mockTenant;
  }

  const prisma = getPrismaClient();
  const tenant = await prisma!.tenant.findFirstOrThrow();
  return serializeTenant(tenant);
}

export async function getOrganizations(): Promise<Organization[]> {
  if (!isDatabaseEnabled()) {
    return mockOrganizations;
  }

  const prisma = getPrismaClient();
  return prisma!.organization.findMany({ orderBy: { name: "asc" } });
}

export async function getContracts(): Promise<Contract[]> {
  if (!isDatabaseEnabled()) {
    return mockContracts;
  }

  const prisma = getPrismaClient();
  const contracts = await prisma!.contract.findMany({
    include: {
      linkedAccounts: {
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { code: "asc" },
  });
  return contracts.map(serializeContract);
}

export async function getCompanies(): Promise<Company[]> {
  if (!isDatabaseEnabled()) {
    return mockCompanies;
  }

  const prisma = getPrismaClient();
  return prisma!.company.findMany({ orderBy: { tradeName: "asc" } });
}

export async function getEmployees(): Promise<Employee[]> {
  if (!isDatabaseEnabled()) {
    return mockEmployees;
  }

  const prisma = getPrismaClient();
  const employees = await prisma!.employee.findMany({ orderBy: { name: "asc" } });
  return employees.map(serializeEmployee);
}

export async function getAllocations(): Promise<EmployeeAllocation[]> {
  if (!isDatabaseEnabled()) {
    return mockAllocations;
  }

  const prisma = getPrismaClient();
  const allocations = await prisma!.employeeAllocation.findMany({
    orderBy: { startDate: "asc" },
  });
  return allocations.map(serializeAllocation);
}

export async function getCompetencies(): Promise<Competency[]> {
  if (!isDatabaseEnabled()) {
    return mockCompetencies;
  }

  const prisma = getPrismaClient();
  const competencies = await prisma!.competency.findMany({
    orderBy: [{ competency: "asc" }],
  });
  return competencies.map(serializeCompetency);
}

export async function getProvisionBalances(): Promise<ProvisionBalance[]> {
  if (!isDatabaseEnabled()) {
    return mockProvisionBalances;
  }

  const prisma = getPrismaClient();
  const balances = await prisma!.provisionBalance.findMany({
    orderBy: [{ contractId: "asc" }, { employeeId: "asc" }],
  });
  return balances.map(serializeProvisionBalance);
}

export async function getBankAccounts(): Promise<BankAccount[]> {
  if (!isDatabaseEnabled()) {
    return mockBankAccounts;
  }

  const prisma = getPrismaClient();
  const accounts = await prisma!.linkedAccount.findMany({ orderBy: { bankName: "asc" } });
  return accounts.map((account: {
    id: string;
    contractId: string;
    bankName: string;
    isOfficialPublicBank: boolean;
    cooperationTermRef: string | null;
    branch: string;
    accountNumber: string;
    currentBalance: { toNumber(): number };
  }) => ({
    id: account.id,
    contractId: account.contractId,
    bankName: account.bankName,
    isOfficialPublicBank: account.isOfficialPublicBank,
    cooperationTermRef: account.cooperationTermRef ?? undefined,
    branch: account.branch,
    accountNumber: account.accountNumber,
    currentBalance: account.currentBalance.toNumber(),
  }));
}

export async function getBankEntries(): Promise<BankEntry[]> {
  if (!isDatabaseEnabled()) {
    return mockBankEntries;
  }

  const prisma = getPrismaClient();
  const entries = await prisma!.bankEntry.findMany({
    include: { competency: true },
    orderBy: { occurredOn: "desc" },
  });
  return entries.map(serializeBankEntry);
}

export async function getReleaseRequests(): Promise<ReleaseRequest[]> {
  if (!isDatabaseEnabled()) {
    return mockReleaseRequests;
  }

  const prisma = getPrismaClient();
  const requests = await prisma!.releaseRequest.findMany({
    include: {
      contract: {
        select: {
          normativeRegime: true,
        },
      },
      items: {
        orderBy: [{ competencyRef: "asc" }, { createdAt: "asc" }],
      },
      documents: true,
      approvals: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return requests.map(serializeReleaseRequest);
}

export async function getReconciliations(): Promise<ReconciliationRecord[]> {
  if (!isDatabaseEnabled()) {
    return mockReconciliations;
  }

  const prisma = getPrismaClient();
  const reconciliations = await prisma!.bankReconciliation.findMany({
    include: { competency: true },
    orderBy: { createdAt: "desc" },
  });
  return reconciliations.map(serializeReconciliation);
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  if (!isDatabaseEnabled()) {
    return mockAuditEvents;
  }

  const prisma = getPrismaClient();
  const events = await prisma!.auditLog.findMany({ orderBy: { createdAt: "desc" } });
  return events.map(serializeAuditEvent);
}

export async function getUsers(): Promise<AppUser[]> {
  if (!isDatabaseEnabled()) {
    return mockUsers;
  }

  const prisma = getPrismaClient();
  const users = await prisma!.user.findMany({ orderBy: { name: "asc" } });
  return users.map(serializeUser);
}
