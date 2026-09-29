import { requireAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/shell";
import { loadUnreadMessagesCount } from "@/lib/admin/data";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const unreadCount = await loadUnreadMessagesCount();
  return <AdminShell unreadMessagesCount={unreadCount}>{children}</AdminShell>;
}
