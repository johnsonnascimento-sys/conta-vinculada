import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/queries";
import type { AppUser, BankEntryType } from "@/features/platform/types";
import { canRegisterReconciliationItem } from "@/features/reconciliation/policy";
import type {
  RegisterReconciliationItemCommandResult,
  RegisterReconciliationItemInput,
} from "@/features/reconciliation/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";

function validateInput(input: RegisterReconciliationItemInput) {
  const fieldErrors: {
    reconciliationId?: string;
    bankEntryId?: string;
    justification?: string;
  } = {};

  if (!input.reconciliationId) {
    fieldErrors.reconciliationId = "Informe a conciliacao a ser detalhada.";
  }

  if (!input.bankEntryId) {
    fieldErrors.bankEntryId = "Selecione o lancamento bancario vinculado.";
  }

  if (!input.justification) {
    fieldErrors.justification =
      "Informe a justificativa minima da diferenca explicada.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

type ReconciliationRecord = {
  id: string;
  contractId: string;
  explainedDifference: { toNumber(): number };
  competency: {
    id: string;
    competency: string;
  };
  items: Array<{
    id: string;
    bankEntryId: string;
  }>;
};

type BankEntryRecord = {
  id: string;
  contractId: string;
  description: string;
  type: BankEntryType;
  occurredOn: Date;
  competency: {
    id: string;
    competency: string;
  } | null;
};

export interface RegisterReconciliationItemDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
  } | null;
  canRegisterReconciliationItem(user: AppUser): boolean;
}

const defaultDependencies: RegisterReconciliationItemDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient,
  canRegisterReconciliationItem,
};

export async function registerReconciliationItem(
  input: RegisterReconciliationItemInput,
): Promise<RegisterReconciliationItemCommandResult> {
  return registerReconciliationItemWithDependencies(input, defaultDependencies);
}

export async function registerReconciliationItemWithDependencies(
  input: RegisterReconciliationItemInput,
  dependencies: RegisterReconciliationItemDependencies,
): Promise<RegisterReconciliationItemCommandResult> {
  const normalizedInput = {
    reconciliationId: input.reconciliationId.trim(),
    bankEntryId: input.bankEntryId.trim(),
    justification: input.justification.trim(),
  };

  const validation = validateInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message:
        "Verifique os campos obrigatorios do item conciliatorio explicado.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const user = await dependencies.getCurrentUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Sua sessao expirou. Entre novamente para continuar.",
    };
  }

  if (!dependencies.isDatabaseEnabled()) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "O registro de item conciliatorio exige DATABASE_URL configurada. No modo em memoria, a conciliacao permanece somente leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexao com o banco nao esta disponivel para registrar o item conciliatorio.",
    };
  }

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reconciliation = (await tx.bankReconciliation.findUnique({
        where: { id: normalizedInput.reconciliationId },
        select: {
          id: true,
          contractId: true,
          explainedDifference: true,
          competency: {
            select: {
              id: true,
              competency: true,
            },
          },
          items: {
            select: {
              id: true,
              bankEntryId: true,
            },
          },
        },
      })) as ReconciliationRecord | null;

      if (!reconciliation) {
        return {
          ok: false,
          code: "not_found",
          message: "Conciliacao da competencia nao encontrada.",
          fieldErrors: {
            reconciliationId: "Conciliacao invalida.",
          },
        } satisfies RegisterReconciliationItemCommandResult;
      }

      if (!dependencies.canRegisterReconciliationItem(user)) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil nao possui permissao para registrar item conciliatorio.",
        } satisfies RegisterReconciliationItemCommandResult;
      }

      if (reconciliation.explainedDifference.toNumber() <= 0) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "A competencia ainda nao possui diferenca explicada a detalhar por item conciliatorio.",
        } satisfies RegisterReconciliationItemCommandResult;
      }

      if (
        reconciliation.items.some(
          (item) => item.bankEntryId === normalizedInput.bankEntryId,
        )
      ) {
        return {
          ok: false,
          code: "conflict",
          message:
            "O lancamento bancario selecionado ja esta vinculado a esta conciliacao.",
          fieldErrors: {
            bankEntryId: "Selecione outro lancamento bancario.",
          },
        } satisfies RegisterReconciliationItemCommandResult;
      }

      const bankEntry = (await tx.bankEntry.findUnique({
        where: { id: normalizedInput.bankEntryId },
        select: {
          id: true,
          contractId: true,
          description: true,
          type: true,
          occurredOn: true,
          competency: {
            select: {
              id: true,
              competency: true,
            },
          },
        },
      })) as BankEntryRecord | null;

      if (!bankEntry) {
        return {
          ok: false,
          code: "not_found",
          message: "Lancamento bancario nao encontrado.",
          fieldErrors: {
            bankEntryId: "Lancamento bancario invalido.",
          },
        } satisfies RegisterReconciliationItemCommandResult;
      }

      if (bankEntry.contractId !== reconciliation.contractId) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "O lancamento bancario selecionado pertence a outro contrato.",
          fieldErrors: {
            bankEntryId: "Selecione um lancamento do mesmo contrato.",
          },
        } satisfies RegisterReconciliationItemCommandResult;
      }

      if (
        bankEntry.competency &&
        bankEntry.competency.competency !== reconciliation.competency.competency
      ) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "O lancamento bancario selecionado pertence a outra competencia.",
          fieldErrors: {
            bankEntryId: "Selecione um lancamento da mesma competencia.",
          },
        } satisfies RegisterReconciliationItemCommandResult;
      }

      const itemId = randomUUID();
      await tx.bankReconciliationItem.create({
        data: {
          id: itemId,
          reconciliationId: reconciliation.id,
          bankEntryId: bankEntry.id,
          justification: normalizedInput.justification,
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: reconciliation.contractId,
          userId: user.id,
          actorName: user.name,
          action: "Registro de item conciliatorio explicado",
          entity: "bank_reconciliation_item",
          before: {
            reconciliationId: reconciliation.id,
            itemCount: reconciliation.items.length,
          },
          after: {
            reconciliationId: reconciliation.id,
            itemId,
            bankEntryId: bankEntry.id,
            competency: reconciliation.competency.competency,
          },
          details: normalizedInput.justification,
        },
      });

      return {
        ok: true,
        data: {
          itemId,
          reconciliationId: reconciliation.id,
          contractId: reconciliation.contractId,
          competency: reconciliation.competency.competency,
          bankEntryId: bankEntry.id,
        },
      } satisfies RegisterReconciliationItemCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message:
        "Nao foi possivel registrar o item conciliatorio neste momento.",
    };
  }
}
