import { loadContactMessages } from "@/lib/admin/data";
import { MessagesManager } from "@/components/admin/messages-manager";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { messages, tableMissing } = await loadContactMessages();

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Communication</p>
          <h1>Messages</h1>
          <p>Read and manage messages received through your portfolio contact form.</p>
        </div>
      </div>
      <MessagesManager
        initialMessages={messages}
        tableMissing={tableMissing}
      />
    </>
  );
}
