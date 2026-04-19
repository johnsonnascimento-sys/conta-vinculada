"use client";

import { useActionState, useState } from "react";
import { createReleaseRequestAction } from "@/features/releases/actions";
import type {
  CreateReleaseRequestActionState,
  ReleaseRequestCreationOptions,
} from "@/features/releases/types";

const initialState: CreateReleaseRequestActionState = {
  status: "idle",
};

interface CreateReleaseRequestFormProps {
  options: ReleaseRequestCreationOptions;
}

export function CreateReleaseRequestForm({
  options,
}: CreateReleaseRequestFormProps) {
  const initialContractId = options.contracts[0]?.id ?? "";
  const [selectedContractId, setSelectedContractId] = useState(initialContractId);
  const [state, formAction, isPending] = useActionState(
    createReleaseRequestAction,
    initialState,
  );

  const employeeOptions = options.employeesByContract[selectedContractId] ?? [];

  if (!options.databaseEnabled) {
    return (
      <div className="rounded-[1.4rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-4 text-sm leading-6 text-[var(--color-danger)]">
        A criacao de solicitacoes ainda depende de `DATABASE_URL`. No modo em
        memoria, esta tela permanece somente leitura.
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Contrato
          </span>
          <select
            name="contractId"
            defaultValue={initialContractId}
            onChange={(event) => setSelectedContractId(event.target.value)}
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          >
            {options.contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.code} - {contract.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.contractId ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.contractId}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Empregado
          </span>
          <select
            key={selectedContractId}
            name="employeeId"
            defaultValue={employeeOptions[0]?.id ?? ""}
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          >
            {employeeOptions.length === 0 ? (
              <option value="">Nenhum empregado alocado</option>
            ) : (
              employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.role}
                </option>
              ))
            )}
          </select>
          {state.fieldErrors?.employeeId ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.employeeId}
            </p>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_0.8fr]">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Competencia
          </span>
          <input
            type="text"
            name="competency"
            placeholder="2026-03"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          />
          {state.fieldErrors?.competency ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.competency}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Rubrica
          </span>
          <input
            type="text"
            name="rubric"
            placeholder="Ferias + 1/3"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          />
          {state.fieldErrors?.rubric ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.rubric}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Valor solicitado
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="requestedAmount"
            placeholder="0,00"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          />
          {state.fieldErrors?.requestedAmount ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.requestedAmount}
            </p>
          ) : null}
        </label>
      </div>

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-muted)]">
          Este recorte cria a solicitacao em elaboracao com um unico item e deixa
          analise, aprovacao e execucao para a proxima etapa.
        </p>
        <button
          type="submit"
          disabled={isPending || employeeOptions.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {isPending ? "Criando..." : "Iniciar solicitacao"}
        </button>
      </div>
    </form>
  );
}
