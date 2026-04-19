import { requireCurrentUser } from "@/features/auth/queries";
import { getAppShellState } from "@/features/shell/queries";
import { getTenant } from "@/server/repositories/platform.repository";
import { Sidebar } from "@/shared/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [shell, user, tenant] = await Promise.all([
    getAppShellState(),
    requireCurrentUser(),
    getTenant(),
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#ece4d6_0%,_#e0d6c5_100%)] px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid max-w-[1700px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar pathname={shell.pathname} user={user} tenant={tenant} />
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
