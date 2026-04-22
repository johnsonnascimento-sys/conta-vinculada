import assert from "node:assert/strict";
import test from "node:test";
import { serializeReconciliation } from "@/server/db/serializers";

test("serializeReconciliation preserves occurrences and derives ordered history", () => {
  const reconciliation = serializeReconciliation({
    id: "rec-test",
    contractId: "contract-1",
    competency: {
      id: "comp-1",
      competency: "2026-03",
      status: "reaberta",
      processedAt: new Date("2026-04-02T18:10:00Z"),
      closedAt: new Date("2026-04-03T10:00:00Z"),
      closedBy: "Rafaela Vasques",
      closureJustification: "Fechamento anterior sem pendencias.",
      reopenedAt: new Date("2026-04-04T11:00:00Z"),
      reopenedBy: "Beatriz Campos",
      reopeningJustification: "Reavaliacao necessaria.",
      operationalOccurrences: [
        {
          id: "occ-2",
          type: "reabertura_controlada",
          actor: "Beatriz Campos",
          description: "Reabertura controlada registrada.",
          happenedAt: "2026-04-04T11:00:00Z",
        },
        {
          id: "occ-1",
          type: "fechamento_formal",
          actor: "Rafaela Vasques",
          description: "Fechamento formal registrado.",
          happenedAt: "2026-04-03T10:00:00Z",
        },
      ],
    },
    bankBalance: { toNumber: () => 1000 },
    provisionBalance: { toNumber: () => 900 },
    approvedPendingExecution: { toNumber: () => 0 },
    explainedDifference: { toNumber: () => 100 },
    unexplainedDifference: { toNumber: () => 0 },
    differenceType: "explicada",
  });

  assert.equal(reconciliation.occurrences.length, 2);
  assert.deepEqual(
    reconciliation.history.timeline.map((event) => event.id),
    ["processamento-2026-04-02T18:10:00.000Z", "occ-1", "occ-2"],
  );
  assert.equal(reconciliation.history.recommendedAction, "reavaliar_apos_reabertura");
});
