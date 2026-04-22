import assert from "node:assert/strict";
import test from "node:test";
import {
  executeReleaseRequestEffectivelyWithDependencies,
  type ExecuteReleaseRequestEffectivelyDependencies,
} from "@/server/commands/releases/execute-release-request-effectively";
import type { AppUser } from "@/features/platform/types";
import type { ExecuteReleaseRequestEffectivelyInput } from "@/features/releases/types";

const financialUser: AppUser = {
  id: "user-003",
  name: "Rafaela Vasques",
  email: "rafaela.vasques@jmu.mil.br",
  role: "Financeiro",
  scope: "2CJM",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<ExecuteReleaseRequestEffectivelyDependencies["getPrismaClient"]>
>;

function buildInput(
  overrides?: Partial<ExecuteReleaseRequestEffectivelyInput>,
): ExecuteReleaseRequestEffectivelyInput {
  return {
    requestId: "rr-002",
    bankEntryId: "entry-006",
    notes: "Vínculo da execução efetiva com lançamento bancário conferido.",
    ...overrides,
  };
}

function createFakePrisma(options?: {
  hasPreparation?: boolean;
  hasEffectiveExecution?: boolean;
  bankEntryAmount?: number;
  bankEntryContractId?: string;
  bankEntryLinked?: boolean;
}) {
  const createdExecutions: Array<Record<string, unknown>> = [];
  const updatedRequests: Array<Record<string, unknown>> = [];
  const updatedReconciliations: Array<Record<string, unknown>> = [];
  const createdAuditLogs: Array<Record<string, unknown>> = [];

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
                  toNumber: () => 232904.12,
                },
              },
            ],
            reconciliations: [
              {
                id: "rec-002",
                approvedPendingExecution: {
                  toNumber: () => 3650,
                },
                unexplainedDifference: {
                  toNumber: () => 0,
                },
                differenceType: "explicada" as const,
                competency: {
                  competency: "2026-03",
                },
              },
            ],
          },
          items: [
            {
              decision: "aprovado_parcial" as const,
              approvedAmount: {
                toNumber: () => 3650,
              },
            },
          ],
          documents: [
            { kind: "rescisao" as const },
            { kind: "fgts" as const },
            { kind: "comprovante_pagamento" as const },
            { kind: "despacho" as const },
          ],
          approvals: [
            ...(options?.hasPreparation === false
              ? []
              : [
                  {
                    stage: "execucao_financeira" as const,
                    decision: "aprovar" as const,
                    decidedBy: "Rafaela Vasques",
                    notes: "Checklist financeiro interno concluído.",
                    createdAt: new Date("2026-04-21T14:00:00Z"),
                  },
                ]),
            {
              stage: "aprovacao_administrativa" as const,
              decision: "aprovar_parcial" as const,
              decidedBy: "Beatriz Campos",
              notes: "Consolidação administrativa registrada.",
              createdAt: new Date("2026-04-21T10:00:00Z"),
            },
          ],
          releaseExecutions: options?.hasEffectiveExecution
            ? [
                {
                  bankEntryId: "entry-006",
                  executedAmount: {
                    toNumber: () => 3650,
                  },
                  executedAt: new Date("2026-04-22T10:00:00Z"),
                  bankEntry: {
                    description: "Liberação preparada para RR-2026-00021",
                  },
                },
              ]
            : [],
        };
      },
      async update(args: { data: Record<string, unknown> }) {
        updatedRequests.push(args.data);
        return args.data;
      },
    },
    bankEntry: {
      async findUnique() {
        return {
          id: "entry-006",
          contractId: options?.bankEntryContractId ?? "c-2cjm-002",
          type: "liberacao" as const,
          description: "Liberação preparada para RR-2026-00021",
          amount: {
            toNumber: () => options?.bankEntryAmount ?? -3650,
          },
          occurredOn: new Date("2026-04-15T00:00:00Z"),
          releaseExecutions: options?.bankEntryLinked ? [{ id: "exec-001" }] : [],
        };
      },
    },
    releaseExecution: {
      async create(args: { data: Record<string, unknown> }) {
        createdExecutions.push(args.data);
        return args.data;
      },
    },
    bankReconciliation: {
      async update(args: { data: Record<string, unknown> }) {
        updatedReconciliations.push(args.data);
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
    createdExecutions,
    updatedRequests,
    updatedReconciliations,
    createdAuditLogs,
    prisma: {
      async $transaction<T>(callback: (currentTx: typeof tx) => Promise<T>) {
        return callback(tx);
      },
    },
  };
}

test("effective execution blocks request without prior financial preparation", async () => {
  const fake = createFakePrisma({
    hasPreparation: false,
  });

  const result = await executeReleaseRequestEffectivelyWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canExecuteReleaseRequestEffectively: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /preparo financeiro/i);
});

test("effective execution blocks request already executed", async () => {
  const fake = createFakePrisma({
    hasEffectiveExecution: true,
  });

  const result = await executeReleaseRequestEffectivelyWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canExecuteReleaseRequestEffectively: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /já foi registrada/i);
});

test("effective execution validates linked bank entry amount", async () => {
  const fake = createFakePrisma({
    bankEntryAmount: -3000,
  });

  const result = await executeReleaseRequestEffectivelyWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canExecuteReleaseRequestEffectively: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /não corresponde/i);
});

test("effective execution persists release execution, bank entry link, audit and reconciliation impact", async () => {
  const fake = createFakePrisma();

  const result = await executeReleaseRequestEffectivelyWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => financialUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canExecuteReleaseRequestEffectively: () => true,
    },
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.bankEntryId, "entry-006");
  assert.equal(result.data.executedAmount, 3650);
  assert.equal(fake.createdExecutions.length, 1);
  assert.equal(fake.updatedRequests.length, 1);
  assert.equal(fake.updatedReconciliations.length, 1);
  assert.equal(fake.createdAuditLogs.length, 1);

  const createdExecution = fake.createdExecutions[0];
  assert.equal(createdExecution.releaseRequestId, "rr-002");
  assert.equal(createdExecution.bankEntryId, "entry-006");
  assert.equal(createdExecution.executedAmount, 3650);

  const requestUpdate = fake.updatedRequests[0];
  assert.equal(requestUpdate.status, "liberada");

  const reconciliationUpdate = fake.updatedReconciliations[0];
  assert.equal(reconciliationUpdate.approvedPendingExecution, 0);

  const auditLog = fake.createdAuditLogs[0];
  assert.equal(
    auditLog.action,
    "Registra execucao financeira efetiva de solicitacao de liberacao",
  );
  assert.equal(auditLog.entity, "release_request");
  const after = auditLog.after as Record<string, unknown>;
  assert.equal(after.bankEntryId, "entry-006");
  assert.equal(after.executedAmount, 3650);
});
