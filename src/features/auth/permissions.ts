const roleRoutes: Record<string, string[]> = {
  "Administrador do órgão": [
    "/dashboard",
    "/dashboard/contracts",
    "/dashboard/releases",
    "/dashboard/reconciliation",
    "/dashboard/audit",
    "/dashboard/admin",
  ],
  Analista: [
    "/dashboard",
    "/dashboard/contracts",
    "/dashboard/releases",
    "/dashboard/audit",
  ],
  Financeiro: [
    "/dashboard",
    "/dashboard/contracts",
    "/dashboard/releases",
    "/dashboard/reconciliation",
  ],
  "Auditoria interna": [
    "/dashboard",
    "/dashboard/contracts",
    "/dashboard/audit",
    "/dashboard/reconciliation",
  ],
};

export function getAllowedRoutes(role: string) {
  return roleRoutes[role] ?? ["/dashboard"];
}

export function canAccessRoute(role: string, pathname: string) {
  return getAllowedRoutes(role).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
