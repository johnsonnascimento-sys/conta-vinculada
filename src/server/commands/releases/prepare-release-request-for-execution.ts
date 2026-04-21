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
import { canPrepareReleaseRequestForExecution } from "@/features/releases/policy";
import { getReleaseDocumentPlan } from "@/features/releases/rules";
import { summarizeReleaseRequestWorkflow } from "@/features/releases/workflow";
import type {
  PrepareReleaseRequestForExecutionCommandResult,
  PrepareReleaseRequestForExecutionInput,
} from "@/features/releases/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";

type FinancialPreparationRequestRecord = {
  id: string;
  contractId: string;
  status: ReleaseRequestStatus;
  releaseType: "ferias" | "decimo_terceiro" | "rescisao";
  movementMode: ReleaseMovementMode;
  competencyEnd: string;
  contract: {
    code: string;
    normativeRegime: ContractNormativeRegime;
    linkedAccounts: Array<{
      isOfficialPublicBank: boolean;
      cooperationTermRef: string | null;
      currentBalance: { toNumber(): number };
    }>;
    reconciliations: Array<{
      approvedPendingExecution: { toNumber(): number };
      unexplainedDifference: { toNumber(): number };
      competency: {
        competency: string;
      };
    }>;
  };
  items: Array<{
    decision: ReleaseItemDecision;
    approvedAmount: { toNumber(): number };
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
    stage:
      | "triagem"
      | "analise_documental"
      | "aprovacao_administrativa"
      | "execucao_financeira"
      | "conciliacao";
    decision: "aprovar" | "aprovar_parcial" | "rejeitar" | "devolver";
    decidedBy: string;
    notes: string | null;
    createdAt: Date;
  }>;
  releaseExecutions: Array<{
    id: string;
  }>;
};

function isAdministrativeApprovalDecision(
  decision: FinancialPreparationRequestRecord["approvals"][number]["decision"],
): decision is AdministrativeApprovalDecision {
  return (
    decision === "aprovar" ||
    decision === "aprovar_parcial" ||
    decision === "rejeitar"
  );
}

function getLatestWorkflowApproval(
  approvals: FinancialPreparationRequestRecord["approvals"],
  stage: "aprovacao_administrativa" | "execucao_financeira",
) {
  const latestApproval = approvals.find(
    (item) =>
      item.stage === stage && isAdministrativeApprovalDecision(item.decision),
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

function validateFinancialPreparationInput(
  input: PrepareReleaseRequestForExecutionInput,
) {
  const fieldErrors: {
    requestId?: string;
  } = {};

  if (!input.requestId) {
    fieldErrors.requestId = "Informe a solicitação a ser preparada.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export interface PrepareReleaseRequestForExecutionDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
  } | null;
  canPrepareReleaseRequestForExecution(user: AppUser): boolean;
}

const defaultDependencies: PrepareReleaseRequestForExecutionDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient,
  canPrepareReleaseRequestForExecution,
};

export async function prepareReleaseRequestForExecution(
  input: PrepareReleaseRequestForExecutionInput,
): Promise<PrepareReleaseRequestForExecutionCommandResult> {
  return prepareReleaseRequestForExecutionWithDependencies(
    input,
    defaultDependencies,
  );
}

export async function prepareReleaseRequestForExecutionWithDependencies(
  input: PrepareReleaseRequestForExecutionInput,
  dependencies: PrepareReleaseRequestForExecutionDependencies,
): Promise<PrepareReleaseRequestForExecutionCommandResult> {
  const normalizedInput: PrepareReleaseRequestForExecutionInput = {
    requestId: input.requestId.trim(),
    notes: input.notes.trim(),
  };

  const validation = validateFinancialPreparationInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message:
        "Verifique os campos obrigatórios do preparo da futura execução financeira.",
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
        "O registro do preparo financeiro exige DATABASE_URL configurada. No modo em memória, a fila permanece somente leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexão com o banco não está disponível para registrar o preparo financeiro.",
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
          competencyEnd: true,
          contract: {
            select: {
              code: true,
              normativeRegime: true,
              linkedAccounts: {
                select: {
                  isOfficialPublicBank: true,
                  cooperationTermRef: true,
                  currentBalance: true,
                },
                take: 1,
              },
              reconciliations: {
                select: {
                  approvedPendingExecution: true,
                  unexplainedDifference: true,
                  competency: {
                    select: {
                      competency: true,
                    },
                  },
                },
              },
            },
          },
          items: {
            select: {
              decision: true,
              approvedAmount: true,
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
          releaseExecutions: {
            select: {
              id: true,
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
        } satisfies PrepareReleaseRequestForExecutionCommandResult;
      }

      if (!dependencies.canPrepareReleaseRequestForExecution(user)) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil não possui permissão para registrar o preparo da futura execução neste contrato.",
        } satisfies PrepareReleaseRequestForExecutionCommandResult;
      }

      const documentPlan = getReleaseDocumentPlan(
        request.releaseType,
        request.movementMode,
        request.status,
        request.documents.map((item) => item.kind),
      );
      const latestAdministrativeApproval = getLatestWorkflowApproval(
        request.approvals,
        "aprovacao_administrativa",
      );
      const latestFinancialPreparationApproval = getLatestWorkflowApproval(
        request.approvals,
        "execucao_financeira",
      );
      const linkedAccount = request.contract.linkedAccounts[0];
      const reconciliation = request.contract.reconciliations.find(
        (item) => item.competency.competency === request.competencyEnd,
      );
      const approvedAmount = request.items.reduce(
        (total, item) => total + item.approvedAmount.toNumber(),
        0,
      );
      const workflow = summarizeReleaseRequestWorkflow({
        status: request.status,
        missingDocumentCount: documentPlan.missingCurrentStage.length,
        itemDecisions: request.items.map((item) => item.decision),
        movementMode: request.movementMode,
        normativeRegime: request.contract.normativeRegime,
        providedDocuments: documentPlan.provided,
        approvedAmount,
        currentBalance: linkedAccount?.currentBalance.toNumber(),
        approvedPendingExecution: reconciliation?.approvedPendingExecution.toNumber(),
        unexplainedDifference: reconciliation?.unexplainedDifference.toNumber(),
        linkedAccount: linkedAccount
          ? {
              isOfficialPublicBank: linkedAccount.isOfficialPublicBank,
              cooperationTermRef: linkedAccount.cooperationTermRef ?? undefined,
            }
          : undefined,
        latestAdministrativeApproval: latestAdministrativeApproval
          ? {
              decision: latestAdministrativeApproval.decision,
              decidedBy: latestAdministrativeApproval.decidedBy,
              decidedAt: latestAdministrativeApproval.createdAt.toISOString(),
              notes: latestAdministrativeApproval.notes ?? undefined,
            }
          : undefined,
        latestFinancialPreparationApproval: latestFinancialPreparationApproval
          ? {
              decision: latestFinancialPreparationApproval.decision,
              decidedBy: latestFinancialPreparationApproval.decidedBy,
              decidedAt: latestFinancialPreparationApproval.createdAt.toISOString(),
              notes: latestFinancialPreparationApproval.notes ?? undefined,
            }
          : undefined,
        hasEffectiveExecution: request.releaseExecutions.length > 0,
      });

      if (!workflow.financialPreparation.canPrepare) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            workflow.financialPreparation.reason ??
            "A solicitação ainda não está pronta para preparo da futura execução.",
        } satisfies PrepareReleaseRequestForExecutionCommandResult;
      }

      const createdPreparation = await tx.approval.create({
        data: {
          releaseRequestId: request.id,
          stage: "execucao_financeira",
          decision: "aprovar",
          decidedBy: user.name,
          notes: normalizedInput.notes || null,
        },
        select: {
          createdAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: request.contractId,
          userId: user.id,
          actorName: user.name,
          action: "Registra preparo interno para futura execucao financeira",
          entity: "release_request",
          before: {
            releaseRequestId: request.id,
            financialPreparationState: workflow.financialPreparation.state,
            effectiveExecutionRecorded:
              workflow.financialPreparation.effectiveExecutionRecorded,
          },
          after: {
            releaseRequestId: request.id,
            stage: "execucao_financeira",
            preparationState: "preparada",
            eligibleAmount: workflow.financialPreparation.eligibleAmount,
            expectedMovement: workflow.financialPreparation.expectedMovement,
            notes: normalizedInput.notes || null,
          },
          details:
            normalizedInput.notes ||
            `Preparo interno da futura execução registrado para a solicitação ${request.id}.`,
        },
      });

      return {
        ok: true,
        data: {
          releaseRequestId: request.id,
          contractId: request.contractId,
          preparedBy: user.name,
          preparedAt: createdPreparation.createdAt.toISOString(),
          eligibleAmount: workflow.financialPreparation.eligibleAmount,
        },
      } satisfies PrepareReleaseRequestForExecutionCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message:
        "Não foi possível registrar o preparo da futura execução financeira neste momento.",
    };
  }
}
