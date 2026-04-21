import type {
  AppUser,
  ReleaseItemDecision,
  ReleaseRequestStatus,
} from "@/features/platform/types";
import { canAccessRoute } from "@/features/auth/permissions";

const REVIEWABLE_RELEASE_REQUEST_STATUSES = new Set<ReleaseRequestStatus>([
  "em_elaboracao",
  "enviada",
  "em_analise",
]);

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

export function canApproveReleaseRequestAdministratively(user: AppUser) {
  if (!canAccessRoute(user.role, "/dashboard/releases")) {
    return false;
  }

  if (user.role === "Administrador do órgão" || user.role === "Financeiro") {
    return true;
  }

  return false;
}

export function isReviewableReleaseRequestStatus(
  status: ReleaseRequestStatus,
) {
  return REVIEWABLE_RELEASE_REQUEST_STATUSES.has(status);
}

export function canReviewReleaseRequestItem(
  status: ReleaseRequestStatus,
  decision: ReleaseItemDecision,
) {
  return isReviewableReleaseRequestStatus(status) && decision === "pendente";
}
