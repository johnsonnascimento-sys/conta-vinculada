"use client";

import { useActionState } from "react";
import { reopenCompetencyReconciliationAction } from "@/features/reconciliation/actions";
import type { ReopenCompetencyReconciliationActionState } from "@/features/reconciliation/types";

const initialState: ReopenCompetencyReconciliationActionState = {
  status: "idle",
};

interface ReopenCompetencyFormProps {
  competencyId: string;
}

export function ReopenCompetencyForm({
  competencyId,
}: ReopenCompetencyFormProps) {
  const [state, formAction, isPending] = useActionState(
    reopenCompetencyReconciliationAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="competencyId" value={competencyId} />

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Justificativa da reabertura
        </span>
        <textarea
          name="justification"
          rows={3}
          placeholder="Explique o motivo operacional da reabertura controlada da competência."
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
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-accent)] px-5 font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(168,76,47,0.08)] disabled:opacity-60"
      >
        {isPending ? "Reabrindo..." : "Reabrir competência"}
      </button>
    </form>
  );
}
