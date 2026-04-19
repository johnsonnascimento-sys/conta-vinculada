import type { AppUser } from "@/features/platform/types";
import { canAccessRoute } from "@/features/auth/permissions";

function canOperateReleaseRequest(user: AppUser, contractCode: string) {
  if (!canAccessRoute(user.role, "/dashboard/releases")) {
    return false;
  }

  if (user.role === "Administrador do órgão" || user.role === "Financeiro") {
    return true;
  }

  if (user.role === "Analista") {
    return user.scope === contractCode;
  }

  return false;
}

export function canInitiateReleaseRequest(user: AppUser, contractCode: string) {
  return canOperateReleaseRequest(user, contractCode);
}

export function canReviewReleaseRequest(user: AppUser, contractCode: string) {
  return canOperateReleaseRequest(user, contractCode);
}
