"use client";
export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="page-width content-section">
      <h1>Temporarily unavailable</h1>
      <p className="body-copy">
        The portfolio could not be loaded. Please try again in a moment.
      </p>
      <button
        type="button"
        className="action-link action-primary"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
