import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/queries";
import type { AppUser, CompetencyOccurrence } from "@/features/platform/types";
import { canReopenCompetencyReconciliation } from "@/features/reconciliation/policy";
import {
  type ReopenCompetencyReconciliationCommandResult,
  type ReopenCompetencyReconciliationInput,
} from "@/features/reconciliation/types";
import {
  summarizeCompetencyFormalClosure,
  summarizeReconciliationOperationalClosure,
} from "@/features/reconciliation/workflow";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";

function validateInput(input: ReopenCompetencyReconciliationInput) {
  const fieldErrors: {
    competencyId?: string;
    justification?: string;
  } = {};

  if (!input.competencyId) {
    fieldErrors.competencyId = "Informe a competência a ser reaberta.";
  }

  if (!input.justification) {
    fieldErrors.justification =
      "Informe a justificativa operacional da reabertura.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

type ReopenableCompetencyRecord = {
  id: string;
  contractId: string;
  competency: string;
  status: "aberta" | "em_calculo" | "calculada" | "conciliada" | "fechada" | "reaberta";
  closureJustification: string | null;
  reopeningJustification: string | null;
  operationalOccurrences: Prisma.JsonValue | null;
  contract: {
    code: string;
  };
  reconciliations: Array<{
    approvedPendingExecution: { toNumber(): number };
    unexplainedDifference: { toNumber(): number };
  }>;
};

export interface ReopenCompetencyReconciliationDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
  } | null;
  canReopenCompetencyReconciliation(user: AppUser): boolean;
}

const defaultDependencies: ReopenCompetencyReconciliationDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient,
  canReopenCompetencyReconciliation,
};

function normalizeOccurrences(value: Prisma.JsonValue | null): CompetencyOccurrence[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const record = item as Record<string, unknown>;

    if (
      typeof record.id !== "string" ||
      typeof record.type !== "string" ||
      typeof record.actor !== "string" ||
      typeof record.description !== "string" ||
      typeof record.happenedAt !== "string"
    ) {
      return [];
    }

    return [
      {
        id: record.id,
        type: record.type as CompetencyOccurrence["type"],
        actor: record.actor,
        description: record.description,
        happenedAt: record.happenedAt,
      },
    ];
  });
}

export async function reopenCompetencyReconciliation(
  input: ReopenCompetencyReconciliationInput,
): Promise<ReopenCompetencyReconciliationCommandResult> {
  return reopenCompetencyReconciliationWithDependencies(
    input,
    defaultDependencies,
  );
}

export async function reopenCompetencyReconciliationWithDependencies(
  input: ReopenCompetencyReconciliationInput,
  dependencies: ReopenCompetencyReconciliationDependencies,
): Promise<ReopenCompetencyReconciliationCommandResult> {
  const normalizedInput = {
    competencyId: input.competencyId.trim(),
    justification: input.justification.trim(),
  };

  const validation = validateInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message: "Verifique os campos obrigatórios da reabertura da competência.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const user = await dependencies.getCurrentUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  if (!dependencies.isDatabaseEnabled()) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A reabertura controlada da competência exige DATABASE_URL configurada. No modo em memória, a conciliação permanece somente leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexão com o banco não está disponível para registrar a reabertura da competência.",
    };
  }

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const competency = (await tx.competency.findUnique({
        where: { id: normalizedInput.competencyId },
        select: {
          id: true,
          contractId: true,
          competency: true,
          status: true,
          closureJustification: true,
          reopeningJustification: true,
          operationalOccurrences: true,
          contract: {
            select: {
              code: true,
            },
          },
          reconciliations: {
            select: {
              approvedPendingExecution: true,
              unexplainedDifference: true,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })) as ReopenableCompetencyRecord | null;

      if (!competency) {
        return {
          ok: false,
          code: "not_found",
          message: "Competência de conciliação não encontrada.",
          fieldErrors: {
            competencyId: "Competência inválida.",
          },
        } satisfies ReopenCompetencyReconciliationCommandResult;
      }

      if (!dependencies.canReopenCompetencyReconciliation(user)) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil não possui permissão para reabrir formalmente a competência de conciliação.",
        } satisfies ReopenCompetencyReconciliationCommandResult;
      }

      const reconciliation = competency.reconciliations[0];
      const operationalClosure = summarizeReconciliationOperationalClosure({
        approvedPendingExecution:
          reconciliation?.approvedPendingExecution.toNumber() ?? 0,
        unexplainedDifference:
          reconciliation?.unexplainedDifference.toNumber() ?? 0,
      });
      const existingOccurrences = normalizeOccurrences(
        competency.operationalOccurrences,
      );
      const formalClosure = summarizeCompetencyFormalClosure({
        status: competency.status,
        operationalClosureState: operationalClosure.state,
        closureJustification: competency.closureJustification ?? undefined,
        reopeningJustification: competency.reopeningJustification ?? undefined,
        occurrences: existingOccurrences,
      });

      if (!formalClosure.canReopen) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            formalClosure.state === "fechada"
              ? "A competência pode ser reaberta apenas uma vez por vez com justificativa controlada."
              : "A competência só pode ser reaberta quando estiver formalmente fechada.",
        } satisfies ReopenCompetencyReconciliationCommandResult;
      }

      const reopenedAt = new Date();
      const nextOccurrences = [
        ...existingOccurrences,
        {
          id: randomUUID(),
          type: "reabertura_controlada" as const,
          actor: user.name,
          description: normalizedInput.justification,
          happenedAt: reopenedAt.toISOString(),
        },
      ];

      await tx.competency.update({
        where: { id: competency.id },
        data: {
          status: "reaberta",
          reopenedAt,
          reopenedBy: user.name,
          reopeningJustification: normalizedInput.justification,
          operationalOccurrences:
            nextOccurrences as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: competency.contractId,
          userId: user.id,
          actorName: user.name,
          action: "Reabertura controlada de competência de conciliação",
          entity: "competency",
          before: {
            competencyId: competency.id,
            status: competency.status,
            formalClosureState: formalClosure.state,
          },
          after: {
            competencyId: competency.id,
            status: "reaberta",
            reopenedAt: reopenedAt.toISOString(),
            reopenedBy: user.name,
            reopeningJustification: normalizedInput.justification,
          },
          details: normalizedInput.justification,
        },
      });

      return {
        ok: true,
        data: {
          competencyId: competency.id,
          contractId: competency.contractId,
          competency: competency.competency,
          reopenedAt: reopenedAt.toISOString(),
          reopenedBy: user.name,
        },
      } satisfies ReopenCompetencyReconciliationCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message:
        "Não foi possível registrar a reabertura controlada da competência neste momento.",
    };
  }
}
