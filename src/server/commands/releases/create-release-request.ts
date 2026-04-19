import "server-only";

import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/queries";
import { canInitiateReleaseRequest } from "@/features/releases/policy";
import type {
  CreateReleaseRequestCommandResult,
  CreateReleaseRequestInput,
} from "@/features/releases/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";
import { validateCreateReleaseRequestInput } from "@/server/commands/releases/create-release-request.validation";

function buildReleaseRequestProtocol(now = new Date()) {
  const year = now.getUTCFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `RR-${year}-${suffix}`;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function generateUniqueProtocol(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const protocol = buildReleaseRequestProtocol();
    const existing = await tx.releaseRequest.findUnique({
      where: { protocol },
      select: { id: true },
    });

    if (!existing) {
      return protocol;
    }
  }

  throw new Error("protocol_generation_failed");
}
export async function createReleaseRequest(
  input: CreateReleaseRequestInput,
): Promise<CreateReleaseRequestCommandResult> {
  const normalizedInput: CreateReleaseRequestInput = {
    contractId: input.contractId.trim(),
    employeeId: input.employeeId.trim(),
    competency: input.competency.trim(),
    rubric: input.rubric.trim(),
    requestedAmount: input.requestedAmount,
  };

  const validation = validateCreateReleaseRequestInput(normalizedInput);

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
        where: { id: normalizedInput.contractId },
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

      if (!canInitiateReleaseRequest(user, contract.code)) {
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
          employeeId: normalizedInput.employeeId,
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
          competency: normalizedInput.competency,
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

      const protocol = await generateUniqueProtocol(tx);
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
                employeeId: normalizedInput.employeeId,
                rubric: normalizedInput.rubric,
                competencyRef: normalizedInput.competency,
                requestedAmount: normalizedInput.requestedAmount,
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
            employeeId: normalizedInput.employeeId,
            competency: normalizedInput.competency,
            rubric: normalizedInput.rubric,
            requestedAmount: normalizedInput.requestedAmount,
          },
          details: `Solicitacao iniciada em elaboracao para ${normalizedInput.rubric} na competencia ${normalizedInput.competency}.`,
        },
      });

      return {
        ok: true,
        data: {
          releaseRequestId: request.id,
          protocol,
          status: "em_elaboracao",
          contractId: contract.id,
          employeeId: normalizedInput.employeeId,
          competency: normalizedInput.competency,
          rubric: normalizedInput.rubric,
          requestedAmount: normalizedInput.requestedAmount,
          createdAt: request.createdAt.toISOString(),
        },
      } satisfies CreateReleaseRequestCommandResult;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        code: "unexpected_error",
        message:
          "Nao foi possivel reservar um protocolo unico para a solicitacao. Tente novamente.",
      };
    }

    return {
      ok: false,
      code: "unexpected_error",
      message: "Nao foi possivel criar a solicitacao de liberacao neste momento.",
    };
  }
}
