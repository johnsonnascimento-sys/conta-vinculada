"use client";

import { useActionState } from "react";
import { closeCompetencyReconciliationAction } from "@/features/reconciliation/actions";
import type { CloseCompetencyReconciliationActionState } from "@/features/reconciliation/types";

const initialState: CloseCompetencyReconciliationActionState = {
  status: "idle",
};

interface CloseCompetencyFormProps {
  competencyId: string;
}

export function CloseCompetencyForm({
  competencyId,
}: CloseCompetencyFormProps) {
  const [state, formAction, isPending] = useActionState(
    closeCompetencyReconciliationAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="competencyId" value={competencyId} />

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Justificativa do fechamento
        </span>
        <textarea
          name="justification"
          rows={3}
          placeholder="Explique o motivo operacional do fechamento formal da competência."
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
        />
        {state.fieldErrors?.justification ? (
          <p className="text-sm text-[var(--color-danger)]">
            {state.fieldErrors.justification}
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

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
      >
        {isPending ? "Fechando..." : "Fechar competência"}
      </button>
    </form>
  );
}
