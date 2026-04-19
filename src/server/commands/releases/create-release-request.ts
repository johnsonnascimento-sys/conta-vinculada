import "server-only";

import type { Prisma } from "@prisma/client";
import type { AppUser } from "@/features/platform/types";
import { canAccessRoute } from "@/features/auth/permissions";
import { getCurrentUser } from "@/features/auth/queries";
import type {
  CreateReleaseRequestCommandResult,
  CreateReleaseRequestInput,
} from "@/features/releases/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";
import { validateCreateReleaseRequestInput } from "@/server/commands/releases/create-release-request.validation";

function buildReleaseRequestProtocol(now = new Date()) {
  const year = now.getUTCFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RR-${year}-${suffix}`;
}

function canCreateReleaseRequestForContract(user: AppUser, contractCode: string) {
  if (!canAccessRoute(user.role, "/dashboard/releases")) {
    return false;
  }

  return user.role !== "Analista" || user.scope === contractCode;
}

export async function createReleaseRequest(
  input: CreateReleaseRequestInput,
): Promise<CreateReleaseRequestCommandResult> {
  const validation = validateCreateReleaseRequestInput(input);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message: "Verifique os campos obrigatorios da solicitacao.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Sua sessao expirou. Entre novamente para continuar.",
    };
  }

  if (!isDatabaseEnabled()) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A criacao de solicitacoes exige DATABASE_URL configurada. O modo em memoria segue disponivel apenas para leitura.",
    };
  }

  const prisma = getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexao com o banco nao esta disponivel para gravar a solicitacao.",
    };
  }

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const contract = await tx.contract.findUnique({
        where: { id: input.contractId },
        select: { id: true, code: true, companyId: true },
      });

      if (!contract) {
        return {
          ok: false,
          code: "not_found",
          message: "Contrato nao encontrado.",
          fieldErrors: { contractId: "Contrato invalido." },
        } satisfies CreateReleaseRequestCommandResult;
      }

      if (!canCreateReleaseRequestForContract(user, contract.code)) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil nao possui permissao para iniciar solicitacao neste contrato.",
        } satisfies CreateReleaseRequestCommandResult;
      }

      const allocation = await tx.employeeAllocation.findFirst({
        where: {
          contractId: contract.id,
          employeeId: input.employeeId,
        },
        select: { id: true },
      });

      if (!allocation) {
        return {
          ok: false,
          code: "validation_error",
          message: "O empregado selecionado nao esta alocado ao contrato informado.",
          fieldErrors: {
            employeeId: "Empregado nao encontrado na alocacao deste contrato.",
          },
        } satisfies CreateReleaseRequestCommandResult;
      }

      const competency = await tx.competency.findFirst({
        where: {
          contractId: contract.id,
          competency: input.competency,
        },
        select: { id: true },
      });

      if (!competency) {
        return {
          ok: false,
          code: "validation_error",
          message: "A competencia informada nao existe para o contrato selecionado.",
          fieldErrors: {
            competency: "Competencia invalida para este contrato.",
          },
        } satisfies CreateReleaseRequestCommandResult;
      }

      const protocol = buildReleaseRequestProtocol();
      const createdAt = new Date();
      const request = await tx.releaseRequest.create({
        data: {
          contractId: contract.id,
          companyId: contract.companyId,
          protocol,
          status: "em_elaboracao",
          requestedByName: user.name,
          items: {
            create: [
              {
                employeeId: input.employeeId,
                rubric: input.rubric.trim(),
                competencyRef: input.competency.trim(),
                requestedAmount: input.requestedAmount,
                approvedAmount: 0,
                decision: "pendente",
              },
            ],
          },
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: contract.id,
          userId: user.id,
          actorName: user.name,
          action: "Cria solicitacao de liberacao",
          entity: "release_request",
          after: {
            releaseRequestId: request.id,
            protocol,
            status: request.status,
            employeeId: input.employeeId,
            competency: input.competency.trim(),
            rubric: input.rubric.trim(),
            requestedAmount: input.requestedAmount,
          },
          details: `Solicitacao iniciada em elaboracao para ${input.rubric.trim()} na competencia ${input.competency.trim()}.`,
        },
      });

      return {
        ok: true,
        data: {
          releaseRequestId: request.id,
          protocol,
          status: "em_elaboracao",
          contractId: contract.id,
          employeeId: input.employeeId,
          competency: input.competency.trim(),
          rubric: input.rubric.trim(),
          requestedAmount: input.requestedAmount,
          createdAt: createdAt.toISOString(),
        },
      } satisfies CreateReleaseRequestCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message: "Nao foi possivel criar a solicitacao de liberacao neste momento.",
    };
  }
}
