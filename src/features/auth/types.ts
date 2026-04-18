import type { AppUser } from "@/features/platform/types";

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  scope: string;
  exp: number;
}

export interface AuthState {
  error?: string;
}

export type AuthorizedUser = AppUser;
