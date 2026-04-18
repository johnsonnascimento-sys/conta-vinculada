import { cookies } from "next/headers";
import type { AuthSession } from "@/features/auth/types";
import { createSignedToken, verifySignedToken } from "@/server/auth/crypto";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/server/auth/constants";

export async function createSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  scope: string;
}) {
  const payload: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    scope: user.scope,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await createSignedToken(JSON.stringify(payload));
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const rawPayload = await verifySignedToken(token);

  if (!rawPayload) {
    return null;
  }

  const payload = JSON.parse(rawPayload) as AuthSession;

  if (payload.exp * 1000 < Date.now()) {
    return null;
  }

  return payload;
}
