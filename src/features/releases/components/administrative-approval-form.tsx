"use client";

import { useActionState, useState } from "react";
import type {
  AdministrativeApprovalDecision,
  ReleaseRequestDecisionState,
} from "@/features/platform/types";
import { approveReleaseRequestAdministrativelyAction } from "@/features/releases/actions";
import type { AdministrativeApproveReleaseRequestActionState } from "@/features/releases/types";
import { getAllowedAdministrativeApprovalDecisions } from "@/features/releases/workflow";

const initialState: AdministrativeApproveReleaseRequestActionState = {
  status: "idle",
};

interface AdministrativeApprovalFormProps {
  requestId: string;
  decisionState: ReleaseRequestDecisionState;
}

function getAllowedDecisions(
  decisionState: ReleaseRequestDecisionState,
): AdministrativeApprovalDecision[] {
  return getAllowedAdministrativeApprovalDecisions(decisionState);
}

function getDecisionLabel(decision: AdministrativeApprovalDecision) {
  if (decision === "aprovar") {
    return "Aprovar administrativamente";
  }

  if (decision === "aprovar_parcial") {
    return "Aprovar parcialmente";
  }

  return "Rejeitar consolidação";
}

export function AdministrativeApprovalForm({
  requestId,
  decisionState,
}: AdministrativeApprovalFormProps) {
  const allowedDecisions = getAllowedDecisions(decisionState);
  const [decision, setDecision] = useState<AdministrativeApprovalDecision>(
    allowedDecisions[0] ?? "aprovar",
  );
  const [state, formAction, isPending] = useActionState(
    approveReleaseRequestAdministrativelyAction,
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
          Decisão administrativa
        </span>
        <select
          name="decision"
          value={decision}
          onChange={(event) =>
            setDecision(event.target.value as AdministrativeApprovalDecision)
          }
          className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
        >
          {allowedDecisions.map((allowedDecision) => (
            <option key={allowedDecision} value={allowedDecision}>
              {getDecisionLabel(allowedDecision)}
            </option>
          ))}
        </select>
        {state.fieldErrors?.decision ? (
          <p className="text-sm text-[var(--color-danger)]">
            {state.fieldErrors.decision}
          </p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          Fundamentação da consolidação
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Obrigatória para aprovação parcial ou rejeição."
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
          Esta etapa consolida administrativamente a solicitação, mas ainda não
          executa a liberação financeira.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {isPending ? "Registrando..." : "Registrar aprovação"}
        </button>
      </div>
    </form>
  );
}
