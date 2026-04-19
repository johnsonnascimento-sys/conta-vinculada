"use server";

import { revalidatePath } from "next/cache";
import { createReleaseRequest } from "@/server/commands/releases/create-release-request";
import { reviewReleaseRequest } from "@/server/commands/releases/review-release-request";
import type {
  CreateReleaseRequestActionState,
  ReviewReleaseRequestActionState,
  ReviewReleaseRequestDecision,
} from "@/features/releases/types";

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
    message: `Solicitação ${result.data.protocol} criada em elaboração.`,
    data: result.data,
  };
}

export async function reviewReleaseRequestAction(
  _: ReviewReleaseRequestActionState,
  formData: FormData,
): Promise<ReviewReleaseRequestActionState> {
  const approvedAmount = Number(
    String(formData.get("approvedAmount") ?? "").replace(",", "."),
  );

  const result = await reviewReleaseRequest({
    requestId: String(formData.get("requestId") ?? "").trim(),
    itemId: String(formData.get("itemId") ?? "").trim(),
    decision: String(
      formData.get("decision") ?? "",
    ).trim() as ReviewReleaseRequestDecision,
    approvedAmount,
    notes: String(formData.get("notes") ?? "").trim(),
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
    message: `Decisão registrada. Solicitação agora está em ${result.data.requestStatus}.`,
    data: result.data,
  };
}
