"use client";

import { useState } from "react";
import Link from "next/link";
import { Maximize2, ArrowUpRight } from "lucide-react";
import type { Certificate } from "@/types/portfolio";
import { CertificateLightbox } from "@/components/certificates/certificate-lightbox";

export interface CertificationsPanelProps {
  certificates: Certificate[];
  maxDisplay?: number;
}

export function CertificationsPanel({
  certificates,
  maxDisplay = 3,
}: CertificationsPanelProps) {
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  if (!certificates || !certificates.length) {
    return null;
  }

  // Sorted by order ASC and limited to maxDisplay (default 3)
  const sorted = [...certificates].sort((a, b) => a.order - b.order);
  const displayed = sorted.slice(0, maxDisplay);

  return (
    <>
      <div className="certifications-panel">
        <div className="certifications-header">
          <div>
            <p className="eyebrow">Credentials &amp; Achievements</p>
            <h3 className="certifications-heading">CERTIFICATIONS</h3>
          </div>
        </div>

        <div className="certifications-list" role="region" aria-label="Certificates List">
          {displayed.map((cert) => (
            <div key={cert.id} className="cert-row-card">
              <button
                type="button"
                className="cert-row-summary"
                onClick={() => setActiveCertificate(cert)}
                aria-label={`View certificate: ${cert.title}`}
              >
                <div className="cert-row-main">
                  <span className="cert-row-title">{cert.title}</span>
                  {cert.issueDate && (
                    <span className="cert-row-date">{cert.issueDate}</span>
                  )}
                </div>

                <div className="cert-row-expand-icon" aria-hidden="true" title="Open certificate">
                  <Maximize2 size={16} />
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="certifications-footer">
          <Link
            href="/certificates"
            className="cert-view-all-link"
            aria-label="View All Certificates"
          >
            <span>View All Certificates</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeCertificate && (
        <CertificateLightbox
          isOpen={Boolean(activeCertificate)}
          onClose={() => setActiveCertificate(null)}
          title={activeCertificate.title}
          imageSrc={activeCertificate.image?.src}
          issueDate={activeCertificate.issueDate}
        />
      )}
    </>
  );
}
