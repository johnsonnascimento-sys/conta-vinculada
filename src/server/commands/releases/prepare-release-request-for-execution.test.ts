import assert from "node:assert/strict";
import test from "node:test";
import {
  prepareReleaseRequestForExecutionWithDependencies,
  type PrepareReleaseRequestForExecutionDependencies,
} from "@/server/commands/releases/prepare-release-request-for-execution";
import type { AppUser } from "@/features/platform/types";
import type { PrepareReleaseRequestForExecutionInput } from "@/features/releases/types";

const financialUser: AppUser = {
  id: "user-003",
  name: "Rafaela Vasques",
  email: "rafaela.vasques@jmu.mil.br",
  role: "Financeiro",
  scope: "2CJM",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<PrepareReleaseRequestForExecutionDependencies["getPrismaClient"]>
>;

function buildInput(
  overrides?: Partial<PrepareReleaseRequestForExecutionInput>,
): PrepareReleaseRequestForExecutionInput {
  return {
    requestId: "rr-002",
    notes: "Checklist financeiro interno registrado.",
    ...overrides,
  };
}

function createFakePrisma(options?: {
  approvedAmounts?: number[];
  itemDecisions?: Array<"aprovado" | "aprovado_parcial" | "glosado" | "pendente">;
  documents?: Array<
    | "rescisao"
    | "fgts"
    | "comprovante_pagamento"
    | "despacho"
    | "parecer"
  >;
  adminDecision?: "aprovar" | "aprovar_parcial" | "rejeitar";
  currentBalance?: number;
  unexplainedDifference?: number;
  hasEffectiveExecution?: boolean;
  latestPreparation?: {
    decidedBy: string;
    notes?: string | null;
    createdAt: Date;
  };
}) {
  const createdApprovals: Array<Record<string, unknown>> = [];
  const createdAuditLogs: Array<Record<string, unknown>> = [];

  const approvals: Array<{
    stage:
      | "aprovacao_administrativa"
      | "execucao_financeira";
    decision: "aprovar" | "aprovar_parcial" | "rejeitar";
    decidedBy: string;
    notes: string | null;
    createdAt: Date;
  }> = [
    {
      stage: "aprovacao_administrativa" as const,
      decision: options?.adminDecision ?? "aprovar_parcial",
      decidedBy: "Beatriz Campos",
      notes: "Consolidação administrativa registrada.",
      createdAt: new Date("2026-04-21T10:00:00Z"),
    },
  ];

  if (options?.latestPreparation) {
    approvals.unshift({
      stage: "execucao_financeira" as const,
      decision: "aprovar" as const,
      decidedBy: options.latestPreparation.decidedBy,
      notes: options.latestPreparation.notes ?? null,
      createdAt: options.latestPreparation.createdAt,
    });
  }

  const tx = {
    releaseRequest: {
      async findUnique() {
        return {
          id: "rr-002",
          contractId: "c-2cjm-002",
          status: "aprovada_parcial",
          releaseType: "rescisao",
          movementMode: "resgate_contratada",
          competencyEnd: "2026-03",
          contract: {
            code: "CT 12/2024",
            normativeRegime: "cnj_169_2013",
            linkedAccounts: [
              {
                isOfficialPublicBank: true,
                cooperationTermRef: "TCT-CNJ-CEF-2024",
                currentBalance: {
                  toNumber: () => options?.currentBalance ?? 232904.12,
                },
              },
            ],
            reconciliations: [
              {
                approvedPendingExecution: {
                  toNumber: () => 3650,
                },
                unexplainedDifference: {
                  toNumber: () => options?.unexplainedDifference ?? 0,
                },
                competency: {
                  competency: "2026-03",
                },
              },
            ],
          },
          items: (options?.itemDecisions ?? ["aprovado_parcial"]).map(
            (decision, index) => ({
              decision,
              approvedAmount: {
                toNumber: () => options?.approvedAmounts?.[index] ?? 3650,
              },
            }),
          ),
          documents: (options?.documents ?? [
            "rescisao",
            "fgts",
            "comprovante_pagamento",
            "despacho",
          ]).map((kind) => ({
            kind,
          })),
          approvals,
          releaseExecutions: options?.hasEffectiveExecution
            ? [
                {
                  bankEntryId: "entry-006",
                  executedAmount: {
                    toNumber: () => 3650,
                  },
                  executedAt: new Date("2026-04-22T10:00:00Z"),
                },
              ]
            : [],
        };
      },
    },
    approval: {
      async create(args: { data: Record<string, unknown> }) {
        createdApprovals.push(args.data);
        return {
          createdAt: new Date("2026-04-21T15:30:00Z"),
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
    createdApprovals,
    createdAuditLogs,
    prisma: {
      async $transaction<T>(callback: (currentTx: typeof tx) => Promise<T>) {
        return callback(tx);
      },
    },
  };
}

test("financial preparation blocks request when not yet ready", async () => {
  const fake = createFakePrisma({
    documents: ["rescisao", "fgts", "comprovante_pagamento"],
  });

  const result = await prepareReleaseRequestForExecutionWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canPrepareReleaseRequestForExecution: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /evid/i);
});

test("financial preparation blocks request with unexplained reconciliation difference", async () => {
  const fake = createFakePrisma({
    unexplainedDifference: 12.5,
  });

  const result = await prepareReleaseRequestForExecutionWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canPrepareReleaseRequestForExecution: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /concilia/i);
});

test("financial preparation persists internal preparation and audit without creating effective execution", async () => {
  const fake = createFakePrisma();

  const result = await prepareReleaseRequestForExecutionWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canPrepareReleaseRequestForExecution: () => true,
    },
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.eligibleAmount, 3650);
  assert.equal(result.data.preparedBy, financialUser.name);
  assert.equal(fake.createdApprovals.length, 1);
  assert.equal(fake.createdAuditLogs.length, 1);

  const createdApproval = fake.createdApprovals[0];
  assert.equal(createdApproval.stage, "execucao_financeira");
  assert.equal(createdApproval.decision, "aprovar");
  assert.equal(createdApproval.decidedBy, financialUser.name);

  const auditLog = fake.createdAuditLogs[0];
  assert.equal(
    auditLog.action,
    "Registra preparo interno para futura execucao financeira",
  );
  assert.equal(auditLog.entity, "release_request");
  assert.equal(auditLog.userId, financialUser.id);
  const after = auditLog.after as Record<string, unknown>;
  assert.equal(after.preparationState, "preparada");
  assert.equal(after.eligibleAmount, 3650);
});

test("financial preparation keeps internal preparation distinct from effective execution", async () => {
  const fake = createFakePrisma({
    hasEffectiveExecution: true,
  });

  const result = await prepareReleaseRequestForExecutionWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canPrepareReleaseRequestForExecution: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /registro|financeira efetiva/i);
});
