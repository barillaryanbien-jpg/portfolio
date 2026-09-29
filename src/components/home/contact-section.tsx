import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import type { PortfolioData } from "@/types/portfolio";
import { safeUrl } from "@/lib/portfolio";
import { SocialIcon } from "@/components/ui/social-icon";
import { ContactForm } from "./contact-form";

export function ContactSection({ data }: { data: PortfolioData }) {
  const contact = data.contact;
  const email = contact?.email?.trim();
  const phone = contact?.phone?.trim();
  const location = contact?.location?.trim();
  const availability = contact?.availability?.trim();

  // Valid social links
  const socialLinks = (data.socialLinks || []).filter(
    (link) => link.label.trim() && safeUrl(link.url),
  );

  const cleanPhone = phone ? phone.replace(/[^+\d]/g, "") : "";

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="page-width content-section home-contact-section"
    >
      {/* Section Header */}
      <div className="section-heading contact-section-heading">
        <div>
          <p className="eyebrow">Let’s connect</p>
          <h2 id="contact-heading">
            {contact?.heading || "Let's Build Something Great"}
          </h2>
        </div>
        {contact?.description && (
          <p className="body-copy contact-section-intro">
            {contact.description}
          </p>
        )}
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="contact-columns-grid">
        {/* LEFT COLUMN: Contact Information */}
        <div className="contact-card contact-info-card">
          <div className="contact-info-header">
            <h3 className="contact-card-title">Contact Information</h3>
            <p className="contact-card-subtitle">
              Feel free to reach out directly through any of the channels below.
            </p>
          </div>

          <div className="contact-details-list">
            {/* Email Row */}
            {email && (
              <div className="contact-detail-row">
                <div className="contact-icon-bubble" aria-hidden="true">
                  <Mail size={19} />
                </div>
                <div className="contact-detail-content">
                  <span className="contact-detail-label">Email</span>
                  <a
                    href={`mailto:${email}`}
                    className="contact-detail-value contact-link-hover"
                    aria-label={`Send email to ${email}`}
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}

            {/* Phone Row */}
            {phone && (
              <div className="contact-detail-row">
                <div className="contact-icon-bubble" aria-hidden="true">
                  <Phone size={19} />
                </div>
                <div className="contact-detail-content">
                  <span className="contact-detail-label">Phone</span>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="contact-detail-value contact-link-hover"
                    aria-label={`Call ${phone}`}
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {/* Location Row */}
            {location && (
              <div className="contact-detail-row">
                <div className="contact-icon-bubble" aria-hidden="true">
                  <MapPin size={19} />
                </div>
                <div className="contact-detail-content">
                  <span className="contact-detail-label">Location</span>
                  <span className="contact-detail-value">{location}</span>
                </div>
              </div>
            )}

            {/* Availability Status Badge */}
            {availability && (
              <div className="contact-availability-banner">
                <span className="availability-pulse-dot" aria-hidden="true" />
                <span className="availability-text">{availability}</span>
              </div>
            )}
          </div>

          {/* Subsection: Connect With Me (Social Links) */}
          {socialLinks.length > 0 && (
            <div className="contact-socials-subsection">
              <h4 className="contact-socials-title">Connect With Me</h4>
              <ul className="contact-social-grid" aria-label="Social and professional links">
                {socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-social-card"
                      aria-label={`${link.label} (opens in a new tab)`}
                    >
                      <div className="contact-social-icon-wrap" aria-hidden="true">
                        <SocialIcon platform={link.label} url={link.url} size={18} />
                      </div>
                      <span className="contact-social-name">{link.label}</span>
                      <ArrowUpRight
                        size={14}
                        className="contact-social-arrow"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Contact Form */}
        <div className="contact-card contact-form-card">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
