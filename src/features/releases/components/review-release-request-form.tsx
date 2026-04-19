"use client";

import { useActionState, useState } from "react";
import { reviewReleaseRequestAction } from "@/features/releases/actions";
import type {
  ReviewReleaseRequestActionState,
  ReviewReleaseRequestDecision,
} from "@/features/releases/types";

const initialState: ReviewReleaseRequestActionState = {
  status: "idle",
};

interface ReviewReleaseRequestFormProps {
  requestId: string;
  itemId: string;
  requestedAmount: number;
}

export function ReviewReleaseRequestForm({
  requestId,
  itemId,
  requestedAmount,
}: ReviewReleaseRequestFormProps) {
  const [decision, setDecision] =
    useState<ReviewReleaseRequestDecision>("aprovar");
  const [approvedAmount, setApprovedAmount] = useState(
    requestedAmount.toFixed(2),
  );
  const [state, formAction, isPending] = useActionState(
    reviewReleaseRequestAction,
    initialState,
  );

  function handleDecisionChange(nextDecision: ReviewReleaseRequestDecision) {
    setDecision(nextDecision);

    if (nextDecision === "aprovar") {
      setApprovedAmount(requestedAmount.toFixed(2));
      return;
    }

    if (nextDecision === "rejeitar") {
      setApprovedAmount("0.00");
    }
  }

  return (
    <form action={formAction} className="mt-3 grid gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="itemId" value={itemId} />

      <div className="grid gap-3 md:grid-cols-[0.9fr_0.8fr]">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Decisão
          </span>
          <select
            name="decision"
            value={decision}
            onChange={(event) =>
              handleDecisionChange(
                event.target.value as ReviewReleaseRequestDecision,
              )
            }
            className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          >
            <option value="aprovar">Aprovar</option>
            <option value="aprovar_parcial">Aprovar parcialmente</option>
            <option value="rejeitar">Rejeitar / glosar</option>
          </select>
          {state.fieldErrors?.decision ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.decision}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Valor aprovado
          </span>
          <input
            type="number"
            name="approvedAmount"
            min="0"
            step="0.01"
            value={approvedAmount}
            onChange={(event) => setApprovedAmount(event.target.value)}
            className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          />
          {state.fieldErrors?.approvedAmount ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.approvedAmount}
            </p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Justificativa
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Obrigatória em aprovação parcial ou rejeição."
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
        />
        {state.fieldErrors?.notes ? (
          <p className="text-sm text-[var(--color-danger)]">
            {state.fieldErrors.notes}
          </p>
        ) : null}
      </label>

      {state.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "success"
              ? "border border-[rgba(31,107,82,0.16)] bg-[rgba(31,107,82,0.1)] text-[var(--color-success)]"
              : "border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] text-[var(--color-danger)]"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-muted)]">
          A decisão atualiza o item, recalcula o status agregado e registra
          trilha mínima de auditoria.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {isPending ? "Registrando..." : "Registrar decisão"}
        </button>
      </div>
    </form>
  );
}
