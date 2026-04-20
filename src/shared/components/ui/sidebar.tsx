import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import { getAllowedRoutes } from "@/features/auth/permissions";
import type { AppUser, Tenant } from "@/features/platform/types";
import { cn } from "@/shared/lib/utils";

const allNavigation = [
  { href: "/dashboard", label: "Painel institucional" },
  { href: "/dashboard/contracts", label: "Contratos" },
  { href: "/dashboard/releases", label: "Liberações" },
  { href: "/dashboard/reconciliation", label: "Conciliação" },
  { href: "/dashboard/audit", label: "Auditoria" },
  { href: "/dashboard/admin", label: "Administração" },
  { href: "/dashboard/manual", label: "Manual do usuario" },
];

interface SidebarProps {
  pathname: string;
  user: AppUser;
  tenant: Tenant;
}

export function Sidebar({ pathname, user, tenant }: SidebarProps) {
  const navigation = allNavigation.filter((item) =>
    getAllowedRoutes(user.role).some(
      (route) => item.href === route || item.href.startsWith(`${route}/`),
    ),
  );

  return (
    <aside className="rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,_rgba(20,30,43,0.98),_rgba(37,54,70,0.96))] p-5 text-white shadow-[0_24px_70px_rgba(17,32,47,0.24)]">
      <div className="mb-8 space-y-3">
        <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white/80">
          SaaS institucional
        </span>
        <div>
          <p className="text-sm text-white/70">{tenant.jurisdiction}</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">{tenant.name}</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center rounded-2xl px-4 text-sm font-medium transition",
                isActive
                  ? "bg-[#d9b26f] text-[#17212b]"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/78">
        <p className="font-semibold text-white">{user.name}</p>
        <p className="text-white/65">{user.role}</p>
        <p className="mt-1 text-white/55">{user.email}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/55">
          Escopo: {user.scope}
        </p>
        <form action={logoutAction} className="mt-4">
          <button
            type="submit"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-white/14 px-4 font-semibold text-white transition hover:bg-white/10"
          >
            Encerrar sessão
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/78">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
          Premissa operacional
        </p>
        <p className="mt-2 leading-6">
          Saldo individual é apenas provisão gerencial. A conta bancária permanece única
          para o contrato.
        </p>
      </div>
    </aside>
  );
}

