"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Move } from "lucide-react";
import { uploadAsset } from "@/lib/admin/uploads";
import type { EditorField } from "@/lib/admin/fields";
import { ConfirmButton } from "./confirm-button";

export function FileUpload({
  field,
  id,
  value,
  preview,
  onChange,
  onBlocked,
  onUploadSuccess,
  onRemove,
  onOpenHeroEditor,
  onOpenProjectEditor,
  recordId,
}: {
  field: EditorField;
  id: string;
  value: string;
  preview?: string;
  onChange: (path: string) => void;
  onBlocked: (blocked: boolean) => void;
  onUploadSuccess?: (
    path: string,
    previewUrl?: string,
    publicId?: string,
  ) => void;
  onRemove?: () => void;
  onOpenHeroEditor?: () => void;
  onOpenProjectEditor?: () => void;
  recordId?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>();
  const [uploadedPreview, setUploadedPreview] = useState(preview);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const isPdf = field.type === "pdf";
  const deferUploadToSave = field.folder === "certificates";
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview],
  );
  const source = localPreview || (value ? uploadedPreview : undefined);
  async function upload() {
    if (!file || !field.folder) return;
    setPending(true);
    setMessage("");
    setError(false);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", field.folder);
      if (field.folder === "certificates" && recordId)
        form.set("certificateId", recordId);
      const result = await uploadAsset(form);
      if (result.status === "success" && result.path) {
        onChange(result.path);
        setUploadedPreview(result.preview);
        setFile(null);
        setLocalPreview(undefined);
        onBlocked(false);
        onUploadSuccess?.(result.path, result.preview, result.publicId);
      } else setError(true);
      setMessage(result.message || "Please try again.");
    } catch {
      setError(true);
      setMessage("The file could not be uploaded. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="admin-upload">
      <input type="hidden" name={field.name} value={value} />
      {source && !isPdf ? (
        <div className="admin-upload-preview">
          <Image
            src={source}
            alt={`${field.label} preview`}
            fill
            unoptimized
            sizes="240px"
            className="object-contain"
          />
        </div>
      ) : (
        <div className="admin-upload-empty">
          {isPdf ? (
            <FileText size={28} aria-hidden="true" />
          ) : (
            <Upload size={28} aria-hidden="true" />
          )}
          <span>
            {value || file
              ? isPdf
                ? "PDF selected"
                : "Image uploaded"
              : "No file selected"}
          </span>
        </div>
      )}
      {source && isPdf && (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-text-link"
        >
          Preview PDF
        </a>
      )}
      <label htmlFor={id} className="admin-upload-label">
        {pending ? "Uploading..." : `Choose ${isPdf ? "PDF" : "image"}`}
      </label>
      <input
        id={id}
        ref={fileInputRef}
        name={deferUploadToSave ? "certificate_image_file" : undefined}
        type="file"
        accept={isPdf ? "application/pdf" : "image/jpeg,image/png,image/webp"}
        disabled={pending}
        onChange={async (event) => {
          const selected = event.target.files?.[0] || null;
          if (!selected) return;
          setFile(selected);
          const previewUrl = URL.createObjectURL(selected);
          setLocalPreview(previewUrl);
          setMessage("");
          setError(false);

          if (deferUploadToSave) {
            onBlocked(false);
            setMessage("Image selected. Save changes to upload and publish it.");
            return;
          }

          if (!field.folder) return;
          setPending(true);
          onBlocked(true);
          try {
            const form = new FormData();
            form.set("file", selected);
            form.set("folder", field.folder);
            if (field.folder === "certificates" && recordId)
              form.set("certificateId", recordId);
            const result = await uploadAsset(form);
            if (result.status === "success" && result.path) {
              onChange(result.path);
              setUploadedPreview(result.preview);
              setFile(null);
              setLocalPreview(undefined);
              onBlocked(false);
              setMessage("File uploaded successfully.");
              onUploadSuccess?.(result.path, result.preview, result.publicId);
            } else {
              setError(true);
              setMessage(result.message || "Please try again.");
              onBlocked(false);
            }
          } catch {
            setError(true);
            setMessage("The file could not be uploaded. Please try again.");
            onBlocked(false);
          } finally {
            setPending(false);
          }
        }}
      />
      <p className="admin-help">
        {field.help ||
          "JPEG, PNG, or WebP. Maximum 5 MB."}
      </p>
      <div className="admin-inline-actions">
        {onOpenHeroEditor && (source || value) && (
          <button
            type="button"
            className="admin-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f4ede1",
              borderColor: "#cbb898",
              color: "#6b4f24",
              fontWeight: 600,
            }}
            onClick={onOpenHeroEditor}
          >
            <Move size={15} />
            <span>Position & Frame Hero</span>
          </button>
        )}
        {onOpenProjectEditor && (source || value) && (
          <button
            type="button"
            className="admin-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f4ede1",
              borderColor: "#cbb898",
              color: "#6b4f24",
              fontWeight: 600,
            }}
            onClick={onOpenProjectEditor}
          >
            <Move size={15} />
            <span>Position & Frame Project Preview</span>
          </button>
        )}
        {file && (
          <>
            {!deferUploadToSave && (
              <button
                type="button"
                className="admin-button"
                disabled={pending}
                onClick={upload}
              >
                {pending ? "Uploading..." : "Retry upload"}
              </button>
            )}
            <button
              type="button"
              className="admin-button"
              disabled={pending}
              onClick={() => {
                setFile(null);
                setLocalPreview(undefined);
                onBlocked(false);
                setMessage("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Cancel selection
            </button>
          </>
        )}
        {value && (
          <ConfirmButton
            label="Remove file"
            title={`Remove ${field.label.toLowerCase()}?`}
            description="The file will be removed from this record when you save changes."
            disabled={pending}
            onConfirm={async () => {
              onChange("");
              onRemove?.();
              setFile(null);
              setLocalPreview(undefined);
              onBlocked(false);
              setUploadedPreview(undefined);
              setMessage("File removed from this form. Save changes to apply.");
              return { status: "success" };
            }}
          />
        )}
      </div>
      {message && (
        <p
          role={error ? "alert" : "status"}
          className={`admin-help${error ? " admin-field-error" : ""}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
