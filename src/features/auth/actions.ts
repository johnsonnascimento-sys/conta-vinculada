"use server";

import { redirect } from "next/navigation";
import { destroySession, createSession } from "@/server/auth/session";
import { authenticateWithCredentials } from "@/server/auth/credentials";
import type { AuthState } from "@/features/auth/types";

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return {
      error: "Informe e-mail institucional e senha.",
    };
  }

  const user = await authenticateWithCredentials(email, password);

  if (!user) {
    return {
      error: "Credenciais inválidas.",
    };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    scope: user.scope,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
