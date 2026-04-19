import type { AppUser } from "@/features/platform/types";
import { canAccessRoute } from "@/features/auth/permissions";

export function canInitiateReleaseRequest(user: AppUser, contractCode: string) {
  if (!canAccessRoute(user.role, "/dashboard/releases")) {
    return false;
  }

  if (user.role === "Administrador do Ã³rgÃ£o" || user.role === "Financeiro") {
    return true;
  }

  if (user.role === "Analista") {
    return user.scope === contractCode;
  }

  return false;
}
