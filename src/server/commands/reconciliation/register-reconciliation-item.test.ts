import assert from "node:assert/strict";
import test from "node:test";
import {
  registerReconciliationItemWithDependencies,
  type RegisterReconciliationItemDependencies,
} from "@/server/commands/reconciliation/register-reconciliation-item";
import type { AppUser } from "@/features/platform/types";
import type { RegisterReconciliationItemInput } from "@/features/reconciliation/types";

const financialUser: AppUser = {
  id: "user-003",
  name: "Rafaela Vasques",
  email: "rafaela.vasques@jmu.mil.br",
  role: "Financeiro",
  scope: "2CJM",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<RegisterReconciliationItemDependencies["getPrismaClient"]>
>;

function buildInput(
  overrides?: Partial<RegisterReconciliationItemInput>,
): RegisterReconciliationItemInput {
  return {
    reconciliationId: "rec-001",
    bankEntryId: "entry-002",
    justification:
      "Rendimento bancario reconhecido como diferenca explicada da competencia.",
    ...overrides,
  };
}

function createFakePrisma(options?: {
  explainedDifference?: number;
  bankEntryContractId?: string;
  bankEntryCompetency?: string | null;
  existingItemIds?: string[];
}) {
  const createdItems: Array<Record<string, unknown>> = [];
  const createdAuditLogs: Array<Record<string, unknown>> = [];

  const tx = {
    bankReconciliation: {
      async findUnique() {
        return {
          id: "rec-001",
          contractId: "c-2cjm-001",
          explainedDifference: {
            toNumber: () => options?.explainedDifference ?? 942.18,
          },
          competency: {
            id: "comp-2026-03-c1",
            competency: "2026-03",
          },
          items: (options?.existingItemIds ?? []).map((bankEntryId, index) => ({
            id: `item-${index + 1}`,
            bankEntryId,
          })),
        };
      },
    },
    bankEntry: {
      async findUnique() {
        return {
          id: "entry-002",
          contractId: options?.bankEntryContractId ?? "c-2cjm-001",
          description: "Rendimento bancario de marco",
          type: "rendimento",
          occurredOn: new Date("2026-04-01T00:00:00Z"),
          competency:
            options?.bankEntryCompetency === null
              ? null
              : {
                  id: "comp-2026-03-c1",
                  competency: options?.bankEntryCompetency ?? "2026-03",
                },
        };
      },
    },
    bankReconciliationItem: {
      async create(args: { data: Record<string, unknown> }) {
        createdItems.push(args.data);
        return args.data;
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
    createdItems,
    createdAuditLogs,
    prisma: {
      async $transaction<T>(callback: (currentTx: typeof tx) => Promise<T>) {
        return callback(tx);
      },
    },
  };
}

function buildDependencies(fake: ReturnType<typeof createFakePrisma>) {
  return {
    getCurrentUser: async () => financialUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
    canRegisterReconciliationItem: () => true,
  } satisfies RegisterReconciliationItemDependencies;
}

test("registering reconciliation item persists minimum explained item and audit trail", async () => {
  const fake = createFakePrisma();

  const result = await registerReconciliationItemWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(fake.createdItems.length, 1);
  assert.equal(fake.createdItems[0].reconciliationId, "rec-001");
  assert.equal(fake.createdItems[0].bankEntryId, "entry-002");
  assert.equal(fake.createdAuditLogs.length, 1);
  assert.equal(
    fake.createdAuditLogs[0].action,
    "Registro de item conciliatorio explicado",
  );
});

test("registering reconciliation item blocks bank entry from another competency", async () => {
  const fake = createFakePrisma({
    bankEntryCompetency: "2026-02",
  });

  const result = await registerReconciliationItemWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /outra competencia/i);
});

test("registering reconciliation item blocks duplicate linkage inside same reconciliation", async () => {
  const fake = createFakePrisma({
    existingItemIds: ["entry-002"],
  });

  const result = await registerReconciliationItemWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "conflict");
});
