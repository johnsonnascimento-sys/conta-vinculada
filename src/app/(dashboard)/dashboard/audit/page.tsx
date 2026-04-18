import { getAuditEvents } from "@/server/repositories/platform.repository";
import type { AuditEvent } from "@/features/platform/types";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";

export default async function AuditPage() {
  const auditEvents = await getAuditEvents();
  return (
    <TableCard
      title="Auditoria"
      description="Linha do tempo de decisões, reaberturas, glosas e diligências executadas no sistema."
    >
      <div className="space-y-3">
        {auditEvents.map((event: AuditEvent) => (
          <div key={event.id} className="rounded-[1.5rem] border border-black/8 bg-white px-5 py-5 shadow-[0_16px_30px_rgba(17,32,47,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">{event.action}</h2>
                <p className="text-sm text-[var(--color-muted)]">
                  {event.actor} · {event.happenedAt}
                </p>
              </div>
              <Badge tone="neutral">{event.entity}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{event.details}</p>
          </div>
        ))}
      </div>
    </TableCard>
  );
}
