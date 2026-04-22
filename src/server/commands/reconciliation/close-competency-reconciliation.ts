import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/queries";
import type {
  AppUser,
  CompetencyOccurrence,
  CompetencyStatus,
} from "@/features/platform/types";
import { canCloseCompetencyReconciliation } from "@/features/reconciliation/policy";
import {
  type CloseCompetencyReconciliationCommandResult,
  type CloseCompetencyReconciliationInput,
} from "@/features/reconciliation/types";
import {
  summarizeCompetencyFormalClosure,
  summarizeReconciliationOperationalClosure,
} from "@/features/reconciliation/workflow";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";

function validateInput(input: CloseCompetencyReconciliationInput) {
  const fieldErrors: {
    competencyId?: string;
    justification?: string;
  } = {};

  if (!input.competencyId) {
    fieldErrors.competencyId = "Informe a competência a ser fechada.";
  }

  if (!input.justification) {
    fieldErrors.justification =
      "Informe a justificativa operacional do fechamento.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

type ClosableCompetencyRecord = {
  id: string;
  contractId: string;
  competency: string;
  status: CompetencyStatus;
  closedAt: Date | null;
  closedBy: string | null;
  closureJustification: string | null;
  reopenedAt: Date | null;
  reopenedBy: string | null;
  reopeningJustification: string | null;
  operationalOccurrences: Prisma.JsonValue | null;
  contract: {
    code: string;
  };
  reconciliations: Array<{
    id: string;
    approvedPendingExecution: { toNumber(): number };
    unexplainedDifference: { toNumber(): number };
  }>;
};

export interface CloseCompetencyReconciliationDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
  } | null;
  canCloseCompetencyReconciliation(user: AppUser): boolean;
}

const defaultDependencies: CloseCompetencyReconciliationDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient,
  canCloseCompetencyReconciliation,
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

export async function closeCompetencyReconciliation(
  input: CloseCompetencyReconciliationInput,
): Promise<CloseCompetencyReconciliationCommandResult> {
  return closeCompetencyReconciliationWithDependencies(
    input,
    defaultDependencies,
  );
}

export async function closeCompetencyReconciliationWithDependencies(
  input: CloseCompetencyReconciliationInput,
  dependencies: CloseCompetencyReconciliationDependencies,
): Promise<CloseCompetencyReconciliationCommandResult> {
  const normalizedInput = {
    competencyId: input.competencyId.trim(),
    justification: input.justification.trim(),
  };

  const validation = validateInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message: "Verifique os campos obrigatórios do fechamento da competência.",
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
        "O fechamento formal da competência exige DATABASE_URL configurada. No modo em memória, a conciliação permanece somente leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexão com o banco não está disponível para registrar o fechamento da competência.",
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
          closedAt: true,
          closedBy: true,
          closureJustification: true,
          reopenedAt: true,
          reopenedBy: true,
          reopeningJustification: true,
          operationalOccurrences: true,
          contract: {
            select: {
              code: true,
            },
          },
          reconciliations: {
            select: {
              id: true,
              approvedPendingExecution: true,
              unexplainedDifference: true,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })) as ClosableCompetencyRecord | null;

      if (!competency) {
        return {
          ok: false,
          code: "not_found",
          message: "Competência de conciliação não encontrada.",
          fieldErrors: {
            competencyId: "Competência inválida.",
          },
        } satisfies CloseCompetencyReconciliationCommandResult;
      }

      if (!dependencies.canCloseCompetencyReconciliation(user)) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil não possui permissão para fechar formalmente a competência de conciliação.",
        } satisfies CloseCompetencyReconciliationCommandResult;
      }

      const reconciliation = competency.reconciliations[0];

      if (!reconciliation) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "A competência ainda não possui leitura conciliatória suficiente para fechamento formal.",
        } satisfies CloseCompetencyReconciliationCommandResult;
      }

      const operationalClosure = summarizeReconciliationOperationalClosure({
        approvedPendingExecution:
          reconciliation.approvedPendingExecution.toNumber(),
        unexplainedDifference: reconciliation.unexplainedDifference.toNumber(),
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

      if (!formalClosure.canClose) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            formalClosure.state === "fechada"
              ? "A competência já está formalmente fechada."
              : operationalClosure.reason,
        } satisfies CloseCompetencyReconciliationCommandResult;
      }

      const closedAt = new Date();
      const nextOccurrences = [
        ...existingOccurrences,
        {
          id: randomUUID(),
          type: "fechamento_formal" as const,
          actor: user.name,
          description: normalizedInput.justification,
          happenedAt: closedAt.toISOString(),
        },
      ];

      await tx.competency.update({
        where: { id: competency.id },
        data: {
          status: "fechada",
          closedAt,
          closedBy: user.name,
          closureJustification: normalizedInput.justification,
          operationalOccurrences:
            nextOccurrences as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: competency.contractId,
          userId: user.id,
          actorName: user.name,
          action: "Fechamento formal de competência de conciliação",
          entity: "competency",
          before: {
            competencyId: competency.id,
            status: competency.status,
            formalClosureState: formalClosure.state,
          },
          after: {
            competencyId: competency.id,
            status: "fechada",
            closedAt: closedAt.toISOString(),
            closedBy: user.name,
            closureJustification: normalizedInput.justification,
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
          closedAt: closedAt.toISOString(),
          closedBy: user.name,
        },
      } satisfies CloseCompetencyReconciliationCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message:
        "Não foi possível registrar o fechamento formal da competência neste momento.",
    };
  }
}
