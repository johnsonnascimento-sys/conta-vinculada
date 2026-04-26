import type { ReconciliationFilterKey, ReconciliationRecord } from "@/features/platform/types";
import {
  annotateReconciliationRecurrenceWithinContract,
  matchesReconciliationFilter,
} from "@/features/reconciliation/workflow";
import { getReconciliations } from "@/server/repositories/platform.repository";

export interface ReconciliationFilterOption {
  key: ReconciliationFilterKey;
  label: string;
  count: number;
}

export interface ReconciliationOverview {
  selectedFilter: ReconciliationFilterKey;
  filters: ReconciliationFilterOption[];
  reconciliations: ReconciliationRecord[];
}

function normalizeFilter(value?: string): ReconciliationFilterKey {
  if (
    value === "divergencias_residuais" ||
    value === "reabertas" ||
    value === "aptas_fechamento" ||
    value === "justificativas_sensiveis" ||
    value === "remanescentes_relevantes" ||
    value === "itemizacao_andamento" ||
    value === "justificativa_insuficiente_remanescente" ||
    value === "baixa_materialidade_remanescente"
  ) {
    return value;
  }

  return "todas";
}

export async function getReconciliationOverview(filterValue?: string): Promise<ReconciliationOverview> {
  const rawReconciliations = await getReconciliations();
  const reconciliations = Array.from(
    rawReconciliations.reduce((groups, record) => {
      const current = groups.get(record.contractId) ?? [];
      current.push(record);
      groups.set(record.contractId, current);
      return groups;
    }, new Map<string, ReconciliationRecord[]>()),
  ).flatMap(([, contractRecords]) =>
    annotateReconciliationRecurrenceWithinContract(contractRecords),
  );
  const selectedFilter = normalizeFilter(filterValue);

  const filters: ReconciliationFilterOption[] = [
    { key: "todas", label: "Todas", count: reconciliations.length },
    {
      key: "divergencias_residuais",
      label: "Residual aberto",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "divergencias_residuais"),
      ).length,
    },
    {
      key: "reabertas",
      label: "Competencias reabertas",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "reabertas"),
      ).length,
    },
    {
      key: "aptas_fechamento",
      label: "Aptas ao fechamento",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "aptas_fechamento"),
      ).length,
    },
    {
      key: "justificativas_sensiveis",
      label: "Justificativa sensivel",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "justificativas_sensiveis"),
      ).length,
    },
    {
      key: "remanescentes_relevantes",
      label: "Remanescente relevante",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "remanescentes_relevantes"),
      ).length,
    },
    {
      key: "justificativa_insuficiente_remanescente",
      label: "Justificativa insuficiente",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(
          item,
          "justificativa_insuficiente_remanescente",
        ),
      ).length,
    },
    {
      key: "itemizacao_andamento",
      label: "Itemizacao em andamento",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "itemizacao_andamento"),
      ).length,
    },
    {
      key: "baixa_materialidade_remanescente",
      label: "Baixa materialidade",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "baixa_materialidade_remanescente"),
      ).length,
    },
  ];

  return {
    selectedFilter,
    filters,
    reconciliations: reconciliations.filter((item) =>
      matchesReconciliationFilter(item, selectedFilter),
    ),
  };
}
