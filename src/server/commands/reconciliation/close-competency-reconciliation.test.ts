import assert from "node:assert/strict";
import test from "node:test";
import {
  closeCompetencyReconciliationWithDependencies,
  type CloseCompetencyReconciliationDependencies,
} from "@/server/commands/reconciliation/close-competency-reconciliation";
import type { AppUser } from "@/features/platform/types";
import type { CloseCompetencyReconciliationInput } from "@/features/reconciliation/types";

const financialUser: AppUser = {
  id: "user-003",
  name: "Rafaela Vasques",
  email: "rafaela.vasques@jmu.mil.br",
  role: "Financeiro",
  scope: "2CJM",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<CloseCompetencyReconciliationDependencies["getPrismaClient"]>
>;

function buildInput(
  overrides?: Partial<CloseCompetencyReconciliationInput>,
): CloseCompetencyReconciliationInput {
  return {
    competencyId: "comp-2026-02-c1",
    justification:
      "Fechamento formal registrado após confirmação da competência sem pendências operacionais.",
    ...overrides,
  };
}

function createFakePrisma(options?: {
  status?: "conciliada" | "fechada" | "reaberta";
  approvedPendingExecution?: number;
  unexplainedDifference?: number;
}) {
  const updatedCompetencies: Array<Record<string, unknown>> = [];
  const createdAuditLogs: Array<Record<string, unknown>> = [];

  const tx = {
    competency: {
      async findUnique() {
        return {
          id: "comp-2026-02-c1",
          contractId: "c-2cjm-001",
          competency: "2026-02",
          status: options?.status ?? "conciliada",
          closedAt: null,
          closedBy: null,
          closureJustification: null,
          reopenedAt: null,
          reopenedBy: null,
          reopeningJustification: null,
          operationalOccurrences: [],
          contract: {
            code: "CT 07/2025",
          },
          reconciliations: [
            {
              id: "rec-2026-02-c1",
              approvedPendingExecution: {
                toNumber: () => options?.approvedPendingExecution ?? 0,
              },
              unexplainedDifference: {
                toNumber: () => options?.unexplainedDifference ?? 0,
              },
            },
          ],
        };
      },
      async update(args: { data: Record<string, unknown> }) {
        updatedCompetencies.push(args.data);
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
    updatedCompetencies,
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
    canCloseCompetencyReconciliation: () => true,
  } satisfies CloseCompetencyReconciliationDependencies;
}

test("closing a competency is valid when minimum operational closure is ready", async () => {
  const fake = createFakePrisma();

  const result = await closeCompetencyReconciliationWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(fake.updatedCompetencies.length, 1);
  assert.equal(fake.createdAuditLogs.length, 1);
  assert.equal(fake.updatedCompetencies[0].status, "fechada");
});

test("closing a competency is blocked when operational closure is not ready", async () => {
  const fake = createFakePrisma({
    approvedPendingExecution: 100,
  });

  const result = await closeCompetencyReconciliationWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /pendente de execução|pendências/i);
});

test("closing a competency records audit trail", async () => {
  const fake = createFakePrisma();

  const result = await closeCompetencyReconciliationWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  const auditEntry = fake.createdAuditLogs[0];
  assert.equal(
    auditEntry.action,
    "Fechamento formal de competência de conciliação",
  );
  assert.equal(auditEntry.entity, "competency");
  assert.match(String(auditEntry.details), /fechamento formal/i);
});
