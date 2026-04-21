import type {
  ContractNormativeRegime,
  DocumentKind,
  ReleaseDocumentCategoryMap,
  ReleaseMovementMode,
  ReleaseRequestStatus,
  ReleaseRubric,
  ReleaseType,
} from "@/features/platform/types";

export interface ReleaseDocumentExpectation {
  fact: DocumentKind[];
  calculation: DocumentKind[];
  settlement: DocumentKind[];
  operation: DocumentKind[];
  closure: DocumentKind[];
}

export interface ReleaseTypeRule {
  rubrics: ReleaseRubric[];
  documents: ReleaseDocumentExpectation;
}

const DOCUMENT_CATEGORIES = [
  "fact",
  "calculation",
  "settlement",
  "operation",
  "closure",
] as const satisfies Array<keyof ReleaseDocumentCategoryMap>;

export const RELEASE_TYPE_RULES: Record<ReleaseType, ReleaseTypeRule> = {
  ferias: {
    rubrics: ["ferias", "terco_constitucional_ferias", "encargos_ferias"],
    documents: {
      fact: ["ferias"],
      calculation: ["folha"],
      settlement: ["comprovante_pagamento"],
      operation: ["comprovante_operacao_bancaria"],
      closure: ["encerramento_contratual", "sucessao_contratual"],
    },
  },
  decimo_terceiro: {
    rubrics: ["decimo_terceiro", "encargos_decimo_terceiro"],
    documents: {
      fact: ["folha"],
      calculation: ["folha"],
      settlement: ["comprovante_pagamento"],
      operation: ["comprovante_operacao_bancaria"],
      closure: ["encerramento_contratual", "sucessao_contratual"],
    },
  },
  rescisao: {
    rubrics: [
      "ferias_proporcionais",
      "decimo_terceiro_proporcional",
      "multa_fgts_rescisoria",
      "encargos_rescisorios",
    ],
    documents: {
      fact: ["rescisao"],
      calculation: ["fgts", "folha"],
      settlement: ["comprovante_pagamento"],
      operation: ["comprovante_operacao_bancaria"],
      closure: ["encerramento_contratual", "sucessao_contratual"],
    },
  },
};

export const RELEASE_MOVEMENT_MODES: ReleaseMovementMode[] = [
  "pagamento_direto_empregado",
  "resgate_contratada",
];

export const RELEASE_MOVEMENT_MODE_DOCUMENTS: Record<
  ReleaseMovementMode,
  DocumentKind[]
> = {
  pagamento_direto_empregado: ["comprovante_operacao_bancaria"],
  resgate_contratada: ["comprovante_pagamento", "comprovante_operacao_bancaria"],
};

export const RELEASE_TYPES = Object.keys(
  RELEASE_TYPE_RULES,
) as ReleaseType[];

export function isReleaseType(value: string): value is ReleaseType {
  return RELEASE_TYPES.includes(value as ReleaseType);
}

export function isReleaseMovementMode(
  value: string,
): value is ReleaseMovementMode {
  return RELEASE_MOVEMENT_MODES.includes(value as ReleaseMovementMode);
}

export function getAllowedRubricsForReleaseType(
  releaseType: ReleaseType,
): ReleaseRubric[] {
  return RELEASE_TYPE_RULES[releaseType].rubrics;
}

export function isRubricAllowedForReleaseType(
  releaseType: ReleaseType,
  rubric: string,
): rubric is ReleaseRubric {
  return getAllowedRubricsForReleaseType(releaseType).includes(
    rubric as ReleaseRubric,
  );
}

export function getExpectedDocumentsForReleaseType(
  releaseType: ReleaseType,
): DocumentKind[] {
  const { fact, calculation, settlement } =
    RELEASE_TYPE_RULES[releaseType].documents;

  return [...new Set([...fact, ...calculation, ...settlement])];
}

export function getExpectedOperationDocumentsForRelease(
  movementMode: ReleaseMovementMode,
): DocumentKind[] {
  return RELEASE_MOVEMENT_MODE_DOCUMENTS[movementMode];
}

export function getExpectedFinancialPreparationEvidence(input: {
  movementMode: ReleaseMovementMode;
  normativeRegime: ContractNormativeRegime;
}) {
  const required: DocumentKind[] = ["despacho"];

  if (
    input.movementMode === "pagamento_direto_empregado" ||
    input.normativeRegime === "cnj_651_2025"
  ) {
    required.push("parecer");
  }

  return uniqueDocumentKinds(required);
}

function createEmptyDocumentCategoryMap(): ReleaseDocumentCategoryMap {
  return {
    fact: [],
    calculation: [],
    settlement: [],
    operation: [],
    closure: [],
  };
}

function uniqueDocumentKinds(values: DocumentKind[]) {
  return [...new Set(values)];
}

function mergeDocumentCategories(
  left: ReleaseDocumentCategoryMap,
  right: Partial<ReleaseDocumentCategoryMap>,
): ReleaseDocumentCategoryMap {
  const merged = createEmptyDocumentCategoryMap();

  for (const category of DOCUMENT_CATEGORIES) {
    merged[category] = uniqueDocumentKinds([
      ...left[category],
      ...(right[category] ?? []),
    ]);
  }

  return merged;
}

function flattenDocumentCategories(groups: ReleaseDocumentCategoryMap) {
  return uniqueDocumentKinds(
    DOCUMENT_CATEGORIES.flatMap((category) => groups[category]),
  );
}

function pickCategories(
  groups: ReleaseDocumentCategoryMap,
  categories: Array<keyof ReleaseDocumentCategoryMap>,
) {
  const picked = createEmptyDocumentCategoryMap();

  for (const category of categories) {
    picked[category] = [...groups[category]];
  }

  return picked;
}

function subtractProvidedDocuments(
  groups: ReleaseDocumentCategoryMap,
  provided: DocumentKind[],
) {
  const providedSet = new Set(provided);
  const result = createEmptyDocumentCategoryMap();

  for (const category of DOCUMENT_CATEGORIES) {
    result[category] = groups[category].filter(
      (documentKind) => !providedSet.has(documentKind),
    );
  }

  return result;
}

function getCurrentStageDocumentCategories(
  status: ReleaseRequestStatus,
): Array<keyof ReleaseDocumentCategoryMap> {
  if (status === "rejeitada" || status === "cancelada") {
    return [];
  }

  if (status === "liberada") {
    return ["fact", "calculation", "settlement", "operation"];
  }

  return ["fact", "calculation", "settlement"];
}

export function getReleaseDocumentPlan(
  releaseType: ReleaseType,
  movementMode: ReleaseMovementMode,
  status: ReleaseRequestStatus,
  providedDocuments: DocumentKind[],
) {
  const baseGroups = mergeDocumentCategories(
    RELEASE_TYPE_RULES[releaseType].documents,
    {
      operation: getExpectedOperationDocumentsForRelease(movementMode),
    },
  );
  const currentStageCategories = getCurrentStageDocumentCategories(status);
  const expectedCurrentStageByCategory = pickCategories(
    baseGroups,
    currentStageCategories,
  );
  const deferredByCategory = createEmptyDocumentCategoryMap();

  for (const category of DOCUMENT_CATEGORIES) {
    if (!currentStageCategories.includes(category)) {
      deferredByCategory[category] = [...baseGroups[category]];
    }
  }

  const normalizedProvidedDocuments = uniqueDocumentKinds(providedDocuments);
  const missingByCategory = subtractProvidedDocuments(
    expectedCurrentStageByCategory,
    normalizedProvidedDocuments,
  );

  return {
    provided: normalizedProvidedDocuments,
    expectedByCategory: baseGroups,
    expectedCurrentStageByCategory,
    expectedCurrentStage: flattenDocumentCategories(expectedCurrentStageByCategory),
    missingByCategory,
    missingCurrentStage: flattenDocumentCategories(missingByCategory),
    deferredByCategory,
  };
}
