import type { AppUser } from "@/features/platform/types";
import { canAccessRoute } from "@/features/auth/permissions";

function canOperateReconciliation(user: AppUser) {
  if (!canAccessRoute(user.role, "/dashboard/reconciliation")) {
    return false;
  }

  return user.role === "Administrador do órgão" || user.role === "Financeiro";
}

export function canCloseCompetencyReconciliation(user: AppUser) {
  return canOperateReconciliation(user);
}

export function canReopenCompetencyReconciliation(user: AppUser) {
  return canOperateReconciliation(user);
}
