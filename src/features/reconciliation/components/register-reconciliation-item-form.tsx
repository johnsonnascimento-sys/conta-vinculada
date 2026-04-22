"use client";

import { useActionState } from "react";
import type { BankEntry } from "@/features/platform/types";
import { registerReconciliationItemAction } from "@/features/reconciliation/actions";
import type { RegisterReconciliationItemActionState } from "@/features/reconciliation/types";
import { formatCurrency } from "@/shared/lib/formatters";

const initialState: RegisterReconciliationItemActionState = {
  status: "idle",
};

interface RegisterReconciliationItemFormProps {
  reconciliationId: string;
  bankEntries: BankEntry[];
}

export function RegisterReconciliationItemForm({
  reconciliationId,
  bankEntries,
}: RegisterReconciliationItemFormProps) {
  const [state, formAction, isPending] = useActionState(
    registerReconciliationItemAction,
    initialState,
  );

  if (bankEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--color-muted)]">
        Nenhum lancamento bancario disponivel para vinculo minimo nesta competencia.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="reconciliationId" value={reconciliationId} />

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Lancamento bancario
        </span>
        <select
          name="bankEntryId"
          defaultValue=""
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
        >
          <option value="" disabled>
            Selecione o lancamento vinculado
          </option>
          {bankEntries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.occurredOn} | {entry.description} | {formatCurrency(entry.amount)}
            </option>
          ))}
        </select>
        {state.fieldErrors?.bankEntryId ? (
          <p className="text-sm text-[var(--color-danger)]">
            {state.fieldErrors.bankEntryId}
          </p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Justificativa da diferenca explicada
        </span>
        <textarea
          name="justification"
          rows={3}
          placeholder="Descreva de forma minima por que o lancamento explica a diferenca."
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
        {isPending ? "Registrando..." : "Registrar item conciliatorio"}
      </button>
    </form>
  );
}
