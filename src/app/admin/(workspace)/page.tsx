import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Minus,
  FolderOpen,
  Layers,
  Link2,
  MessageSquare,
  UserRound,
} from "lucide-react";
import { loadDashboard } from "@/lib/admin/data";

export default async function DashboardPage() {
  const data = await loadDashboard();
  const checks = [
    {
      label: "Profile image",
      ready: !!data.profile.profile_image_path,
      href: "/admin/profile",
    },
    {
      label: "Resume / CV",
      ready: !!data.profile.resume_path,
      href: "/admin/profile",
    },
    {
      label: "Contact information",
      ready: !!(data.profile.email || data.profile.phone),
      href: "/admin/contact",
    },
  ];
  const complete = checks.filter((item) => item.ready).length;
  const cards = [
    {
      label: "Projects",
      value: data.projects,
      icon: FolderOpen,
      href: "/admin/projects",
    },
    {
      label: "Skills",
      value: data.skills,
      icon: Layers,
      href: "/admin/skills",
    },
    {
      label: "Social links",
      value: data.socials,
      icon: Link2,
      href: "/admin/socials",
    },
    {
      label: "Messages",
      value: data.unreadMessages > 0 ? `${data.unreadMessages} unread` : "0 unread",
      icon: MessageSquare,
      href: "/admin/messages",
    },
    {
      label: "Profile setup",
      value: `${complete} / ${checks.length}`,
      icon: UserRound,
      href: "/admin/profile",
    },
  ];
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Your workspace</p>
          <h1>Portfolio overview</h1>
          <p>
            Welcome, {data.profile.owner_name}. Keep your story and your work up
            to date.
          </p>
        </div>
        <Link
          className="admin-button"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          View portfolio <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div className="admin-summary-grid">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link href={href} className="admin-summary-card" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={19} aria-hidden="true" />
            </div>
            <strong>{value}</strong>
            <small>
              Manage <ArrowUpRight size={14} aria-hidden="true" />
            </small>
          </Link>
        ))}
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Profile readiness</h2>
            <p>A few details help visitors get to know you.</p>
          </div>
          <ul className="admin-checklist">
            {checks.map((item) => (
              <li key={item.label}>
                <span
                  className={item.ready ? "check-complete" : "check-missing"}
                >
                  {item.ready ? <Check size={16} /> : <Minus size={16} />}
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.ready ? "Configured" : "Not added yet"}</small>
                </div>
                <Link className="admin-text-link" href={item.href}>
                  {item.ready ? "Edit" : "Add"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Quick actions</h2>
            <p>Make your next update.</p>
          </div>
          <div className="admin-quick-actions">
            {[
              { label: "View received messages", href: "/admin/messages" },
              { label: "Edit your profile", href: "/admin/profile" },
              { label: "Add a project", href: "/admin/projects/new" },
              { label: "Add a skill", href: "/admin/skills/new" },
              { label: "Manage section visibility", href: "/admin/settings" },
            ].map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
      <div className="admin-publishing-note">
        <span className="admin-kicker">Publishing</span>
        <p>
          Saved changes update the public portfolio. Projects need both{" "}
          <strong>Published</strong> and <strong>Featured</strong> enabled to
          appear on the homepage.
        </p>
      </div>
    </>
  );
}
