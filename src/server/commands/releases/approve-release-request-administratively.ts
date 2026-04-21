import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/queries";
import type {
  AdministrativeApprovalDecision,
  AppUser,
  ContractNormativeRegime,
  ReleaseItemDecision,
  ReleaseMovementMode,
  ReleaseRequestStatus,
} from "@/features/platform/types";
import { canApproveReleaseRequestAdministratively } from "@/features/releases/policy";
import { getReleaseDocumentPlan } from "@/features/releases/rules";
import {
  getAllowedAdministrativeApprovalDecisions,
  summarizeReleaseRequestWorkflow,
} from "@/features/releases/workflow";
import type {
  AdministrativeApproveReleaseRequestCommandResult,
  AdministrativeApproveReleaseRequestInput,
} from "@/features/releases/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";

type AdministrativeApprovalRequestRecord = {
  id: string;
  contractId: string;
  status: ReleaseRequestStatus;
  releaseType: "ferias" | "decimo_terceiro" | "rescisao";
  movementMode: ReleaseMovementMode;
  approverName: string | null;
  contract: {
    code: string;
    normativeRegime: ContractNormativeRegime;
  };
  items: Array<{
    decision: ReleaseItemDecision;
  }>;
  documents: Array<{
    kind:
      | "comprovante_pagamento"
      | "comprovante_operacao_bancaria"
      | "folha"
      | "ferias"
      | "rescisao"
      | "fgts"
      | "extrato"
      | "parecer"
      | "despacho"
      | "importacao"
      | "encerramento_contratual"
      | "sucessao_contratual"
      | "termo_cooperacao"
      | "garantia_rescisoria";
  }>;
  approvals: Array<{
    stage: "triagem" | "analise_documental" | "aprovacao_administrativa" | "execucao_financeira" | "conciliacao";
    decision: "aprovar" | "aprovar_parcial" | "rejeitar" | "devolver";
    decidedBy: string;
    notes: string | null;
    createdAt: Date;
  }>;
};

function isAdministrativeApprovalDecision(
  decision: AdministrativeApprovalRequestRecord["approvals"][number]["decision"],
): decision is AdministrativeApprovalDecision {
  return (
    decision === "aprovar" ||
    decision === "aprovar_parcial" ||
    decision === "rejeitar"
  );
}

function validateAdministrativeApprovalInput(
  input: AdministrativeApproveReleaseRequestInput,
) {
  const fieldErrors: {
    requestId?: string;
    decision?: string;
    notes?: string;
  } = {};

  if (!input.requestId) {
    fieldErrors.requestId = "Informe a solicitação a ser consolidada.";
  }

  if (!["aprovar", "aprovar_parcial", "rejeitar"].includes(input.decision)) {
    fieldErrors.decision = "Informe uma decisão administrativa válida.";
  }

  if (
    (input.decision === "aprovar_parcial" || input.decision === "rejeitar") &&
    !input.notes
  ) {
    fieldErrors.notes =
      "Informe a justificativa da consolidação administrativa.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

function getLatestAdministrativeApproval(
  approvals: AdministrativeApprovalRequestRecord["approvals"],
): {
  decision: AdministrativeApprovalDecision;
  decidedBy: string;
  notes: string | null;
  createdAt: Date;
} | undefined {
  const latestApproval = approvals.find(
    (item) =>
      item.stage === "aprovacao_administrativa" &&
      isAdministrativeApprovalDecision(item.decision),
  );

  if (!latestApproval) {
    return undefined;
  }

  return {
    decision: latestApproval.decision as AdministrativeApprovalDecision,
    decidedBy: latestApproval.decidedBy,
    notes: latestApproval.notes,
    createdAt: latestApproval.createdAt,
  };
}

export interface ApproveReleaseRequestAdministrativelyDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
  } | null;
  canApproveReleaseRequestAdministratively(
    user: AppUser,
    contractCode: string,
  ): boolean;
}

const defaultDependencies: ApproveReleaseRequestAdministrativelyDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient,
  canApproveReleaseRequestAdministratively,
};

export async function approveReleaseRequestAdministratively(
  input: AdministrativeApproveReleaseRequestInput,
): Promise<AdministrativeApproveReleaseRequestCommandResult> {
  return approveReleaseRequestAdministrativelyWithDependencies(
    input,
    defaultDependencies,
  );
}

export async function approveReleaseRequestAdministrativelyWithDependencies(
  input: AdministrativeApproveReleaseRequestInput,
  dependencies: ApproveReleaseRequestAdministrativelyDependencies,
): Promise<AdministrativeApproveReleaseRequestCommandResult> {
  const normalizedInput: AdministrativeApproveReleaseRequestInput = {
    requestId: input.requestId.trim(),
    decision: input.decision,
    notes: input.notes.trim(),
  };

  const validation = validateAdministrativeApprovalInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message:
        "Verifique os campos obrigatórios da aprovação administrativa da solicitação.",
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
        "A aprovação administrativa exige DATABASE_URL configurada. No modo em memória, a fila permanece somente leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexão com o banco não está disponível para gravar a aprovação administrativa.",
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
          releaseType: true,
          movementMode: true,
          approverName: true,
          contract: {
            select: {
              code: true,
              normativeRegime: true,
            },
          },
          items: {
            select: {
              decision: true,
            },
          },
          documents: {
            select: {
              kind: true,
            },
          },
          approvals: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              stage: true,
              decision: true,
              decidedBy: true,
              notes: true,
              createdAt: true,
            },
          },
        },
      });

      if (!request) {
        return {
          ok: false,
          code: "not_found",
          message: "Solicitação de liberação não encontrada.",
          fieldErrors: {
            requestId: "Solicitação inválida.",
          },
        } satisfies AdministrativeApproveReleaseRequestCommandResult;
      }

      if (
        !dependencies.canApproveReleaseRequestAdministratively(
          user,
          request.contract.code,
        )
      ) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil não possui permissão para consolidar a aprovação administrativa neste contrato.",
        } satisfies AdministrativeApproveReleaseRequestCommandResult;
      }

      const documentPlan = getReleaseDocumentPlan(
        request.releaseType,
        request.movementMode,
        request.status,
        request.documents.map((item) => item.kind),
      );
      const latestAdministrativeApproval = getLatestAdministrativeApproval(
        request.approvals,
      );
      const workflow = summarizeReleaseRequestWorkflow({
        status: request.status,
        missingDocumentCount: documentPlan.missingCurrentStage.length,
        itemDecisions: request.items.map((item) => item.decision),
        movementMode: request.movementMode,
        normativeRegime: request.contract.normativeRegime,
        latestAdministrativeApproval: latestAdministrativeApproval
          ? {
              decision: latestAdministrativeApproval.decision,
              decidedBy: latestAdministrativeApproval.decidedBy,
              decidedAt: latestAdministrativeApproval.createdAt.toISOString(),
              notes: latestAdministrativeApproval.notes ?? undefined,
            }
          : undefined,
      });

      if (!workflow.administrativeApproval.canApprove) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            workflow.administrativeApproval.reason ??
            "A solicitação ainda não está apta para aprovação administrativa.",
        } satisfies AdministrativeApproveReleaseRequestCommandResult;
      }

      const allowedDecisions = getAllowedAdministrativeApprovalDecisions(
        workflow.decisionState,
      );

      if (!allowedDecisions.includes(normalizedInput.decision)) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "A decisão administrativa informada não é compatível com a consolidação atual dos itens.",
          fieldErrors: {
            decision:
              "Escolha uma decisão compatível com o resultado consolidado da análise dos itens.",
          },
        } satisfies AdministrativeApproveReleaseRequestCommandResult;
      }

      const createdApproval = await tx.approval.create({
        data: {
          releaseRequestId: request.id,
          stage: "aprovacao_administrativa",
          decision: normalizedInput.decision,
          decidedBy: user.name,
          notes: normalizedInput.notes || null,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      await tx.releaseRequest.update({
        where: { id: request.id },
        data: {
          approverName: user.name,
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: request.contractId,
          userId: user.id,
          actorName: user.name,
          action: "Consolida aprovacao administrativa de solicitacao de liberacao",
          entity: "release_request",
          before: {
            releaseRequestId: request.id,
            approverName: request.approverName,
            administrativeApprovalState: workflow.administrativeApproval.state,
          },
          after: {
            releaseRequestId: request.id,
            approverName: user.name,
            decision: normalizedInput.decision,
            stage: "aprovacao_administrativa",
            notes: normalizedInput.notes || null,
          },
          details:
            normalizedInput.notes ||
            `Decisão administrativa ${normalizedInput.decision} registrada para a solicitação ${request.id}.`,
        },
      });

      return {
        ok: true,
        data: {
          releaseRequestId: request.id,
          contractId: request.contractId,
          decision: normalizedInput.decision,
          approverName: user.name,
          decidedAt: createdApproval.createdAt.toISOString(),
        },
      } satisfies AdministrativeApproveReleaseRequestCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message:
        "Não foi possível registrar a aprovação administrativa da solicitação neste momento.",
    };
  }
}
