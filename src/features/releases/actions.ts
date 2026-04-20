"use server";

import { revalidatePath } from "next/cache";
import { createReleaseRequest } from "@/server/commands/releases/create-release-request";
import { reviewReleaseRequest } from "@/server/commands/releases/review-release-request";
import type {
  CreateReleaseRequestActionState,
  CreateReleaseRequestItemInput,
  ReviewReleaseRequestActionState,
  ReviewReleaseRequestDecision,
} from "@/features/releases/types";

export async function createReleaseRequestAction(
  _: CreateReleaseRequestActionState,
  formData: FormData,
): Promise<CreateReleaseRequestActionState> {
  let items: CreateReleaseRequestItemInput[] = [];

  try {
    const rawItems = String(formData.get("itemsPayload") ?? "[]");
    const parsed = JSON.parse(rawItems);
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    return {
      status: "error",
      code: "validation_error",
      message: "Não foi possível interpretar os itens da solicitação.",
      fieldErrors: {
        items: "Revise os itens informados antes de enviar a solicitação.",
      },
    };
  }

  const result = await createReleaseRequest({
    contractId: String(formData.get("contractId") ?? "").trim(),
    releaseType: String(formData.get("releaseType") ?? "").trim() as never,
    factualBasis: String(formData.get("factualBasis") ?? "").trim(),
    competencyStart: String(formData.get("competencyStart") ?? "").trim(),
    competencyEnd: String(formData.get("competencyEnd") ?? "").trim(),
    requestedTotalAmount: Number(
      String(formData.get("requestedTotalAmount") ?? "").replace(",", "."),
    ),
    notes: String(formData.get("notes") ?? "").trim(),
    items,
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
    message: `Solicitação ${result.data.protocol} enviada com ${result.data.itemCount} item(ns).`,
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
