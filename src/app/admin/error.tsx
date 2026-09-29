"use client";
import Link from "next/link";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="admin-error-page">
      <div className="admin-panel">
        <h1>We couldn’t load this page.</h1>
        <p>
          Check your connection and Supabase setup, then try again. Your saved
          content is unchanged.
        </p>
        <div className="admin-inline-actions">
          <button type="button" className="admin-button admin-button-primary" onClick={reset}>
            Try again
          </button>
          <Link className="admin-button" href="/admin/login">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
