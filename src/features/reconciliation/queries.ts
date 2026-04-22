import type { ReconciliationFilterKey, ReconciliationRecord } from "@/features/platform/types";
import { matchesReconciliationFilter } from "@/features/reconciliation/workflow";
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
    value === "justificativas_sensiveis"
  ) {
    return value;
  }

  return "todas";
}

export async function getReconciliationOverview(filterValue?: string): Promise<ReconciliationOverview> {
  const reconciliations = await getReconciliations();
  const selectedFilter = normalizeFilter(filterValue);

  const filters: ReconciliationFilterOption[] = [
    { key: "todas", label: "Todas", count: reconciliations.length },
    {
      key: "divergencias_residuais",
      label: "Divergencias residuais",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "divergencias_residuais"),
      ).length,
    },
    {
      key: "reabertas",
      label: "Reabertas",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "reabertas"),
      ).length,
    },
    {
      key: "aptas_fechamento",
      label: "Aptas a fechamento",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "aptas_fechamento"),
      ).length,
    },
    {
      key: "justificativas_sensiveis",
      label: "Justificativas sensiveis",
      count: reconciliations.filter((item) =>
        matchesReconciliationFilter(item, "justificativas_sensiveis"),
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
