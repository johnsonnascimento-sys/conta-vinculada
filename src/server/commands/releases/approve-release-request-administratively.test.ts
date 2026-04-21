import assert from "node:assert/strict";
import test from "node:test";
import {
  approveReleaseRequestAdministrativelyWithDependencies,
  type ApproveReleaseRequestAdministrativelyDependencies,
} from "@/server/commands/releases/approve-release-request-administratively";
import type { AppUser } from "@/features/platform/types";
import type { AdministrativeApproveReleaseRequestInput } from "@/features/releases/types";

const adminUser: AppUser = {
  id: "user-001",
  name: "Beatriz Campos",
  email: "beatriz.campos@jmu.mil.br",
  role: "Administrador do órgão",
  scope: "2CJM",
  mfaEnabled: true,
};

type TestPrismaClient = NonNullable<
  ReturnType<ApproveReleaseRequestAdministrativelyDependencies["getPrismaClient"]>
>;

function buildInput(
  overrides?: Partial<AdministrativeApproveReleaseRequestInput>,
): AdministrativeApproveReleaseRequestInput {
  return {
    requestId: "rr-002",
    decision: "aprovar_parcial",
    notes: "Consolidação administrativa compatível com a glosa do item.",
    ...overrides,
  };
}

function createFakePrisma(options?: {
  status?: "aprovada" | "aprovada_parcial" | "rejeitada" | "em_analise";
  itemDecisions?: Array<"aprovado" | "aprovado_parcial" | "glosado" | "pendente">;
  documentKinds?: Array<"ferias" | "folha" | "comprovante_pagamento">;
  latestApproval?: {
    decision: "aprovar" | "aprovar_parcial" | "rejeitar";
    decidedBy: string;
    notes?: string | null;
    createdAt: Date;
  };
}) {
  const createdApprovals: Array<Record<string, unknown>> = [];
  const updatedRequests: Array<Record<string, unknown>> = [];
  const createdAuditLogs: Array<Record<string, unknown>> = [];

  const approvals = options?.latestApproval
    ? [
        {
          stage: "aprovacao_administrativa" as const,
          decision: options.latestApproval.decision,
          decidedBy: options.latestApproval.decidedBy,
          notes: options.latestApproval.notes ?? null,
          createdAt: options.latestApproval.createdAt,
        },
      ]
    : [];

  const tx = {
    releaseRequest: {
      async findUnique() {
        return {
          id: "rr-002",
          contractId: "c-2cjm-002",
          status: options?.status ?? "aprovada_parcial",
          releaseType: "ferias",
          movementMode: "resgate_contratada",
          approverName: null,
          contract: {
            code: "CT 12/2024",
            normativeRegime: "cnj_169_2013",
          },
          items: (options?.itemDecisions ?? ["aprovado_parcial"]).map((decision) => ({
            decision,
          })),
          documents: (options?.documentKinds ?? [
            "ferias",
            "folha",
            "comprovante_pagamento",
          ]).map((kind) => ({
            kind,
          })),
          approvals,
        };
      },
      async update(args: { data: Record<string, unknown> }) {
        updatedRequests.push(args.data);
        return {
          id: "rr-002",
          approverName: args.data.approverName,
        };
      },
    },
    approval: {
      async create(args: { data: Record<string, unknown> }) {
        createdApprovals.push(args.data);
        return {
          id: "approval-001",
          createdAt: new Date("2026-04-21T12:30:00Z"),
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
    updatedRequests,
    createdAuditLogs,
    prisma: {
      async $transaction<T>(callback: (currentTx: typeof tx) => Promise<T>) {
        return callback(tx);
      },
    },
  };
}

test("administrative approval returns database_unavailable without real database", async () => {
  const result = await approveReleaseRequestAdministrativelyWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => adminUser,
      isDatabaseEnabled: () => false,
      getPrismaClient: () => null,
      canApproveReleaseRequestAdministratively: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "database_unavailable");
});

test("administrative approval blocks documentary pendency relevant to the current stage", async () => {
  const fake = createFakePrisma({
    documentKinds: ["ferias"],
  });

  const result = await approveReleaseRequestAdministrativelyWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => adminUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canApproveReleaseRequestAdministratively: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /pendência documental/i);
});

test("administrative approval blocks request without full item consolidation", async () => {
  const fake = createFakePrisma({
    status: "em_analise",
    itemDecisions: ["aprovado", "pendente"],
  });

  const result = await approveReleaseRequestAdministrativelyWithDependencies(
    buildInput({ decision: "aprovar", notes: "" }),
    {
      getCurrentUser: async () => adminUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canApproveReleaseRequestAdministratively: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.match(result.message, /decisão suficiente em todos os itens/i);
});

test("administrative approval blocks incompatible consolidated decision", async () => {
  const fake = createFakePrisma({
    status: "aprovada_parcial",
    itemDecisions: ["aprovado_parcial"],
  });

  const result = await approveReleaseRequestAdministrativelyWithDependencies(
    buildInput({ decision: "aprovar", notes: "" }),
    {
      getCurrentUser: async () => adminUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canApproveReleaseRequestAdministratively: () => true,
    },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_state");
  assert.equal(
    result.fieldErrors?.decision,
    "Escolha uma decisão compatível com o resultado consolidado da análise dos itens.",
  );
});

test("administrative approval persists approval, approver and audit log together", async () => {
  const fake = createFakePrisma({
    status: "aprovada_parcial",
    itemDecisions: ["aprovado_parcial"],
  });

  const result = await approveReleaseRequestAdministrativelyWithDependencies(
    buildInput(),
    {
      getCurrentUser: async () => adminUser,
      isDatabaseEnabled: () => true,
      getPrismaClient: () => fake.prisma as unknown as TestPrismaClient,
      canApproveReleaseRequestAdministratively: () => true,
    },
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.decision, "aprovar_parcial");
  assert.equal(result.data.approverName, adminUser.name);
  assert.equal(fake.createdApprovals.length, 1);
  assert.equal(fake.updatedRequests.length, 1);
  assert.equal(fake.createdAuditLogs.length, 1);

  const createdApproval = fake.createdApprovals[0];
  assert.equal(createdApproval.stage, "aprovacao_administrativa");
  assert.equal(createdApproval.decision, "aprovar_parcial");
  assert.equal(createdApproval.decidedBy, adminUser.name);

  const updatedRequest = fake.updatedRequests[0];
  assert.equal(updatedRequest.approverName, adminUser.name);

  const auditLog = fake.createdAuditLogs[0];
  assert.equal(
    auditLog.action,
    "Consolida aprovacao administrativa de solicitacao de liberacao",
  );
  assert.equal(auditLog.entity, "release_request");
  assert.equal(auditLog.userId, adminUser.id);
  assert.deepEqual(auditLog.after, {
    releaseRequestId: "rr-002",
    approverName: adminUser.name,
    decision: "aprovar_parcial",
    stage: "aprovacao_administrativa",
    notes: "Consolidação administrativa compatível com a glosa do item.",
  });
});
