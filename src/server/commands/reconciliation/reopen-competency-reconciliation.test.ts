import assert from "node:assert/strict";
import test from "node:test";
import {
  reopenCompetencyReconciliationWithDependencies,
  type ReopenCompetencyReconciliationDependencies,
} from "@/server/commands/reconciliation/reopen-competency-reconciliation";
import type { AppUser } from "@/features/platform/types";
import type { ReopenCompetencyReconciliationInput } from "@/features/reconciliation/types";

const adminUser: AppUser = {
  id: "user-001",
  name: "Beatriz Campos",
  email: "beatriz.campos@jmu.mil.br",
  role: "Administrador do órgão",
  scope: "2CJM",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<ReopenCompetencyReconciliationDependencies["getPrismaClient"]>
>;

function buildInput(
  overrides?: Partial<ReopenCompetencyReconciliationInput>,
): ReopenCompetencyReconciliationInput {
  return {
    competencyId: "comp-2026-01-c1",
    justification:
      "Reabertura necessária para apurar ocorrência operacional superveniente.",
    ...overrides,
  };
}

function createFakePrisma(options?: {
  status?: "conciliada" | "fechada" | "reaberta";
}) {
  const updatedCompetencies: Array<Record<string, unknown>> = [];
  const createdAuditLogs: Array<Record<string, unknown>> = [];

  const tx = {
    competency: {
      async findUnique() {
        return {
          id: "comp-2026-01-c1",
          contractId: "c-2cjm-001",
          competency: "2026-01",
          status: options?.status ?? "fechada",
          closureJustification:
            "Competência já encerrada formalmente em leitura anterior.",
          reopeningJustification: null,
          operationalOccurrences: [],
          contract: {
            code: "CT 07/2025",
          },
          reconciliations: [
            {
              approvedPendingExecution: {
                toNumber: () => 0,
              },
              unexplainedDifference: {
                toNumber: () => 0,
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
    getCurrentUser: async () => adminUser,
    isDatabaseEnabled: () => true,
    getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
    canReopenCompetencyReconciliation: () => true,
  } satisfies ReopenCompetencyReconciliationDependencies;
}

test("reopening a closed competency is valid with explicit justification", async () => {
  const fake = createFakePrisma();

  const result = await reopenCompetencyReconciliationWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(fake.updatedCompetencies.length, 1);
  assert.equal(fake.updatedCompetencies[0].status, "reaberta");
});

test("reopening requires justification", async () => {
  const fake = createFakePrisma();

  const result = await reopenCompetencyReconciliationWithDependencies(
    buildInput({
      justification: "",
    }),
    buildDependencies(fake),
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "validation_error");
  assert.equal(
    result.fieldErrors?.justification,
    "Informe a justificativa operacional da reabertura.",
  );
});

test("reopening is blocked when competency is not formally closed", async () => {
  const fake = createFakePrisma({
    status: "conciliada",
  });

  const result = await reopenCompetencyReconciliationWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /formalmente fechada/i);
});

test("reopening records audit trail", async () => {
  const fake = createFakePrisma();

  const result = await reopenCompetencyReconciliationWithDependencies(
    buildInput(),
    buildDependencies(fake),
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  const auditEntry = fake.createdAuditLogs[0];
  assert.equal(
    auditEntry.action,
    "Reabertura controlada de competência de conciliação",
  );
  assert.equal(auditEntry.entity, "competency");
  assert.match(String(auditEntry.details), /reabertura necessária/i);
});
