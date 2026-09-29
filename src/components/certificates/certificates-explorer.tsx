"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, Search, Maximize2, Calendar } from "lucide-react";
import type { Certificate } from "@/types/portfolio";
import { CertificateLightbox } from "./certificate-lightbox";

export interface CertificatesExplorerProps {
  certificates: Certificate[];
  availableCategories?: string[];
}

export function CertificatesExplorer({
  certificates,
}: CertificatesExplorerProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  const filteredCertificates = certificates.filter((cert) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cert.title.toLowerCase().includes(q) ||
      (cert.issueDate && cert.issueDate.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div className="certificates-explorer">
        {/* Search Control */}
        {certificates.length > 3 && (
          <div className="certificates-controls">
            <div className="certificates-search-wrap">
              <Search size={15} className="cert-search-icon" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certificates by title or year..."
                className="cert-search-input"
                aria-label="Search certificates"
              />
            </div>
          </div>
        )}

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="certificates-public-grid">
            {filteredCertificates.map((cert) => (
              <article key={cert.id} className="cert-public-card">
                {cert.image?.src ? (
                  <button
                    type="button"
                    className="cert-public-thumbnail-box cert-thumbnail-btn"
                    onClick={() => setActiveCertificate(cert)}
                    aria-label={`View full certificate: ${cert.title}`}
                  >
                    <Image
                      src={cert.image.src}
                      alt={cert.image.alt || `${cert.title} preview`}
                      fill
                      className="cert-public-img"
                      sizes="(max-width: 767px) 92vw, (max-width: 1199px) 44vw, 42vw"
                    />
                    <div className="cert-thumbnail-overlay">
                      <Maximize2 size={20} className="cert-thumbnail-zoom-icon" />
                    </div>
                  </button>
                ) : (
                  <div className="cert-public-thumbnail-box cert-public-missing-image">
                    <Award size={28} aria-hidden="true" />
                    <span>No certificate image</span>
                  </div>
                )}

                <div className="cert-public-content">
                  <h3 className="cert-public-title">{cert.title}</h3>

                  <div className="cert-public-footer-row">
                    {cert.issueDate ? (
                      <span className="cert-public-detail">
                        <Calendar size={13} aria-hidden="true" />
                        <span>{cert.issueDate}</span>
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cert-empty-state">
            <Award size={36} className="cert-empty-icon" aria-hidden="true" />
            <p className="cert-empty-title">No certificates found</p>
            <p className="cert-empty-sub">
              {searchQuery
                ? `No certifications matched "${searchQuery}".`
                : "No certificates published yet."}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="cert-reset-btn"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
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
