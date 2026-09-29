import Link from "next/link";
export default function NotFound() {
  return (
    <div className="admin-panel admin-empty">
      <h1>Record not found</h1>
      <p>It may have been removed, or this editor doesn’t exist.</p>
      <Link href="/admin" className="admin-button">
        Back to overview
      </Link>
    </div>
  );
}
