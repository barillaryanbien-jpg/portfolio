"use client";

import { useState, useTransition, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
  CheckCircle,
  Eye,
  AlertCircle,
  Search,
  X,
  Clock,
  User,
  Inbox,
} from "lucide-react";
import type { AdminContactMessage } from "@/lib/admin/data";
import {
  markContactMessageRead,
  deleteContactMessage,
} from "@/lib/admin/actions";
import { useAdminNotice } from "./notice";

export function MessagesManager({
  initialMessages,
  tableMissing = false,
}: {
  initialMessages: AdminContactMessage[];
  tableMissing?: boolean;
}) {
  const router = useRouter();
  const notify = useAdminNotice();
  const [messages, setMessages] = useState<AdminContactMessage[]>(initialMessages);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<AdminContactMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  // Dialog ref for delete confirmation
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [messageToDelete, setMessageToDelete] = useState<AdminContactMessage | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const deleteTitleId = useId();

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const filteredMessages = messages.filter((msg) => {
    if (filter === "unread" && msg.isRead) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q)
    );
  });

  async function handleToggleRead(msg: AdminContactMessage, newStatus: boolean) {
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: newStatus } : m)),
    );
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage((prev) => prev ? { ...prev, isRead: newStatus } : null);
    }

    startTransition(async () => {
      const res = await markContactMessageRead(msg.id, newStatus);
      if (res.status === "error") {
        notify(res.message || "Failed to update status.");
        // Rollback
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: !newStatus } : m)),
        );
      } else {
        notify(newStatus ? "Marked as read." : "Marked as unread.");
        router.refresh();
      }
    });
  }

  function openMessageDetail(msg: AdminContactMessage) {
    setSelectedMessage(msg);
    // If opening an unread message, mark it as read automatically
    if (!msg.isRead) {
      handleToggleRead(msg, true);
    }
  }

  function promptDelete(msg: AdminContactMessage) {
    setMessageToDelete(msg);
    setDeleteError("");
    deleteDialogRef.current?.showModal();
  }

  async function confirmDelete() {
    if (!messageToDelete) return;
    setDeletePending(true);
    setDeleteError("");

    const targetId = messageToDelete.id;
    const res = await deleteContactMessage(targetId);

    setDeletePending(false);
    if (res.status === "error") {
      setDeleteError(res.message || "Failed to delete message.");
    } else {
      deleteDialogRef.current?.close();
      setMessages((prev) => prev.filter((m) => m.id !== targetId));
      if (selectedMessage?.id === targetId) {
        setSelectedMessage(null);
      }
      notify("Message deleted permanently.");
      router.refresh();
    }
  }

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return iso;
    }
  }

  if (tableMissing) {
    return (
      <div className="admin-panel">
        <div className="admin-notice warning" style={{ display: "block", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
            <AlertCircle size={22} style={{ color: "#b36b00", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Database Migration Required</h3>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--admin-muted)" }}>
                The <code>contact_messages</code> table does not exist in your Supabase project yet.
                To activate the Contact Message system, please run the SQL migration below in your Supabase SQL Editor:
              </p>
            </div>
          </div>
          <pre
            style={{
              background: "#24201b",
              color: "#f7f2e9",
              padding: "16px",
              borderRadius: "8px",
              fontSize: "12px",
              overflowX: "auto",
              lineHeight: 1.5,
            }}
          >
            {`-- Run in Supabase SQL Editor:
-- File: supabase/migrations/012_create_contact_messages.sql

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  email text not null check (length(trim(email)) between 5 and 254 and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  subject text not null check (length(trim(subject)) between 1 and 200),
  message text not null check (length(trim(message)) between 1 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy public_insert_contact_messages on public.contact_messages
  for insert to anon, authenticated with check (true);
grant insert on public.contact_messages to anon, authenticated;

create policy owner_manage_contact_messages on public.contact_messages
  for all to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));
grant select, update, delete on public.contact_messages to authenticated;
revoke select, update, delete on public.contact_messages from anon;

create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);
create index if not exists contact_messages_unread_idx on public.contact_messages(created_at desc) where not is_read;`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-panel">
        <div className="admin-panel-heading admin-collection-heading" style={{ flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Received Messages</h2>
            <p>
              {messages.length} total {messages.length === 1 ? "message" : "messages"}
              {unreadCount > 0 ? ` • ${unreadCount} unread` : " • all caught up"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Filter Tabs */}
            <div className="admin-filter-tabs">
              <button
                type="button"
                className={`admin-filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({messages.length})
              </button>
              <button
                type="button"
                className={`admin-filter-tab ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {/* Search Input */}
            <div className="admin-search-wrapper">
              <Search size={14} className="admin-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search messages…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
                aria-label="Search received messages"
              />
            </div>
          </div>
        </div>

        {filteredMessages.length ? (
          <ul className="admin-record-list admin-message-list">
            {filteredMessages.map((msg) => {
              const isUnread = !msg.isRead;
              return (
                <li
                  key={msg.id}
                  className={`admin-message-item ${isUnread ? "is-unread" : ""}`}
                  style={{
                    cursor: "pointer",
                    transition: "background 0.15s, border-color 0.15s",
                    position: "relative",
                  }}
                  onClick={() => openMessageDetail(msg)}
                >
                  {/* Status Indicator */}
                  <div className="admin-message-indicator" title={isUnread ? "Unread message" : "Read message"}>
                    {isUnread ? (
                      <span className="unread-dot" aria-label="Unread message" />
                    ) : (
                      <MailOpen size={16} className="read-icon" aria-hidden="true" />
                    )}
                  </div>

                  {/* Message Summary */}
                  <div className="admin-record-info" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                      <h3 style={{ fontWeight: isUnread ? 700 : 500, color: isUnread ? "var(--ink)" : "inherit" }}>
                        {msg.name}
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>
                        &lt;{msg.email}&gt;
                      </span>
                      <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--admin-muted)", whiteSpace: "nowrap" }}>
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>

                    <p style={{ fontWeight: isUnread ? 600 : 400, marginTop: "4px", color: isUnread ? "#3a2d1d" : "inherit" }}>
                      {msg.subject}
                    </p>
                    <p
                      style={{
                        marginTop: "2px",
                        color: "var(--admin-muted)",
                        fontSize: "12px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {msg.message}
                    </p>

                    <div className="admin-record-badges" style={{ marginTop: "6px" }}>
                      {isUnread ? (
                        <span className="admin-badge" style={{ background: "#fbf0df", color: "#8a5814", fontWeight: 600 }}>
                          Unread
                        </span>
                      ) : (
                        <span className="admin-badge" style={{ background: "#edeae3", color: "#6e6d68" }}>
                          Read
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div
                    className="admin-record-actions"
                    onClick={(e) => e.stopPropagation()}
                    style={{ alignSelf: "center", marginLeft: "12px" }}
                  >
                    <button
                      type="button"
                      className="admin-button"
                      onClick={() => openMessageDetail(msg)}
                      aria-label={`View message from ${msg.name}`}
                    >
                      <Eye size={15} aria-hidden="true" />
                      View
                    </button>
                    <button
                      type="button"
                      className="admin-button"
                      disabled={isPending}
                      onClick={() => handleToggleRead(msg, !msg.isRead)}
                      aria-label={msg.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {msg.isRead ? (
                        <>
                          <Mail size={15} aria-hidden="true" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <CheckCircle size={15} aria-hidden="true" />
                          Mark Read
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button-danger-outline"
                      onClick={() => promptDelete(msg)}
                      aria-label={`Delete message from ${msg.name}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="admin-empty">
            <span>
              <Inbox size={29} aria-hidden="true" />
            </span>
            <h3>
              {searchQuery
                ? "No matching messages found"
                : filter === "unread"
                ? "No unread messages"
                : "No messages yet"}
            </h3>
            <p>
              {searchQuery
                ? `No messages matched "${searchQuery}". Try a different term or clear the search.`
                : filter === "unread"
                ? "All messages have been marked as read."
                : "Messages submitted through your portfolio contact form will arrive here."}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="admin-button"
                style={{ marginTop: "12px" }}
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Message Detail View Dialog */}
      {selectedMessage && (
        <dialog
          className="admin-dialog admin-message-dialog"
          open
          aria-labelledby="message-detail-title"
          style={{
            maxWidth: "680px",
            width: "92vw",
            padding: "0",
            borderRadius: "16px",
            boxShadow: "0 18px 48px rgba(0,0,0,0.18)",
            border: "1px solid var(--admin-border)",
            background: "#fff",
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--admin-border)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              background: "#faf8f4",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--admin-muted)",
                  margin: 0,
                }}
              >
                Message Details
              </p>
              <h2
                id="message-detail-title"
                style={{
                  fontSize: "19px",
                  fontWeight: 650,
                  margin: "4px 0 0",
                  color: "#24201b",
                  lineHeight: 1.3,
                }}
              >
                {selectedMessage.subject}
              </h2>
            </div>
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Close message view"
              onClick={() => setSelectedMessage(null)}
              style={{ flexShrink: 0 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Sender metadata card */}
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--admin-border)",
              background: "#fff",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              fontSize: "13px",
            }}
          >
            <div>
              <span style={{ color: "var(--admin-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> From:
              </span>
              <strong style={{ display: "block", marginTop: "2px", color: "#24201b" }}>
                {selectedMessage.name}
              </strong>
            </div>

            <div>
              <span style={{ color: "var(--admin-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} /> Email:
              </span>
              <a
                href={`mailto:${selectedMessage.email}`}
                style={{
                  display: "block",
                  marginTop: "2px",
                  color: "var(--admin-accent)",
                  fontWeight: 500,
                  textDecoration: "underline",
                  overflowWrap: "anywhere",
                }}
              >
                {selectedMessage.email}
              </a>
            </div>

            <div>
              <span style={{ color: "var(--admin-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} /> Received:
              </span>
              <span style={{ display: "block", marginTop: "2px", color: "#24201b" }}>
                {formatDate(selectedMessage.createdAt)}
              </span>
            </div>
          </div>

          {/* Message Body Content */}
          <div style={{ padding: "24px", maxHeight: "50vh", overflowY: "auto" }}>
            <p
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--admin-muted)",
                marginBottom: "8px",
              }}
            >
              Message Content:
            </p>
            <div
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                fontSize: "14px",
                color: "#292b28",
                background: "#f9f8f4",
                padding: "16px 20px",
                borderRadius: "10px",
                border: "1px solid var(--admin-border)",
                fontFamily: "inherit",
              }}
            >
              {selectedMessage.message}
            </div>
          </div>

          {/* Dialog Actions / Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--admin-border)",
              background: "#faf8f4",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
            }}
          >
            {/* Primary Reply button */}
            <a
              href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
              className="admin-button admin-button-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <Reply size={16} aria-hidden="true" />
              Reply via Email
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                className="admin-button"
                onClick={() => handleToggleRead(selectedMessage, !selectedMessage.isRead)}
              >
                {selectedMessage.isRead ? "Mark as unread" : "Mark as read"}
              </button>

              <button
                type="button"
                className="admin-button admin-button-danger-outline"
                onClick={() => promptDelete(selectedMessage)}
              >
                <Trash2 size={15} aria-hidden="true" />
                Delete
              </button>

              <button
                type="button"
                className="admin-button"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <dialog
        ref={deleteDialogRef}
        className="admin-dialog"
        aria-labelledby={deleteTitleId}
        onCancel={(e) => {
          if (deletePending) e.preventDefault();
        }}
      >
        <h2 id={deleteTitleId}>
          Delete message from {messageToDelete?.name}?
        </h2>
        <p>
          This action cannot be undone. The message will be permanently deleted from your database.
        </p>
        {deleteError && (
          <p className="admin-notice error" role="alert">
            {deleteError}
          </p>
        )}
        <div className="admin-dialog-actions">
          <button
            type="button"
            className="admin-button"
            disabled={deletePending}
            onClick={() => deleteDialogRef.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-button admin-button-danger"
            disabled={deletePending}
            onClick={confirmDelete}
          >
            {deletePending ? "Deleting…" : "Confirm Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
