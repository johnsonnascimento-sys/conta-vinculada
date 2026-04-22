import { getBankAccounts, getBankEntries, getReleaseRequests, getReconciliations, getAllocations, getAuditEvents, getCompanies, getCompetencies, getContracts, getEmployees, getProvisionBalances } from "@/server/repositories/platform.repository";
import type {
  AuditEvent,
  BankAccount,
  BankEntry,
  Company,
  Competency,
  Contract,
  Employee,
  EmployeeAllocation,
  ProvisionBalance,
  ReconciliationRecord,
  ReleaseRequest,
} from "@/features/platform/types";

export async function getContractsOverview() {
  const [contracts, companies, provisionBalances, bankAccounts, releaseRequests, reconciliations] =
    await Promise.all([
      getContracts(),
      getCompanies(),
      getProvisionBalances(),
      getBankAccounts(),
      getReleaseRequests(),
      getReconciliations(),
    ]);

  return contracts.map((contract: Contract) => {
    const company = companies.find((item: Company) => item.id === contract.companyId);
    const contractReconciliations = reconciliations.filter(
      (item: ReconciliationRecord) => item.contractId === contract.id,
    );
    const reconciliation = contractReconciliations[0];
    const pendingRequests = releaseRequests.filter(
      (item: ReleaseRequest) =>
        item.contractId === contract.id &&
        ["enviada", "em_analise", "em_exigencia", "aprovada_parcial"].includes(
          item.workflow.derivedStatus,
        ),
    ).length;
    const provisionBalance = provisionBalances
      .filter((item: ProvisionBalance) => item.contractId === contract.id)
      .reduce((total: number, item: ProvisionBalance) => total + item.balance, 0);
    const reservedBalance = provisionBalances
      .filter((item: ProvisionBalance) => item.contractId === contract.id)
      .reduce((total: number, item: ProvisionBalance) => total + item.reserved, 0);
    const bankBalance =
      bankAccounts.find((item: BankAccount) => item.id === contract.bankAccountId)
        ?.currentBalance ?? 0;

    return {
      ...contract,
      companyName: company?.tradeName ?? "Empresa não identificada",
      bankBalance,
      provisionBalance,
      reservedBalance,
      pendingRequests,
      unexplainedDifference: reconciliation?.unexplainedDifference ?? 0,
    };
  });
}

export async function getContractDetail(contractId: string) {
  const [
    contracts,
    companies,
    bankAccounts,
    allocations,
    employees,
    competencies,
    provisionBalances,
    bankEntries,
    releaseRequests,
    reconciliations,
    auditEvents,
  ] = await Promise.all([
    getContracts(),
    getCompanies(),
    getBankAccounts(),
    getAllocations(),
    getEmployees(),
    getCompetencies(),
    getProvisionBalances(),
    getBankEntries(),
    getReleaseRequests(),
    getReconciliations(),
    getAuditEvents(),
  ]);

  const contract = contracts.find((item: Contract) => item.id === contractId);

  if (!contract) {
    return null;
  }

  return {
    contract,
    company: companies.find((item: Company) => item.id === contract.companyId),
    account: bankAccounts.find((item: BankAccount) => item.id === contract.bankAccountId),
    employees: allocations
      .filter((item: EmployeeAllocation) => item.contractId === contractId)
      .map((allocation: EmployeeAllocation) => ({
        ...allocation,
        employee: employees.find((employee: Employee) => employee.id === allocation.employeeId),
      })),
    competencies: competencies.filter((item: Competency) => item.contractId === contractId),
    provisionBalances: provisionBalances
      .filter((item: ProvisionBalance) => item.contractId === contractId)
      .map((balance: ProvisionBalance) => ({
        ...balance,
        employee: employees.find((item: Employee) => item.id === balance.employeeId),
      })),
    bankEntries: bankEntries.filter((item: BankEntry) => item.contractId === contractId),
    releaseRequests: releaseRequests.filter(
      (item: ReleaseRequest) => item.contractId === contractId,
    ),
    reconciliations: reconciliations.filter(
      (item: ReconciliationRecord) => item.contractId === contractId,
    ),
    reconciliation: reconciliations.find(
      (item: ReconciliationRecord) => item.contractId === contractId,
    ),
    auditEvents: auditEvents.filter((item: AuditEvent) => item.contractId === contractId),
  };
}
