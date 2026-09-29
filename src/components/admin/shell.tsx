"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  UserRound,
  FolderOpen,
  Layers,
  BookOpen,
  Mail,
  MessageSquare,
  Link2,
  Settings2,
  ChartNoAxesColumn,
  Award,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { AdminNoticeProvider } from "./notice";
import { logout } from "@/lib/admin/actions";
import { initialResult } from "@/lib/admin/schema";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/skills", label: "Skills", icon: Layers },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/statistics", label: "Statistics", icon: ChartNoAxesColumn },
  { href: "/admin/about", label: "About", icon: BookOpen },
  { href: "/admin/contact", label: "Contact", icon: Mail },
  { href: "/admin/socials", label: "Social links", icon: Link2 },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

export function AdminShell({
  children,
  unreadMessagesCount = 0,
}: {
  children: React.ReactNode;
  unreadMessagesCount?: number;
}) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const active = navigation.find((item) =>
    item.href === "/admin"
      ? pathname === item.href
      : pathname.startsWith(item.href),
  );
  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);
  function navigationContent() {
    return (
      <>
        <Link href="/admin" className="admin-brand">
          RBNB<span>Portfolio manager</span>
        </Link>
        <p className="admin-nav-caption">Workspace</p>
        <nav aria-label="Admin navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active?.href === href ? "page" : undefined}
              onClick={() => drawer.current?.close()}
            >
              <Icon size={18} aria-hidden="true" />
              <span style={{ flex: 1 }}>{label}</span>
              {href === "/admin/messages" && unreadMessagesCount > 0 && (
                <span className="admin-nav-badge" aria-label={`${unreadMessagesCount} unread`}>
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={17} aria-hidden="true" />
            View portfolio<span className="sr-only"> (opens a new tab)</span>
          </Link>
          <LogoutButton />
        </div>
      </>
    );
  }
  return (
    <AdminNoticeProvider>
    <div className="admin-shell">
      <aside className="admin-sidebar">{navigationContent()}</aside>
      <dialog
        ref={drawer}
        className="admin-drawer"
        aria-label="Admin navigation menu"
      >
        <button
          className="admin-icon-button admin-drawer-close"
          type="button"
          aria-label="Close navigation"
          onClick={() => drawer.current?.close()}
        >
          <X size={21} />
        </button>
        {navigationContent()}
      </dialog>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <button
              type="button"
              className="admin-icon-button admin-menu-button"
              aria-label="Open admin navigation"
              onClick={() => drawer.current?.showModal()}
            >
              <Menu size={21} />
            </button>
            <span className="admin-breadcrumb">
              Workspace <span>/</span> {active?.label || "Portfolio"}
            </span>
          </div>
          <span className="admin-owner-badge">
            <span />
            Owner access
          </span>
        </header>
        <main id="main-content" className="admin-main">
          {children}
        </main>
      </div>
    </div>
    </AdminNoticeProvider>
  );
}

function LogoutButton() {
  const [state, action, pending] = useActionState(logout, initialResult);
  return (
    <form action={action}>
      <button type="submit" disabled={pending}>
        <LogOut size={17} aria-hidden="true" />
        {pending ? "Signing out…" : "Log out"}
      </button>
      {state.message && (
        <p role="alert" className="admin-field-error">
          {state.message}
        </p>
      )}
    </form>
  );
}
