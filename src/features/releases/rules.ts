import type {
  DocumentKind,
  ReleaseRubric,
  ReleaseType,
} from "@/features/platform/types";

export interface ReleaseDocumentExpectation {
  fact: DocumentKind[];
  calculation: DocumentKind[];
  settlement: DocumentKind[];
}

export interface ReleaseTypeRule {
  rubrics: ReleaseRubric[];
  documents: ReleaseDocumentExpectation;
}

export const RELEASE_TYPE_RULES: Record<ReleaseType, ReleaseTypeRule> = {
  ferias: {
    rubrics: ["ferias", "terco_constitucional_ferias", "encargos_ferias"],
    documents: {
      fact: ["ferias"],
      calculation: ["folha"],
      settlement: ["comprovante_pagamento"],
    },
  },
  decimo_terceiro: {
    rubrics: ["decimo_terceiro", "encargos_decimo_terceiro"],
    documents: {
      fact: ["folha"],
      calculation: ["folha"],
      settlement: ["comprovante_pagamento"],
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
    },
  },
};

export const RELEASE_TYPES = Object.keys(
  RELEASE_TYPE_RULES,
) as ReleaseType[];

export function isReleaseType(value: string): value is ReleaseType {
  return RELEASE_TYPES.includes(value as ReleaseType);
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
