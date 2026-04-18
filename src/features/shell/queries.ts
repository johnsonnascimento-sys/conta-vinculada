import { headers } from "next/headers";

export async function getAppShellState() {
  const headerStore = await headers();
  return {
    pathname: headerStore.get("x-pathname") ?? "/dashboard",
  };
}
