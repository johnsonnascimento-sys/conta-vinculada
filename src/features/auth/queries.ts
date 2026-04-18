import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { getUsers } from "@/server/repositories/platform.repository";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const users = await getUsers();
  return users.find((item) => item.id === session.userId) ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
