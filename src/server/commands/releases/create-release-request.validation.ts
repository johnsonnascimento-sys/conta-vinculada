import type {
  CreateReleaseRequestFieldErrors,
  CreateReleaseRequestInput,
  OpenReleaseRequestDuplicate,
} from "@/features/releases/types";
import {
  getAllowedRubricsForReleaseType,
  isReleaseType,
} from "@/features/releases/rules";

const COMPETENCY_PATTERN = /^\d{4}-\d{2}$/;

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function compareIsoDates(left: string, right: string) {
  return new Date(left).getTime() - new Date(right).getTime();
}

export function sumRequestedItemAmount(input: CreateReleaseRequestInput) {
  return input.items.reduce((total, item) => total + item.requestedAmount, 0);
}

export function buildDuplicateReleaseRequestItemKey(item: {
  employeeId: string;
  releaseRubric: string;
  competencyRef: string;
  factOccurredOn: string;
}) {
  return [
    item.employeeId.trim(),
    item.releaseRubric.trim(),
    item.competencyRef.trim(),
    item.factOccurredOn.trim(),
  ].join("::");
}

export function findDuplicateOpenReleaseRequest(
  input: CreateReleaseRequestInput,
  openRequests: Array<{
    id: string;
    status: string;
    items: Array<{
      employeeId: string;
      releaseRubric: string;
      competencyRef: string;
      factOccurredOn: string;
    }>;
  }>,
): OpenReleaseRequestDuplicate | null {
  const incomingKeys = new Set(
    input.items.map((item) => buildDuplicateReleaseRequestItemKey(item)),
  );

  for (const request of openRequests) {
    const matchingItemCount = request.items.filter((item) =>
      incomingKeys.has(buildDuplicateReleaseRequestItemKey(item)),
    ).length;

    if (matchingItemCount > 0) {
      return {
        id: request.id,
        status: request.status as OpenReleaseRequestDuplicate["status"],
        matchingItemCount,
      };
    }
  }

  return null;
}

export function validateCreateReleaseRequestInput(input: CreateReleaseRequestInput) {
  const fieldErrors: CreateReleaseRequestFieldErrors = {};
  const itemErrors: NonNullable<CreateReleaseRequestFieldErrors["itemErrors"]> = {};

  if (!input.contractId.trim()) {
    fieldErrors.contractId = "Selecione um contrato.";
  }

  if (!isReleaseType(input.releaseType)) {
    fieldErrors.releaseType = "Selecione um tipo de liberação válido.";
  }

  if (!input.factualBasis.trim()) {
    fieldErrors.factualBasis = "Informe o fundamento ou fato gerador.";
  } else if (input.factualBasis.trim().length > 500) {
    fieldErrors.factualBasis =
      "O fundamento da solicitação deve ter no máximo 500 caracteres.";
  }

  if (!COMPETENCY_PATTERN.test(input.competencyStart.trim())) {
    fieldErrors.competencyStart =
      "Informe a competência inicial no formato AAAA-MM.";
  }

  if (!COMPETENCY_PATTERN.test(input.competencyEnd.trim())) {
    fieldErrors.competencyEnd =
      "Informe a competência final no formato AAAA-MM.";
  }

  if (
    COMPETENCY_PATTERN.test(input.competencyStart.trim()) &&
    COMPETENCY_PATTERN.test(input.competencyEnd.trim()) &&
    input.competencyStart > input.competencyEnd
  ) {
    fieldErrors.competencyEnd =
      "A competência final não pode ser anterior à competência inicial.";
  }

  if (input.items.length === 0) {
    fieldErrors.items = "Adicione ao menos um item à solicitação.";
  }

  const expectedTotal = sumRequestedItemAmount(input);

  if (
    !Number.isFinite(input.requestedTotalAmount) ||
    input.requestedTotalAmount <= 0
  ) {
    fieldErrors.requestedTotalAmount =
      "Informe um valor total solicitado maior que zero.";
  } else if (Math.abs(input.requestedTotalAmount - expectedTotal) > 0.009) {
    fieldErrors.requestedTotalAmount =
      "O total solicitado deve corresponder à soma dos itens.";
  }

  const allowedRubrics = isReleaseType(input.releaseType)
    ? getAllowedRubricsForReleaseType(input.releaseType)
    : [];

  input.items.forEach((item, index) => {
    const currentErrors: Record<string, string> = {};

    if (!item.employeeId.trim()) {
      currentErrors.employeeId = "Selecione um empregado.";
    }

    if (!allowedRubrics.includes(item.releaseRubric)) {
      currentErrors.releaseRubric =
        "Selecione uma rubrica compatível com o tipo de liberação.";
    }

    if (!COMPETENCY_PATTERN.test(item.competencyRef.trim())) {
      currentErrors.competencyRef =
        "Informe a competência do item no formato AAAA-MM.";
    }

    if (!isIsoDate(item.employmentStartDate)) {
      currentErrors.employmentStartDate =
        "Informe a data de admissão no formato AAAA-MM-DD.";
    }

    if (!isIsoDate(item.allocationStartDate)) {
      currentErrors.allocationStartDate =
        "Informe a data de disponibilização no contrato no formato AAAA-MM-DD.";
    }

    if (item.allocationEndDate && !isIsoDate(item.allocationEndDate)) {
      currentErrors.allocationEndDate =
        "Informe a data final da alocação no formato AAAA-MM-DD.";
    }

    if (!isIsoDate(item.factOccurredOn)) {
      currentErrors.factOccurredOn =
        "Informe a data do fato gerador no formato AAAA-MM-DD.";
    }

    if (
      isIsoDate(item.employmentStartDate) &&
      isIsoDate(item.factOccurredOn) &&
      compareIsoDates(item.factOccurredOn, item.employmentStartDate) < 0
    ) {
      currentErrors.factOccurredOn =
        "A data do fato gerador não pode ser anterior à admissão.";
    }

    if (
      isIsoDate(item.allocationStartDate) &&
      isIsoDate(item.factOccurredOn) &&
      compareIsoDates(item.factOccurredOn, item.allocationStartDate) < 0
    ) {
      currentErrors.factOccurredOn =
        "A data do fato gerador não pode ser anterior à disponibilização no contrato.";
    }

    if (
      item.allocationEndDate &&
      isIsoDate(item.allocationEndDate) &&
      isIsoDate(item.factOccurredOn) &&
      compareIsoDates(item.factOccurredOn, item.allocationEndDate) > 0
    ) {
      currentErrors.factOccurredOn =
        "A data do fato gerador não pode ultrapassar o fim da alocação.";
    }

    if (!Number.isFinite(item.requestedAmount) || item.requestedAmount <= 0) {
      currentErrors.requestedAmount =
        "Informe um valor solicitado maior que zero.";
    }

    if (item.notes && item.notes.trim().length > 500) {
      currentErrors.notes =
        "As observações do item devem ter no máximo 500 caracteres.";
    }

    if (Object.keys(currentErrors).length > 0) {
      itemErrors[index] = currentErrors;
    }
  });

  if (Object.keys(itemErrors).length > 0) {
    fieldErrors.itemErrors = itemErrors;
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}
