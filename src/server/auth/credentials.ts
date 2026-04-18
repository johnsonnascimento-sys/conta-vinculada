import { getUsers } from "@/server/repositories/platform.repository";

const DEFAULT_PASSWORD = process.env.AUTH_DEV_PASSWORD ?? "admin123";

export async function authenticateWithCredentials(email: string, password: string) {
  const users = await getUsers();
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return null;
  }

  if (password !== DEFAULT_PASSWORD) {
    return null;
  }

  return user;
}
