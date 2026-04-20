"use client";

import { useActionState, useState } from "react";
import type { ReleaseType } from "@/features/platform/types";
import { createReleaseRequestAction } from "@/features/releases/actions";
import {
  getAllowedRubricsForReleaseType,
  RELEASE_TYPES,
} from "@/features/releases/rules";
import type {
  CreateReleaseRequestActionState,
  CreateReleaseRequestItemInput,
  ReleaseRequestCreationOptions,
} from "@/features/releases/types";
import { formatCurrency } from "@/shared/lib/formatters";

const initialState: CreateReleaseRequestActionState = {
  status: "idle",
};

function formatDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function buildEmptyItem(
  employeeId = "",
  admissionDate = "",
  allocationStartDate = "",
  allocationEndDate?: string,
): CreateReleaseRequestItemInput {
  return {
    employeeId,
    releaseRubric: "ferias",
    competencyRef: "",
    employmentStartDate: formatDateInput(admissionDate),
    allocationStartDate: formatDateInput(allocationStartDate),
    allocationEndDate: formatDateInput(allocationEndDate),
    factOccurredOn: "",
    requestedAmount: 0,
    calculationMemory: {
      notes: "",
    },
    notes: "",
  };
}

interface CreateReleaseRequestFormProps {
  options: ReleaseRequestCreationOptions;
}

export function CreateReleaseRequestForm({
  options,
}: CreateReleaseRequestFormProps) {
  const initialContractId = options.contracts[0]?.id ?? "";
  const initialReleaseType: ReleaseType = "ferias";
  const [selectedContractId, setSelectedContractId] = useState(initialContractId);
  const [selectedReleaseType, setSelectedReleaseType] =
    useState<ReleaseType>(initialReleaseType);
  const [state, formAction, isPending] = useActionState(
    createReleaseRequestAction,
    initialState,
  );

  const employeeOptions = options.employeesByContract[selectedContractId] ?? [];
  const [items, setItems] = useState<CreateReleaseRequestItemInput[]>(() => {
    const firstEmployee = employeeOptions[0];
    return [
      buildEmptyItem(
        firstEmployee?.id ?? "",
        firstEmployee?.admissionDate ?? "",
        firstEmployee?.allocationStartDate ?? "",
        firstEmployee?.allocationEndDate,
      ),
    ];
  });

  const totalRequestedAmount = items.reduce(
    (total, item) => total + (Number(item.requestedAmount) || 0),
    0,
  );

  function updateItem(
    index: number,
    updater: (current: CreateReleaseRequestItemInput) => CreateReleaseRequestItemInput,
  ) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? updater(item) : item,
      ),
    );
  }

  function addItem() {
    const firstEmployee = employeeOptions[0];
    const allowedRubrics = getAllowedRubricsForReleaseType(selectedReleaseType);

    setItems((currentItems) => [
      ...currentItems,
      {
        ...buildEmptyItem(
          firstEmployee?.id ?? "",
          firstEmployee?.admissionDate ?? "",
          firstEmployee?.allocationStartDate ?? "",
          firstEmployee?.allocationEndDate,
        ),
        releaseRubric: allowedRubrics[0],
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function syncItemsForContext(
    nextEmployeeOptions: ReleaseRequestCreationOptions["employeesByContract"][string],
    nextReleaseType: ReleaseType,
  ) {
    const firstEmployee = nextEmployeeOptions[0];
    const allowedRubrics = getAllowedRubricsForReleaseType(nextReleaseType);

    setItems((currentItems) => {
      const itemsToSync =
        currentItems.length === 0
          ? [
              buildEmptyItem(
                firstEmployee?.id ?? "",
                firstEmployee?.admissionDate ?? "",
                firstEmployee?.allocationStartDate ?? "",
                firstEmployee?.allocationEndDate,
              ),
            ]
          : currentItems;

      return itemsToSync.map((item) => {
        const employee =
          nextEmployeeOptions.find((option) => option.id === item.employeeId) ??
          firstEmployee;

        return {
          ...item,
          employeeId: employee?.id ?? "",
          releaseRubric: allowedRubrics.includes(item.releaseRubric)
            ? item.releaseRubric
            : allowedRubrics[0],
          employmentStartDate: formatDateInput(employee?.admissionDate),
          allocationStartDate: formatDateInput(employee?.allocationStartDate),
          allocationEndDate: formatDateInput(employee?.allocationEndDate),
        };
      });
    });
  }

  if (!options.databaseEnabled) {
    return (
      <div className="rounded-[1.4rem] border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-4 text-sm leading-6 text-[var(--color-danger)]">
        A criacao de solicitacoes depende de `DATABASE_URL`. No modo em memoria,
        a tela continua somente leitura.
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
      <input
        type="hidden"
        name="itemsPayload"
        value={JSON.stringify(items)}
        readOnly
      />
      <input
        type="hidden"
        name="requestedTotalAmount"
        value={totalRequestedAmount.toFixed(2)}
        readOnly
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Contrato
          </span>
          <select
            name="contractId"
            value={selectedContractId}
            onChange={(event) => {
              const nextContractId = event.target.value;
              const nextEmployeeOptions =
                options.employeesByContract[nextContractId] ?? [];

              setSelectedContractId(nextContractId);
              syncItemsForContext(nextEmployeeOptions, selectedReleaseType);
            }}
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
            Tipo de liberacao
          </span>
          <select
            name="releaseType"
            value={selectedReleaseType}
            onChange={(event) => {
              const nextReleaseType = event.target.value as ReleaseType;

              setSelectedReleaseType(nextReleaseType);
              syncItemsForContext(employeeOptions, nextReleaseType);
            }}
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          >
            {RELEASE_TYPES.map((releaseType) => (
              <option key={releaseType} value={releaseType}>
                {releaseType.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          {state.fieldErrors?.releaseType ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.releaseType}
            </p>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Competencia inicial
          </span>
          <input
            type="text"
            name="competencyStart"
            placeholder="2026-03"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          />
          {state.fieldErrors?.competencyStart ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.competencyStart}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Competencia final
          </span>
          <input
            type="text"
            name="competencyEnd"
            placeholder="2026-03"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
          />
          {state.fieldErrors?.competencyEnd ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.fieldErrors.competencyEnd}
            </p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Fundamento
        </span>
        <textarea
          name="factualBasis"
          rows={3}
          placeholder="Descreva o fato gerador e o recorte do pedido."
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
        />
        {state.fieldErrors?.factualBasis ? (
          <p className="text-sm text-[var(--color-danger)]">
            {state.fieldErrors.factualBasis}
          </p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Observacoes internas
        </span>
        <textarea
          name="notes"
          rows={2}
          placeholder="Informacoes complementares para a fila interna."
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
        />
      </label>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              Itens da solicitacao
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Cada item representa empregado, rubrica, competencia e memoria
              proporcional do fato gerador.
            </p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)]"
          >
            Adicionar item
          </button>
        </div>

        {state.fieldErrors?.items ? (
          <p className="text-sm text-[var(--color-danger)]">
            {state.fieldErrors.items}
          </p>
        ) : null}

        <div className="grid gap-4">
          {items.map((item, index) => {
            const itemErrors = state.fieldErrors?.itemErrors?.[index];
            const allowedRubrics = getAllowedRubricsForReleaseType(selectedReleaseType);

            return (
              <div
                key={`${index}-${item.employeeId || "novo"}`}
                className="rounded-[1.5rem] border border-black/8 bg-[var(--color-surface)] px-4 py-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <strong className="text-sm text-[var(--color-ink)]">
                    Item {index + 1}
                  </strong>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-sm font-medium text-[var(--color-danger)] disabled:opacity-40"
                  >
                    Remover
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Empregado
                    </span>
                    <select
                      value={item.employeeId}
                      onChange={(event) => {
                        const employee = employeeOptions.find(
                          (option) => option.id === event.target.value,
                        );

                        updateItem(index, (current) => ({
                          ...current,
                          employeeId: event.target.value,
                          employmentStartDate: formatDateInput(
                            employee?.admissionDate,
                          ),
                          allocationStartDate: formatDateInput(
                            employee?.allocationStartDate,
                          ),
                          allocationEndDate: formatDateInput(
                            employee?.allocationEndDate,
                          ),
                        }));
                      }}
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
                    {itemErrors?.employeeId ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.employeeId}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Rubrica
                    </span>
                    <select
                      value={item.releaseRubric}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          releaseRubric: event.target.value as CreateReleaseRequestItemInput["releaseRubric"],
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                    >
                      {allowedRubrics.map((rubric) => (
                        <option key={rubric} value={rubric}>
                          {rubric.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    {itemErrors?.releaseRubric ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.releaseRubric}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Competencia do item
                    </span>
                    <input
                      type="text"
                      value={item.competencyRef}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          competencyRef: event.target.value,
                        }))
                      }
                      placeholder="2026-03"
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                    />
                    {itemErrors?.competencyRef ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.competencyRef}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Data de admissao
                    </span>
                    <input
                      type="date"
                      value={item.employmentStartDate}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          employmentStartDate: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                    />
                    {itemErrors?.employmentStartDate ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.employmentStartDate}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Inicio da alocacao
                    </span>
                    <input
                      type="date"
                      value={item.allocationStartDate}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          allocationStartDate: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                    />
                    {itemErrors?.allocationStartDate ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.allocationStartDate}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Fim da alocacao
                    </span>
                    <input
                      type="date"
                      value={item.allocationEndDate ?? ""}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          allocationEndDate: event.target.value || undefined,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Data do fato gerador
                    </span>
                    <input
                      type="date"
                      value={item.factOccurredOn}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          factOccurredOn: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                    />
                    {itemErrors?.factOccurredOn ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.factOccurredOn}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Valor solicitado
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.requestedAmount || ""}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          requestedAmount: Number(event.target.value),
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                    />
                    {itemErrors?.requestedAmount ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.requestedAmount}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2 xl:col-span-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Memoria de calculo
                    </span>
                    <textarea
                      rows={2}
                      value={item.calculationMemory?.notes ?? ""}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          calculationMemory: {
                            ...current.calculationMemory,
                            notes: event.target.value,
                          },
                        }))
                      }
                      placeholder="Descreva base, fracao proporcional e referencia do calculo."
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      Observacoes do item
                    </span>
                    <textarea
                      rows={2}
                      value={item.notes ?? ""}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                    />
                    {itemErrors?.notes ? (
                      <p className="text-sm text-[var(--color-danger)]">
                        {itemErrors.notes}
                      </p>
                    ) : null}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {state.fieldErrors?.requestedTotalAmount ? (
        <p className="text-sm text-[var(--color-danger)]">
          {state.fieldErrors.requestedTotalAmount}
        </p>
      ) : null}

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
          Total solicitado:{" "}
          <strong className="text-[var(--color-ink)]">
            {formatCurrency(totalRequestedAmount)}
          </strong>
        </p>
        <button
          type="submit"
          disabled={isPending || employeeOptions.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {isPending ? "Enviando..." : "Enviar solicitacao"}
        </button>
      </div>
    </form>
  );
}
