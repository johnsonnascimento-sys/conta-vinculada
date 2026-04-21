"use client";

import { useActionState } from "react";
import { prepareReleaseRequestForExecutionAction } from "@/features/releases/actions";
import type { PrepareReleaseRequestForExecutionActionState } from "@/features/releases/types";

const initialState: PrepareReleaseRequestForExecutionActionState = {
  status: "idle",
};

interface FinancialPreparationFormProps {
  requestId: string;
}

export function FinancialPreparationForm({
  requestId,
}: FinancialPreparationFormProps) {
  const [state, formAction, isPending] = useActionState(
    prepareReleaseRequestForExecutionAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-3 grid gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4"
    >
      <input type="hidden" name="requestId" value={requestId} />

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Observações do preparo interno
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Opcional. Use para registrar contexto do preparo da futura execução."
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
          Este registro apenas prepara internamente a etapa financeira. Nenhum
          lançamento bancário real é criado aqui.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {isPending ? "Registrando..." : "Registrar preparo"}
        </button>
      </div>
    </form>
  );
}
