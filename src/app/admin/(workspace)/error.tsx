"use client";

export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <div className="admin-panel" role="alert">
      <h1>We couldn&apos;t load this page.</h1>
      <p>Check your connection and try again. Your saved content is unchanged.</p>
      <button type="button" className="admin-button admin-button-primary" onClick={reset}>Try again</button>
    </div>
  );
}
