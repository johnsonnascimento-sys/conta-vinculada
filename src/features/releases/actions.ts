"use server";

import { revalidatePath } from "next/cache";
import { createReleaseRequest } from "@/server/commands/releases/create-release-request";
import type { CreateReleaseRequestActionState } from "@/features/releases/types";

export async function createReleaseRequestAction(
  _: CreateReleaseRequestActionState,
  formData: FormData,
): Promise<CreateReleaseRequestActionState> {
  const requestedAmount = Number(
    String(formData.get("requestedAmount") ?? "").replace(",", "."),
  );

  const result = await createReleaseRequest({
    contractId: String(formData.get("contractId") ?? "").trim(),
    employeeId: String(formData.get("employeeId") ?? "").trim(),
    competency: String(formData.get("competency") ?? "").trim(),
    rubric: String(formData.get("rubric") ?? "").trim(),
    requestedAmount,
  });

  if (!result.ok) {
    return {
      status: "error",
      code: result.code,
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/dashboard/releases");
  revalidatePath(`/dashboard/contracts/${result.data.contractId}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `Solicitacao ${result.data.protocol} criada em elaboracao.`,
    data: result.data,
  };
}
