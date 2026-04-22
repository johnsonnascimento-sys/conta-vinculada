"use client";

import { useActionState } from "react";
import { executeReleaseRequestEffectivelyAction } from "@/features/releases/actions";
import type { ExecuteReleaseRequestEffectivelyActionState } from "@/features/releases/types";

const initialState: ExecuteReleaseRequestEffectivelyActionState = {
  status: "idle",
};

interface FinancialExecutionFormProps {
  requestId: string;
  bankEntries: Array<{
    id: string;
    description: string;
    amount: number;
    occurredOn: string;
  }>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function FinancialExecutionForm({
  requestId,
  bankEntries,
}: FinancialExecutionFormProps) {
  const [state, formAction, isPending] = useActionState(
    executeReleaseRequestEffectivelyAction,
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
          Lançamento bancário da execução
        </span>
        <select
          name="bankEntryId"
          defaultValue={bankEntries[0]?.id}
          className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
        >
          {bankEntries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {formatDate(entry.occurredOn)} • {formatCurrency(entry.amount)} •{" "}
              {entry.description}
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
          Observações do registro efetivo
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Opcional. Use para registrar o contexto do vínculo com o lançamento bancário."
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
        />
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
          Esta etapa registra a execução efetiva com vínculo a lançamento
          bancário já existente. Não há integração automática com extrato.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {isPending ? "Registrando..." : "Registrar execução"}
        </button>
      </div>
    </form>
  );
}
