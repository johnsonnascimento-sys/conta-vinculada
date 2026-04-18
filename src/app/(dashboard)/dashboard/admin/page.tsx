import { getUsers } from "@/server/repositories/platform.repository";
import type { AppUser } from "@/features/platform/types";
import { Badge } from "@/shared/components/ui/badge";
import { TableCard } from "@/shared/components/ui/table-card";

export default async function AdminPage() {
  const users = await getUsers();
  return (
    <TableCard
      title="Administração e permissões"
      description="Exemplo inicial de governança de acesso com MFA obrigatório para perfis sensíveis."
    >
      <div className="overflow-hidden rounded-[1.4rem] border border-black/8">
        <table className="min-w-full divide-y divide-black/8 text-left">
          <thead className="bg-[var(--color-surface)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Escopo</th>
              <th className="px-4 py-3">MFA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8 bg-white">
            {users.map((user: AppUser) => (
              <tr key={user.id}>
                <td className="px-4 py-4 font-semibold text-[var(--color-ink)]">{user.name}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-muted)]">{user.role}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-muted)]">{user.scope}</td>
                <td className="px-4 py-4">
                  <Badge tone={user.mfaEnabled ? "success" : "danger"}>
                    {user.mfaEnabled ? "ativo" : "desativado"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}
