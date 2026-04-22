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
import { canExecuteReleaseRequestEffectively } from "@/features/releases/policy";
import { getReleaseDocumentPlan } from "@/features/releases/rules";
import { summarizeReleaseRequestWorkflow } from "@/features/releases/workflow";
import type {
  ExecuteReleaseRequestEffectivelyCommandResult,
  ExecuteReleaseRequestEffectivelyInput,
} from "@/features/releases/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";

type ExecutableReleaseRequestRecord = {
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
      id: string;
      approvedPendingExecution: { toNumber(): number };
      unexplainedDifference: { toNumber(): number };
      differenceType: "explicada" | "nao_explicada";
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
    bankEntryId: string;
    executedAmount: { toNumber(): number };
    executedAt: Date;
    bankEntry: {
      description: string;
    } | null;
  }>;
};

function isAdministrativeApprovalDecision(
  decision: ExecutableReleaseRequestRecord["approvals"][number]["decision"],
): decision is AdministrativeApprovalDecision {
  return (
    decision === "aprovar" ||
    decision === "aprovar_parcial" ||
    decision === "rejeitar"
  );
}

function getLatestWorkflowApproval(
  approvals: ExecutableReleaseRequestRecord["approvals"],
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

function getFinancialExecutions(
  executions: ExecutableReleaseRequestRecord["releaseExecutions"],
) {
  return executions.map((execution) => ({
    bankEntryId: execution.bankEntryId,
    bankEntryDescription: execution.bankEntry?.description,
    executedAmount: execution.executedAmount.toNumber(),
    executedAt: execution.executedAt.toISOString(),
  }));
}

function validateFinancialExecutionInput(
  input: ExecuteReleaseRequestEffectivelyInput,
) {
  const fieldErrors: {
    requestId?: string;
    bankEntryId?: string;
  } = {};

  if (!input.requestId) {
    fieldErrors.requestId = "Informe a solicitação a ser executada.";
  }

  if (!input.bankEntryId) {
    fieldErrors.bankEntryId = "Selecione o lançamento bancário da execução.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export interface ExecuteReleaseRequestEffectivelyDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
  } | null;
  canExecuteReleaseRequestEffectively(user: AppUser, contractCode: string): boolean;
}

const defaultDependencies: ExecuteReleaseRequestEffectivelyDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient,
  canExecuteReleaseRequestEffectively,
};

export async function executeReleaseRequestEffectively(
  input: ExecuteReleaseRequestEffectivelyInput,
): Promise<ExecuteReleaseRequestEffectivelyCommandResult> {
  return executeReleaseRequestEffectivelyWithDependencies(
    input,
    defaultDependencies,
  );
}

export async function executeReleaseRequestEffectivelyWithDependencies(
  input: ExecuteReleaseRequestEffectivelyInput,
  dependencies: ExecuteReleaseRequestEffectivelyDependencies,
): Promise<ExecuteReleaseRequestEffectivelyCommandResult> {
  const normalizedInput: ExecuteReleaseRequestEffectivelyInput = {
    requestId: input.requestId.trim(),
    bankEntryId: input.bankEntryId.trim(),
    notes: input.notes.trim(),
  };

  const validation = validateFinancialExecutionInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message:
        "Verifique os campos obrigatórios do registro de execução financeira efetiva.",
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
        "O registro da execução efetiva exige DATABASE_URL configurada. No modo em memória, a fila permanece somente leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexão com o banco não está disponível para registrar a execução efetiva.",
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
                  id: true,
                  approvedPendingExecution: true,
                  unexplainedDifference: true,
                  differenceType: true,
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
            orderBy: {
              executedAt: "desc",
            },
            select: {
              bankEntryId: true,
              executedAmount: true,
              executedAt: true,
              bankEntry: {
                select: {
                  description: true,
                },
              },
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
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
      }

      if (
        !dependencies.canExecuteReleaseRequestEffectively(
          user,
          request.contract.code,
        )
      ) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil não possui permissão para registrar a execução financeira efetiva neste contrato.",
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
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
      const financialExecutions = getFinancialExecutions(
        request.releaseExecutions,
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
        financialExecutions,
      });

      if (!workflow.financialExecution.canExecute) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            workflow.financialExecution.reason ??
            "A solicitação ainda não está pronta para execução financeira efetiva.",
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
      }

      const bankEntry = await tx.bankEntry.findUnique({
        where: { id: normalizedInput.bankEntryId },
        select: {
          id: true,
          contractId: true,
          type: true,
          description: true,
          amount: true,
          occurredOn: true,
          releaseExecutions: {
            select: {
              id: true,
            },
            take: 1,
          },
        },
      });

      if (!bankEntry) {
        return {
          ok: false,
          code: "not_found",
          message: "Lançamento bancário não encontrado.",
          fieldErrors: {
            bankEntryId: "Selecione um lançamento bancário válido.",
          },
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
      }

      if (bankEntry.contractId !== request.contractId) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "O lançamento bancário informado não pertence ao mesmo contrato da solicitação.",
          fieldErrors: {
            bankEntryId: "Escolha um lançamento do mesmo contrato.",
          },
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
      }

      if (bankEntry.type !== "liberacao" || bankEntry.amount.toNumber() >= 0) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "A execução efetiva exige lançamento bancário real do tipo liberação com saída financeira.",
          fieldErrors: {
            bankEntryId: "Escolha um lançamento bancário de liberação compatível.",
          },
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
      }

      if (bankEntry.releaseExecutions.length > 0) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "O lançamento bancário selecionado já está vinculado a uma execução financeira.",
          fieldErrors: {
            bankEntryId: "Escolha um lançamento ainda não vinculado.",
          },
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
      }

      const executedAmount = Math.abs(bankEntry.amount.toNumber());

      if (executedAmount > workflow.financialExecution.pendingAmount) {
        return {
          ok: false,
          code: "invalid_state",
          message:
            "O valor do lançamento bancário não corresponde ao valor pendente de execução desta solicitação.",
          fieldErrors: {
            bankEntryId:
              "Escolha um lançamento cujo valor corresponda ao valor pendente da solicitação.",
          },
        } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
      }

      const accumulatedExecutedAmount =
        workflow.financialExecution.executedAmount + executedAmount;
      const remainingPendingAmount = Math.max(
        workflow.financialExecution.pendingAmount - executedAmount,
        0,
      );
      const nextFinancialExecutionState =
        remainingPendingAmount === 0 ? "executada" : "execucao_parcial";

      await tx.releaseExecution.create({
        data: {
          releaseRequestId: request.id,
          bankEntryId: bankEntry.id,
          executedAmount,
          executedAt: bankEntry.occurredOn,
        },
      });

      await tx.releaseRequest.update({
        where: { id: request.id },
        data: {
          status: remainingPendingAmount === 0 ? "liberada" : request.status,
        },
      });

      if (reconciliation) {
        await tx.bankReconciliation.update({
          where: { id: reconciliation.id },
          data: {
            approvedPendingExecution: Math.max(
              reconciliation.approvedPendingExecution.toNumber() - executedAmount,
              0,
            ),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          contractId: request.contractId,
          userId: user.id,
          actorName: user.name,
          action: "Registra execucao financeira efetiva de solicitacao de liberacao",
          entity: "release_request",
          before: {
            releaseRequestId: request.id,
            financialExecutionState: workflow.financialExecution.state,
            pendingAmount: workflow.financialExecution.pendingAmount,
            bankEntryId: null,
          },
          after: {
            releaseRequestId: request.id,
            financialExecutionState: nextFinancialExecutionState,
            executedAmount,
            accumulatedExecutedAmount,
            remainingPendingAmount,
            executedAt: bankEntry.occurredOn.toISOString(),
            bankEntryId: bankEntry.id,
            bankEntryDescription: bankEntry.description,
          },
          details:
            normalizedInput.notes ||
            `Execução efetiva registrada para a solicitação ${request.id} com o lançamento bancário ${bankEntry.id}.`,
        },
      });

      return {
        ok: true,
        data: {
          releaseRequestId: request.id,
          contractId: request.contractId,
          bankEntryId: bankEntry.id,
          executedAmount,
          executedAt: bankEntry.occurredOn.toISOString().slice(0, 10),
        },
      } satisfies ExecuteReleaseRequestEffectivelyCommandResult;
    });
  } catch {
    return {
      ok: false,
      code: "unexpected_error",
      message:
        "Não foi possível registrar a execução financeira efetiva neste momento.",
    };
  }
}
