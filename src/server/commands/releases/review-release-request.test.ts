import assert from "node:assert/strict";
import test from "node:test";
import {
  reviewReleaseRequestWithDependencies,
  type ReviewReleaseRequestDependencies,
} from "@/server/commands/releases/review-release-request";
import type { AppUser } from "@/features/platform/types";
import type { ReviewReleaseRequestInput } from "@/features/releases/types";

const analystUser: AppUser = {
  id: "user-002",
  name: "Felipe Costa",
  email: "felipe.costa@jmu.mil.br",
  role: "Analista",
  scope: "CT 07/2025",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<ReviewReleaseRequestDependencies["getPrismaClient"]>
>;

function buildInput(
  overrides?: Partial<ReviewReleaseRequestInput>,
): ReviewReleaseRequestInput {
  return {
    requestId: "rr-001",
    itemId: "rr-item-001",
    decision: "aprovar",
    approvedAmount: 1560,
    notes: "",
    ...overrides,
  };
}

function createFakePrisma(options?: {
  requestStatus?: "enviada" | "em_analise" | "aprovada";
  itemDecision?: "pendente" | "aprovado";
}) {
  const createdAuditLogs: Array<Record<string, unknown>> = [];
  const updatedItems: Array<Record<string, unknown>> = [];
  const updatedRequests: Array<Record<string, unknown>> = [];

  const tx = {
    releaseRequest: {
      async findUnique() {
        return {
          id: "rr-001",
          contractId: "c-2cjm-001",
          status: options?.requestStatus ?? "enviada",
          analystName: null,
          contract: {
            code: "CT 07/2025",
          },
          items: [
            {
              id: "rr-item-001",
              releaseRubric: "ferias",
              competencyRef: "2026-03",
              requestedAmount: {
                toNumber: () => 1560,
              },
              approvedAmount: {
                toNumber: () => 0,
              },
              decision: options?.itemDecision ?? "pendente",
            },
          ],
        };
      },
      async update(args: { data: Record<string, unknown> }) {
        updatedRequests.push(args.data);
        return {
          id: "rr-001",
          analystName: analystUser.name,
        };
      },
    },
    releaseRequestItem: {
      async update(args: { data: Record<string, unknown> }) {
        updatedItems.push(args.data);
        return {
          id: "rr-item-001",
          approvedAmount: {
            toNumber: () => Number(args.data.approvedAmount),
          },
          updatedAt: new Date("2026-04-20T12:00:00Z"),
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
    updatedItems,
    updatedRequests,
    prisma: {
      async $transaction<T>(callback: (currentTx: typeof tx) => Promise<T>) {
        return callback(tx);
      },
    },
  };
}

test("reviewReleaseRequest returns database_unavailable without real database", async () => {
  const result = await reviewReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => false,
    getPrismaClient: () => null,
    canReviewReleaseRequest: () => true,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "database_unavailable");
});

test("reviewReleaseRequest blocks unauthorized user", async () => {
  const fake = createFakePrisma();

  const result = await reviewReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
    canReviewReleaseRequest: () => false,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "unauthorized");
});

test("reviewReleaseRequest blocks item already decided", async () => {
  const fake = createFakePrisma({ itemDecision: "aprovado" });

  const result = await reviewReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
    canReviewReleaseRequest: () => true,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.equal(result.fieldErrors?.itemId, "Item ja analisado nesta solicitacao.");
});

test("reviewReleaseRequest persists decision and audit log together", async () => {
  const fake = createFakePrisma();

  const result = await reviewReleaseRequestWithDependencies(buildInput(), {
    getCurrentUser: async () => analystUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
    canReviewReleaseRequest: () => true,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.requestStatus, "aprovada");
  assert.equal(result.data.itemDecision, "aprovado");
  assert.equal(fake.updatedItems.length, 1);
  assert.equal(fake.updatedRequests.length, 1);
  assert.equal(fake.createdAuditLogs.length, 1);

  const updatedItem = fake.updatedItems[0];
  assert.equal(updatedItem.decision, "aprovado");
  assert.equal(updatedItem.approvedAmount, 1560);

  const auditLog = fake.createdAuditLogs[0];
  assert.equal(auditLog.entity, "release_request_item");
  assert.equal(auditLog.userId, analystUser.id);
  assert.equal(auditLog.contractId, "c-2cjm-001");
});
