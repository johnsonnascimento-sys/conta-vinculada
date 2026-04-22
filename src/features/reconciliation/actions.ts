"use server";

import { revalidatePath } from "next/cache";
import { closeCompetencyReconciliation } from "@/server/commands/reconciliation/close-competency-reconciliation";
import { reopenCompetencyReconciliation } from "@/server/commands/reconciliation/reopen-competency-reconciliation";
import type {
  CloseCompetencyReconciliationActionState,
  ReopenCompetencyReconciliationActionState,
} from "@/features/reconciliation/types";

export async function closeCompetencyReconciliationAction(
  _: CloseCompetencyReconciliationActionState,
  formData: FormData,
): Promise<CloseCompetencyReconciliationActionState> {
  const result = await closeCompetencyReconciliation({
    competencyId: String(formData.get("competencyId") ?? "").trim(),
    justification: String(formData.get("justification") ?? "").trim(),
  });

  if (!result.ok) {
    return {
      status: "error",
      code: result.code,
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/dashboard/reconciliation");
  revalidatePath(`/dashboard/contracts/${result.data.contractId}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `Competência ${result.data.competency} fechada formalmente.`,
    data: result.data,
  };
}

export async function reopenCompetencyReconciliationAction(
  _: ReopenCompetencyReconciliationActionState,
  formData: FormData,
): Promise<ReopenCompetencyReconciliationActionState> {
  const result = await reopenCompetencyReconciliation({
    competencyId: String(formData.get("competencyId") ?? "").trim(),
    justification: String(formData.get("justification") ?? "").trim(),
  });

  if (!result.ok) {
    return {
      status: "error",
      code: result.code,
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/dashboard/reconciliation");
  revalidatePath(`/dashboard/contracts/${result.data.contractId}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `Competência ${result.data.competency} reaberta de forma controlada.`,
    data: result.data,
  };
}
