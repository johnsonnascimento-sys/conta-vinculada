import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/queries";
import type {
  AppUser,
  ReleaseRequestItem,
  ReleaseRequestStatus,
} from "@/features/platform/types";
import {
  canReviewReleaseRequest,
  canReviewReleaseRequestItem,
  isReviewableReleaseRequestStatus,
} from "@/features/releases/policy";
import type {
  ReviewReleaseRequestCommandResult,
  ReviewReleaseRequestInput,
} from "@/features/releases/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";
import { validateReviewReleaseRequestInput } from "@/server/commands/releases/review-release-request.validation";

type PersistedApprovalDecision =
  | "aprovar"
  | "aprovar_parcial"
  | "rejeitar";

type ReviewableItemRecord = {
  id: string;
  releaseRubric: string;
  competencyRef: string;
  requestedAmount: { toNumber(): number };
  approvedAmount: { toNumber(): number };
  decision: ReleaseRequestItem["decision"];
};

function mapItemDecision(decision: ReviewReleaseRequestInput["decision"]) {
  if (decision === "aprovar") {
    return "aprovado" satisfies ReleaseRequestItem["decision"];
  }

  if (decision === "aprovar_parcial") {
    return "aprovado_parcial" satisfies ReleaseRequestItem["decision"];
  }

  return "glosado" satisfies ReleaseRequestItem["decision"];
}

function mapApprovalDecision(decision: ReviewReleaseRequestInput["decision"]) {
  if (decision === "aprovar") {
    return "aprovar" satisfies PersistedApprovalDecision;
  }

  if (decision === "aprovar_parcial") {
    return "aprovar_parcial" satisfies PersistedApprovalDecision;
  }

  return "rejeitar" satisfies PersistedApprovalDecision;
}

function resolveRequestStatus(
  decisions: ReleaseRequestItem["decision"][],
): Extract<
  ReleaseRequestStatus,
  "em_analise" | "aprovada" | "aprovada_parcial" | "rejeitada"
> {
  if (decisions.some((decision) => decision === "pendente")) {
    return "em_analise";
  }

  if (decisions.every((decision) => decision === "aprovado")) {
    return "aprovada";
  }

  if (decisions.every((decision) => decision === "glosado")) {
    return "rejeitada";
  }

  return "aprovada_parcial";
}

function validateDecisionAmount(
  input: ReviewReleaseRequestInput,
  requestedAmount: number,
) {
  if (input.decision === "aprovar" && input.approvedAmount !== requestedAmount) {
    return {
      valid: false,
      fieldErrors: {
        approvedAmount:
          "Na aprovação total, o valor aprovado deve ser igual ao valor solicitado.",
      },
    };
  }

  if (
    input.decision === "aprovar_parcial" &&
    (input.approvedAmount <= 0 || input.approvedAmount >= requestedAmount)
  ) {
    return {
      valid: false,
      fieldErrors: {
        approvedAmount:
          "Na aprovação parcial, o valor aprovado deve ser maior que zero e menor que o solicitado.",
      },
    };
  }

  if (input.decision === "rejeitar" && input.approvedAmount !== 0) {
    return {
      valid: false,
      fieldErrors: {
        approvedAmount:
          "Na rejeição ou glosa, o valor aprovado deve ser igual a zero.",
      },
    };
  }

  return {
    valid: true,
    fieldErrors: {},
  };
}

export async function reviewReleaseRequest(
  input: ReviewReleaseRequestInput,
): Promise<ReviewReleaseRequestCommandResult> {
  return reviewReleaseRequestWithDependencies(input, defaultDependencies);
}

export interface ReviewReleaseRequestDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
  } | null;
  canReviewReleaseRequest(user: AppUser, contractCode: string): boolean;
}

const defaultDependencies: ReviewReleaseRequestDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient,
  canReviewReleaseRequest,
};

export async function reviewReleaseRequestWithDependencies(
  input: ReviewReleaseRequestInput,
  dependencies: ReviewReleaseRequestDependencies,
): Promise<ReviewReleaseRequestCommandResult> {
  const normalizedInput: ReviewReleaseRequestInput = {
    requestId: input.requestId.trim(),
    itemId: input.itemId.trim(),
    decision: input.decision,
    approvedAmount: input.approvedAmount,
    notes: input.notes.trim(),
  };

  const validation = validateReviewReleaseRequestInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message: "Verifique os campos obrigatórios da análise da solicitação.",
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
        "A análise de solicitações exige DATABASE_URL configurada. No modo em memória, a fila permanece somente leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message: "A conexão com o banco não está disponível para gravar a decisão.",
    };
  }

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const request = await tx.releaseRequest.findUnique({
        where: { id: normalizedInput.requestId },
        select: {
          id: true,
          contractId: true,
          status: true,
          analystName: true,
          contract: {
            select: {
              code: true,
            },
          },
          items: {
            select: {
              id: true,
              releaseRubric: true,
              competencyRef: true,
              requestedAmount: true,
              approvedAmount: true,
              decision: true,
            },
          },
        },
      });

      if (!request) {
        return {
          ok: false,
          code: "not_found",
          message: "Solicitação de liberação não encontrada.",
          fieldErrors: { requestId: "Solicitação inválida." },
        } satisfies ReviewReleaseRequestCommandResult;
      }

      if (!dependencies.canReviewReleaseRequest(user, request.contract.code)) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil não possui permissão para analisar solicitações neste contrato.",
        } satisfies ReviewReleaseRequestCommandResult;
      }

      if (!isReviewableReleaseRequestStatus(request.status)) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "Esta solicitação não pode mais receber decisão nesta etapa do fluxo.",
        } satisfies ReviewReleaseRequestCommandResult;
      }

      const item = request.items.find(
        (candidate: ReviewableItemRecord) => candidate.id === normalizedInput.itemId,
      );

      if (!item) {
        return {
          ok: false,
          code: "not_found",
          message: "Item da solicitação não encontrado.",
          fieldErrors: { itemId: "Item inválido para a solicitação informada." },
        } satisfies ReviewReleaseRequestCommandResult;
      }

      const amountValidation = validateDecisionAmount(
        normalizedInput,
        item.requestedAmount.toNumber(),
      );

      if (!amountValidation.valid) {
        return {
          ok: false,
          code: "validation_error",
          message: "Verifique o valor aprovado informado para a decisão.",
          fieldErrors: amountValidation.fieldErrors,
        } satisfies ReviewReleaseRequestCommandResult;
      }

      if (!canReviewReleaseRequestItem(request.status, item.decision)) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "Este item ja recebeu decisao e nao pode ser analisado novamente nesta etapa.",
          fieldErrors: {
            itemId: "Item ja analisado nesta solicitacao.",
          },
        } satisfies ReviewReleaseRequestCommandResult;
      }

      const nextItemDecision = mapItemDecision(normalizedInput.decision);
      const nextApprovalDecision = mapApprovalDecision(normalizedInput.decision);

      const updatedItem = await tx.releaseRequestItem.update({
        where: { id: item.id },
        data: {
          decision: nextItemDecision,
          approvedAmount: normalizedInput.approvedAmount,
        },
        select: {
          id: true,
          approvedAmount: true,
          updatedAt: true,
        },
      });

      const nextRequestStatus = resolveRequestStatus(
        request.items.map((candidate: ReviewableItemRecord) =>
          candidate.id === item.id ? nextItemDecision : candidate.decision,
        ),
      );

      const updatedRequest = await tx.releaseRequest.update({
        where: { id: request.id },
        data: {
          status: nextRequestStatus,
          analystName: user.name,
          approvals: {
            create: {
              stage: "analise_documental",
              decision: nextApprovalDecision,
              decidedBy: user.name,
              notes: normalizedInput.notes || null,
            },
          },
        },
        select: {
          id: true,
          analystName: true,
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: request.contractId,
          userId: user.id,
          actorName: user.name,
          action: "Analisa item de solicitacao de liberacao",
          entity: "release_request_item",
          before: {
            releaseRequestId: request.id,
            releaseRequestItemId: item.id,
            status: request.status,
            decision: item.decision,
            approvedAmount: item.approvedAmount.toNumber(),
          },
          after: {
            releaseRequestId: request.id,
            releaseRequestItemId: item.id,
            status: nextRequestStatus,
            decision: nextItemDecision,
            approvedAmount: updatedItem.approvedAmount.toNumber(),
            notes: normalizedInput.notes || null,
          },
          details:
            normalizedInput.notes ||
            `Decisão ${normalizedInput.decision} registrada para ${item.releaseRubric} na competência ${item.competencyRef}.`,
        },
      });

      return {
        ok: true,
        data: {
          releaseRequestId: updatedRequest.id,
          releaseRequestItemId: updatedItem.id,
          contractId: request.contractId,
          requestStatus: nextRequestStatus,
          itemDecision: nextItemDecision,
          approvedAmount: updatedItem.approvedAmount.toNumber(),
          analystName: updatedRequest.analystName ?? user.name,
          decidedAt: updatedItem.updatedAt.toISOString(),
        },
      } satisfies ReviewReleaseRequestCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message:
        "Não foi possível registrar a decisão da solicitação de liberação neste momento.",
    };
  }
}
