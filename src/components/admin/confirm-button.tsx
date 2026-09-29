"use client";

import { useId, useRef, useState } from "react";
import type { ActionResult } from "@/lib/admin/schema";

export function ConfirmButton({
  label,
  title,
  description,
  onConfirm,
  disabled = false,
}: {
  label: string;
  title: string;
  description: string;
  disabled?: boolean;
  onConfirm: () => Promise<ActionResult>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function confirm() {
    setPending(true);
    setMessage("");
    try {
      const result = await onConfirm();
      if (result.status === "error")
        setMessage(result.message || "Please try again.");
      else dialog.current?.close();
    } catch {
      setMessage("The operation could not be completed. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="admin-button admin-button-danger-outline"
        disabled={disabled}
        onClick={() => {
          setMessage("");
          dialog.current?.showModal();
        }}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className="admin-dialog"
        aria-labelledby={titleId}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        {message && (
          <p className="admin-notice error" role="alert">
            {message}
          </p>
        )}
        <div className="admin-dialog-actions">
          <button
            type="button"
            autoFocus
            className="admin-button"
            disabled={pending}
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-button admin-button-danger"
            disabled={pending}
            onClick={confirm}
          >
            {pending ? "Processing…" : "Confirm"}
          </button>
        </div>
      </dialog>
    </>
  );
}
