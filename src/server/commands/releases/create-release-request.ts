import type { AppUser } from "@/features/platform/types";
import { getCurrentUser } from "@/features/auth/queries";
import { canInitiateReleaseRequest } from "@/features/releases/policy";
import type {
  CreateReleaseRequestCommandResult,
  CreateReleaseRequestInput,
} from "@/features/releases/types";
import { getPrismaClient, isDatabaseEnabled } from "@/server/db/prisma";
import {
  findDuplicateOpenReleaseRequest,
  validateCreateReleaseRequestInput,
} from "@/server/commands/releases/create-release-request.validation";

const OPEN_REQUEST_STATUSES = [
  "em_elaboracao",
  "enviada",
  "em_exigencia",
  "em_analise",
] as const;

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

function normalizeInput(input: CreateReleaseRequestInput): CreateReleaseRequestInput {
  return {
    contractId: input.contractId.trim(),
    releaseType: input.releaseType,
    movementMode: input.movementMode,
    factualBasis: input.factualBasis.trim(),
    competencyStart: input.competencyStart.trim(),
    competencyEnd: input.competencyEnd.trim(),
    requestedTotalAmount: input.requestedTotalAmount,
    notes: input.notes?.trim() || undefined,
    items: input.items.map((item) => ({
      employeeId: item.employeeId.trim(),
      releaseRubric: item.releaseRubric,
      competencyRef: item.competencyRef.trim(),
      employmentStartDate: item.employmentStartDate.trim(),
      allocationStartDate: item.allocationStartDate.trim(),
      allocationEndDate: item.allocationEndDate?.trim() || undefined,
      factOccurredOn: item.factOccurredOn.trim(),
      calculationMemory: item.calculationMemory
        ? {
            ...item.calculationMemory,
            notes: item.calculationMemory.notes?.trim(),
          }
        : undefined,
      requestedAmount: item.requestedAmount,
      notes: item.notes?.trim() || undefined,
    })),
  };
}

async function generateUniqueProtocol(tx: {
  releaseRequest: {
    findUnique(args: {
      where: { protocol: string };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
}) {
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

export interface CreateReleaseRequestDependencies {
  getCurrentUser(): Promise<AppUser | null>;
  isDatabaseEnabled(): boolean;
  getPrismaClient(): {
    $transaction<T>(callback: (tx: CreateReleaseRequestTransaction) => Promise<T>): Promise<T>;
  } | null;
  canInitiateReleaseRequest(user: AppUser, contractCode: string): boolean;
}

interface CreateReleaseRequestTransaction {
  contract: {
    findUnique(args: {
      where: { id: string };
      select: {
        id: true;
        code: true;
        companyId: true;
        status: true;
      };
    }): Promise<{
      id: string;
      code: string;
      companyId: string;
      status: "ativo" | "encerrado" | "suspenso";
    } | null>;
  };
  employee: {
    findMany(args: {
      where: { id: { in: string[] } };
      select: {
        id: true;
        admissionDate: true;
      };
    }): Promise<Array<{ id: string; admissionDate: Date }>>;
  };
  employeeAllocation: {
    findMany(args: {
      where: {
        contractId: string;
        employeeId: { in: string[] };
      };
      select: {
        employeeId: true;
        startDate: true;
        endDate: true;
      };
    }): Promise<
      Array<{
        employeeId: string;
        startDate: Date;
        endDate: Date | null;
      }>
    >;
  };
  competency: {
    findMany(args: {
      where: {
        contractId: string;
        competency: { in: string[] };
      };
      select: {
        competency: true;
      };
    }): Promise<Array<{ competency: string }>>;
  };
  releaseRequest: {
    findUnique(args: {
      where: { protocol: string };
      select: { id: true };
    }): Promise<{ id: string } | null>;
    findMany(args: {
      where: {
        contractId: string;
        releaseType: CreateReleaseRequestInput["releaseType"];
        status: { in: readonly string[] };
      };
      select: {
        id: true;
        status: true;
        items: {
          select: {
            employeeId: true;
            releaseRubric: true;
            competencyRef: true;
            factOccurredOn: true;
          };
        };
      };
    }): Promise<
      Array<{
        id: string;
        status: string;
        items: Array<{
          employeeId: string;
          releaseRubric: string;
          competencyRef: string;
          factOccurredOn: Date;
        }>;
      }>
    >;
    create(args: {
      data: {
        contractId: string;
        companyId: string;
        protocol: string;
        releaseType: CreateReleaseRequestInput["releaseType"];
        movementMode: CreateReleaseRequestInput["movementMode"];
        status: "enviada";
        requestedByName: string;
        requestedByUserId: string;
        factualBasis: string;
        competencyStart: string;
        competencyEnd: string;
        requestedTotalAmount: number;
        notes: string | null;
        items: {
          create: Array<{
            employeeId: string;
            releaseRubric: CreateReleaseRequestInput["items"][number]["releaseRubric"];
            competencyRef: string;
            allocationStartDate: Date;
            allocationEndDate: Date | null;
            employmentStartDate: Date;
            factOccurredOn: Date;
            calculationMemory: CreateReleaseRequestInput["items"][number]["calculationMemory"] | null;
            requestedAmount: number;
            validatedAmount: number;
            approvedAmount: number;
            decision: "pendente";
            notes: string | null;
          }>;
        };
      };
      select: {
        id: true;
        protocol: true;
        status: true;
        createdAt: true;
        items: {
          select: {
            id: true;
            employeeId: true;
            releaseRubric: true;
            competencyRef: true;
            requestedAmount: true;
            validatedAmount: true;
          };
        };
      };
    }): Promise<{
      id: string;
      protocol: string;
      status: "enviada";
      createdAt: Date;
      items: Array<{
        id: string;
        employeeId: string;
        releaseRubric: string;
        competencyRef: string;
        requestedAmount: number | { toNumber(): number };
        validatedAmount: number | { toNumber(): number };
      }>;
    }>;
  };
  auditLog: {
    create(args: {
      data: {
        contractId: string;
        userId: string;
        actorName: string;
        action: string;
        entity: string;
        after: Record<string, unknown>;
        details: string;
      };
    }): Promise<unknown>;
  };
}

const defaultDependencies: CreateReleaseRequestDependencies = {
  getCurrentUser,
  isDatabaseEnabled,
  getPrismaClient: () => getPrismaClient() as unknown as CreateReleaseRequestDependencies["getPrismaClient"] extends () => infer T ? T : never,
  canInitiateReleaseRequest,
};

function decimalToNumber(value: number | { toNumber(): number }) {
  return typeof value === "number" ? value : value.toNumber();
}

export async function createReleaseRequestWithDependencies(
  input: CreateReleaseRequestInput,
  dependencies: CreateReleaseRequestDependencies,
): Promise<CreateReleaseRequestCommandResult> {
  const normalizedInput = normalizeInput(input);
  const validation = validateCreateReleaseRequestInput(normalizedInput);

  if (!validation.valid) {
    return {
      ok: false,
      code: "validation_error",
      message: "Verifique os campos obrigatórios da solicitação.",
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
        "A criação de solicitações exige DATABASE_URL configurada. O modo em memória segue disponível apenas para leitura.",
    };
  }

  const prisma = dependencies.getPrismaClient();

  if (!prisma) {
    return {
      ok: false,
      code: "database_unavailable",
      message:
        "A conexão com o banco não está disponível para gravar a solicitação.",
    };
  }

  try {
    return await prisma.$transaction(async (tx: CreateReleaseRequestTransaction) => {
      const contract = await tx.contract.findUnique({
        where: { id: normalizedInput.contractId },
        select: { id: true, code: true, companyId: true, status: true },
      });

      if (!contract) {
        return {
          ok: false,
          code: "not_found",
          message: "Contrato não encontrado.",
          fieldErrors: { contractId: "Contrato inválido." },
        } satisfies CreateReleaseRequestCommandResult;
      }

      if (!dependencies.canInitiateReleaseRequest(user, contract.code)) {
        return {
          ok: false,
          code: "unauthorized",
          message:
            "Seu perfil não possui permissão para iniciar solicitação neste contrato.",
        } satisfies CreateReleaseRequestCommandResult;
      }

      if (contract.status !== "ativo") {
        return {
          ok: false,
          code: "validation_error",
          message: "A solicitação só pode ser criada para contratos ativos.",
          fieldErrors: {
            contractId: "Somente contratos ativos podem receber solicitações.",
          },
        } satisfies CreateReleaseRequestCommandResult;
      }

      const employeeIds = [...new Set(normalizedInput.items.map((item) => item.employeeId))];
      const competencyRefs = [
        ...new Set(normalizedInput.items.map((item) => item.competencyRef)),
      ];

      const [employees, allocations, competencies, openRequests] =
        await Promise.all([
          tx.employee.findMany({
            where: { id: { in: employeeIds } },
            select: { id: true, admissionDate: true },
          }),
          tx.employeeAllocation.findMany({
            where: {
              contractId: contract.id,
              employeeId: { in: employeeIds },
            },
            select: {
              employeeId: true,
              startDate: true,
              endDate: true,
            },
          }),
          tx.competency.findMany({
            where: {
              contractId: contract.id,
              competency: { in: competencyRefs },
            },
            select: { competency: true },
          }),
          tx.releaseRequest.findMany({
            where: {
              contractId: contract.id,
              releaseType: normalizedInput.releaseType,
              status: { in: OPEN_REQUEST_STATUSES },
            },
            select: {
              id: true,
              status: true,
              items: {
                select: {
                  employeeId: true,
                  releaseRubric: true,
                  competencyRef: true,
                  factOccurredOn: true,
                },
              },
            },
          }),
        ]);

      const duplicate = findDuplicateOpenReleaseRequest(
        normalizedInput,
        openRequests.map((request) => ({
          id: request.id,
          status: request.status,
          items: request.items.map((item) => ({
            employeeId: item.employeeId,
            releaseRubric: item.releaseRubric,
            competencyRef: item.competencyRef,
            factOccurredOn: item.factOccurredOn.toISOString().slice(0, 10),
          })),
        })),
      );

      if (duplicate) {
        return {
          ok: false,
          code: "duplicate_request",
          message:
            "Já existe solicitação aberta com item equivalente para este contrato.",
          fieldErrors: {
            items:
              "Há item já solicitado em pedido aberto. Revise a duplicidade antes de continuar.",
          },
        } satisfies CreateReleaseRequestCommandResult;
      }

      const employeeById = new Map(
        employees.map((employee) => [employee.id, employee]),
      );
      const allocationByEmployeeId = new Map(
        allocations.map((allocation) => [allocation.employeeId, allocation]),
      );
      const availableCompetencies = new Set(
        competencies.map((competency) => competency.competency),
      );

      for (const [index, item] of normalizedInput.items.entries()) {
        if (!employeeById.has(item.employeeId)) {
          return {
            ok: false,
            code: "not_found",
            message: "Empregado não encontrado.",
            fieldErrors: {
              itemErrors: {
                [index]: {
                  employeeId: "Empregado inválido para esta solicitação.",
                },
              },
            },
          } satisfies CreateReleaseRequestCommandResult;
        }

        if (!allocationByEmployeeId.has(item.employeeId)) {
          return {
            ok: false,
            code: "validation_error",
            message:
              "Um dos empregados informados não está alocado ao contrato selecionado.",
            fieldErrors: {
              itemErrors: {
                [index]: {
                  employeeId:
                    "Empregado não encontrado na alocação deste contrato.",
                },
              },
            },
          } satisfies CreateReleaseRequestCommandResult;
        }

        if (!availableCompetencies.has(item.competencyRef)) {
          return {
            ok: false,
            code: "validation_error",
            message:
              "Uma das competências informadas não existe para o contrato selecionado.",
            fieldErrors: {
              itemErrors: {
                [index]: {
                  competencyRef: "Competência inválida para este contrato.",
                },
              },
            },
          } satisfies CreateReleaseRequestCommandResult;
        }
      }

      const protocol = await generateUniqueProtocol(tx);
      const itemsToCreate = normalizedInput.items.map((item) => {
        const employee = employeeById.get(item.employeeId)!;
        const allocation = allocationByEmployeeId.get(item.employeeId)!;

        return {
          employeeId: item.employeeId,
          releaseRubric: item.releaseRubric,
          competencyRef: item.competencyRef,
          allocationStartDate: allocation.startDate,
          allocationEndDate: allocation.endDate,
          employmentStartDate: employee.admissionDate,
          factOccurredOn: new Date(item.factOccurredOn),
          calculationMemory: item.calculationMemory ?? null,
          requestedAmount: item.requestedAmount,
          validatedAmount: item.requestedAmount,
          approvedAmount: 0,
          decision: "pendente" as const,
          notes: item.notes ?? null,
        };
      });

      const request = await tx.releaseRequest.create({
        data: {
          contractId: contract.id,
          companyId: contract.companyId,
          protocol,
          releaseType: normalizedInput.releaseType,
          movementMode: normalizedInput.movementMode,
          status: "enviada",
          requestedByName: user.name,
          requestedByUserId: user.id,
          factualBasis: normalizedInput.factualBasis,
          competencyStart: normalizedInput.competencyStart,
          competencyEnd: normalizedInput.competencyEnd,
          requestedTotalAmount: normalizedInput.requestedTotalAmount,
          notes: normalizedInput.notes ?? null,
          items: {
            create: itemsToCreate,
          },
        },
        select: {
          id: true,
          protocol: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              employeeId: true,
              releaseRubric: true,
              competencyRef: true,
              requestedAmount: true,
              validatedAmount: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          contractId: contract.id,
          userId: user.id,
          actorName: user.name,
          action: "Cria solicitação de liberação",
          entity: "release_request",
          after: {
            releaseRequestId: request.id,
            protocol: request.protocol,
            releaseType: normalizedInput.releaseType,
            movementMode: normalizedInput.movementMode,
            status: request.status,
            companyId: contract.companyId,
            competencyStart: normalizedInput.competencyStart,
            competencyEnd: normalizedInput.competencyEnd,
            requestedTotalAmount: normalizedInput.requestedTotalAmount,
            itemCount: request.items.length,
            items: request.items.map((item) => ({
              id: item.id,
              employeeId: item.employeeId,
              releaseRubric: item.releaseRubric,
              competencyRef: item.competencyRef,
              requestedAmount: decimalToNumber(item.requestedAmount),
              validatedAmount: decimalToNumber(item.validatedAmount),
            })),
          },
          details: `Solicitação ${request.protocol} enviada com ${request.items.length} item(ns).`,
        },
      });

      return {
        ok: true,
        data: {
          releaseRequestId: request.id,
          protocol: request.protocol,
          status: "enviada",
          releaseType: normalizedInput.releaseType,
          movementMode: normalizedInput.movementMode,
          contractId: contract.id,
          companyId: contract.companyId,
          competencyStart: normalizedInput.competencyStart,
          competencyEnd: normalizedInput.competencyEnd,
          requestedTotalAmount: normalizedInput.requestedTotalAmount,
          itemCount: request.items.length,
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
          "Não foi possível reservar um protocolo único para a solicitação. Tente novamente.",
      };
    }

    return {
      ok: false,
      code: "unexpected_error",
      message: "Não foi possível criar a solicitação de liberação neste momento.",
    };
  }
}

export async function createReleaseRequest(
  input: CreateReleaseRequestInput,
): Promise<CreateReleaseRequestCommandResult> {
  return createReleaseRequestWithDependencies(input, defaultDependencies);
}
