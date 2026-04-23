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
    items: [
      {
        id: "rec-item-001",
        justification: "Rendimento bancario identificado.",
        createdAt: new Date("2026-04-04T12:00:00Z"),
        bankEntry: {
          id: "entry-001",
          description: "Rendimento bancario de marco",
          type: "rendimento",
          amount: { toNumber: () => 100 },
          occurredOn: new Date("2026-04-01T00:00:00Z"),
        },
      },
    ],
  });

  assert.equal(reconciliation.occurrences.length, 2);
  assert.equal(reconciliation.items.length, 1);
  assert.equal(reconciliation.items[0].bankEntryId, "entry-001");
  assert.equal(reconciliation.differenceSummary.explainedItemsAmount, 100);
  assert.equal(reconciliation.differenceSummary.explainedCoverageState, "itemizacao_completa");
  assert.equal(reconciliation.differenceSummary.explainedCoveragePercentage, 100);
  assert.equal(
    reconciliation.differenceSummary.unitemizedBalanceOrigin,
    "sem_saldo_remanescente",
  );
  assert.equal(reconciliation.differenceSummary.unitemizedBalancePriority, "baixa");
  assert.equal(reconciliation.differenceSummary.requiresDirectedReview, false);
  assert.equal(reconciliation.differenceReading.profile, "mista");
  assert.deepEqual(
    reconciliation.history.timeline.map((event) => event.id),
    ["processamento-2026-04-02T18:10:00.000Z", "occ-1", "occ-2"],
  );
  assert.equal(reconciliation.history.recommendedAction, "reavaliar_apos_reabertura");
  assert.equal(reconciliation.qualification.classification, "justificativa_sensivel");
});
