import assert from "node:assert/strict";
import test from "node:test";
import {
  createReleaseRequestWithDependencies,
  type CreateReleaseRequestDependencies,
} from "@/server/commands/releases/create-release-request";
import type { AppUser } from "@/features/platform/types";
import type { CreateReleaseRequestInput } from "@/features/releases/types";

const analystUser: AppUser = {
  id: "user-002",
  name: "Felipe Costa",
  email: "felipe.costa@jmu.mil.br",
  role: "Analista",
  scope: "CT 07/2025",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<CreateReleaseRequestDependencies["getPrismaClient"]>
>;

function buildInput(): CreateReleaseRequestInput {
  return {
    contractId: "c-2cjm-001",
    releaseType: "ferias",
    movementMode: "resgate_contratada",
    factualBasis: "Ferias vencidas de dois empregados com memoria proporcional.",
    competencyStart: "2026-03",
    competencyEnd: "2026-03",
    requestedTotalAmount: 2310,
    notes: "Solicitacao de teste.",
    items: [
      {
        employeeId: "emp-001",
        releaseRubric: "ferias",
        competencyRef: "2026-03",
        employmentStartDate: "2024-03-10",
        allocationStartDate: "2025-02-01",
        factOccurredOn: "2026-03-15",
        requestedAmount: 1560,
        calculationMemory: {
          notes: "Base integral.",
        },
      },
      {
        employeeId: "emp-002",
        releaseRubric: "terco_constitucional_ferias",
        competencyRef: "2026-03",
        employmentStartDate: "2023-11-01",
        allocationStartDate: "2025-02-01",
        factOccurredOn: "2026-03-18",
        requestedAmount: 750,
        calculationMemory: {
          notes: "Terco constitucional proporcional.",
        },
      },
    ],
  };
}

function createFakePrisma(options?: {
  duplicateRequest?: boolean;
  contractCode?: string;
}) {
  const createdAuditLogs: Array<Record<string, unknown>> = [];
  const createdRequests: Array<Record<string, unknown>> = [];

  const tx = {
    contract: {
      async findUnique() {
        return {
          id: "c-2cjm-001",
          code: options?.contractCode ?? "CT 07/2025",
          companyId: "company-atlas",
          status: "ativo" as const,
        };
      },
    },
    employee: {
      async findMany() {
        return [
          { id: "emp-001", admissionDate: new Date("2024-03-10") },
          { id: "emp-002", admissionDate: new Date("2023-11-01") },
        ];
      },
    },
    employeeAllocation: {
      async findMany() {
        return [
          {
            employeeId: "emp-001",
            startDate: new Date("2025-02-01"),
            endDate: null,
          },
          {
            employeeId: "emp-002",
            startDate: new Date("2025-02-01"),
            endDate: null,
          },
        ];
      },
    },
    competency: {
      async findMany() {
        return [{ competency: "2026-03" }];
      },
    },
    releaseRequest: {
      async findUnique() {
        return null;
      },
      async findMany() {
        if (!options?.duplicateRequest) {
          return [];
        }

        return [
          {
            id: "rr-open",
            status: "enviada",
            items: [
              {
                employeeId: "emp-001",
                releaseRubric: "ferias",
                competencyRef: "2026-03",
                factOccurredOn: new Date("2026-03-15"),
              },
            ],
          },
        ];
      },
      async create(args: {
        data: Record<string, unknown>;
      }) {
        createdRequests.push(args.data);

        const items = (args.data.items as { create: Array<Record<string, unknown>> }).create;

        return {
          id: "rr-new",
          protocol: "RR-2026-TESTE01",
          status: "enviada" as const,
          createdAt: new Date("2026-04-19T12:00:00Z"),
          items: items.map((item, index) => ({
            id: `rr-item-${index + 1}`,
            employeeId: item.employeeId,
            releaseRubric: item.releaseRubric,
            competencyRef: item.competencyRef,
            requestedAmount: item.requestedAmount as number,
            validatedAmount: item.validatedAmount as number,
          })),
        };
      },
    },
    auditLog: {
      async create(args: { data: Record<string, unknown> }) {
        createdAuditLogs.push(args.data);
        return args.data;
      },
    },
  };

  return {
    createdAuditLogs,
    createdRequests,
    prisma: {
      async $transaction<T>(callback: (currentTx: typeof tx) => Promise<T>) {
        return callback(tx);
      },
    },
  };
}

test("createReleaseRequest returns database_unavailable without real database", async () => {
  const result = await createReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => false,
    getPrismaClient: () => null,
    canInitiateReleaseRequest: () => true,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "database_unavailable");
});

test("createReleaseRequest blocks unauthorized user", async () => {
  const fake = createFakePrisma();

  const result = await createReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as TestPrismaClient,
    canInitiateReleaseRequest: () => false,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "unauthorized");
});

test("createReleaseRequest blocks duplicate open request", async () => {
  const fake = createFakePrisma({ duplicateRequest: true });

  const result = await createReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as TestPrismaClient,
    canInitiateReleaseRequest: () => true,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "duplicate_request");
});

test("createReleaseRequest persists multiple items and audit log together", async () => {
  const fake = createFakePrisma();

  const result = await createReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as TestPrismaClient,
    canInitiateReleaseRequest: () => true,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.status, "enviada");
  assert.equal(result.data.itemCount, 2);
  assert.equal(fake.createdRequests.length, 1);
  assert.equal(fake.createdAuditLogs.length, 1);

  const createdRequest = fake.createdRequests[0];
  const createdItems = (createdRequest.items as { create: Array<Record<string, unknown>> }).create;

  assert.equal(createdRequest.companyId, "company-atlas");
  assert.equal(createdRequest.releaseType, "ferias");
  assert.equal(createdRequest.status, "enviada");
  assert.equal(createdItems.length, 2);
  assert.equal(createdItems[0].validatedAmount, createdItems[0].requestedAmount);
  assert.equal(createdItems[1].validatedAmount, createdItems[1].requestedAmount);

  const auditLog = fake.createdAuditLogs[0];
  assert.equal(auditLog.entity, "release_request");
  assert.equal(auditLog.userId, analystUser.id);
  assert.equal(auditLog.contractId, "c-2cjm-001");
});
