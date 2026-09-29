"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Calendar } from "lucide-react";

export interface CertificateLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc?: string;
  issueDate?: string;
}

export function CertificateLightbox({
  isOpen,
  onClose,
  title,
  imageSrc,
  issueDate,
}: CertificateLightboxProps) {
  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="cert-lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate preview: ${title}`}
      onClick={onClose}
    >
      <div
        className="cert-lightbox-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lightbox Header / Close button */}
        <div className="cert-lightbox-header">
          <div className="cert-lightbox-title-wrap">
            <h3 className="cert-lightbox-title">{title}</h3>
            {issueDate && (
              <span className="cert-lightbox-date">
                <Calendar size={13} aria-hidden="true" />
                <span>{issueDate}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            className="cert-lightbox-close-btn"
            onClick={onClose}
            aria-label="Close certificate preview"
            title="Close (Esc)"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Certificate Image Frame */}
        <div className="cert-lightbox-image-frame">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={title}
              width={1600}
              height={1100}
              unoptimized
              className="cert-lightbox-img"
            />
          ) : (
            <div className="cert-lightbox-no-image">
              <p>No preview image available for this certificate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
