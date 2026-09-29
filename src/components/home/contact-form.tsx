"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { submitContactMessage } from "@/lib/admin/actions";
import type { ActionResult } from "@/lib/admin/schema";

export function ContactForm() {
  const loadTimeRef = useRef<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult>({ status: "idle" });

  // Field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Client-side validation errors
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTimeRef.current = Date.now();
  }, []);

  function validate(fields: { name: string; email: string; subject: string; message: string }) {
    const errs: Record<string, string> = {};
    if (!fields.name.trim()) {
      errs.name = "Full name is required.";
    } else if (fields.name.trim().length > 120) {
      errs.name = "Name must be 120 characters or fewer.";
    }

    if (!fields.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(fields.email.trim())) {
      errs.email = "Please enter a valid email address.";
    } else if (fields.email.trim().length > 254) {
      errs.email = "Email must be 254 characters or fewer.";
    }

    if (!fields.subject.trim()) {
      errs.subject = "Subject is required.";
    } else if (fields.subject.trim().length > 200) {
      errs.subject = "Subject must be 200 characters or fewer.";
    }

    if (!fields.message.trim()) {
      errs.message = "Message is required.";
    } else if (fields.message.trim().length > 5000) {
      errs.message = "Message must be 5000 characters or fewer.";
    }

    return errs;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validate({ name, email, subject, message });
    setClientErrors(errors);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });

    const errors = validate({ name, email, subject, message });
    setClientErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (loadTimeRef.current) {
      formData.set("form_ts", String(loadTimeRef.current));
    }

    startTransition(async () => {
      const result = await submitContactMessage(state, formData);
      setState(result);
      if (result.status === "success") {
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setTouched({});
        setClientErrors({});
      }
    });
  }

  function resetForm() {
    setState({ status: "idle" });
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setTouched({});
    setClientErrors({});
  }

  return (
    <div className="contact-form-container">
      <div className="contact-form-header">
        <h3 className="contact-form-heading">Send Me a Message</h3>
        <p className="contact-form-subtext">
          Have a project, opportunity, or question? Send me a message and I&apos;ll get back to you.
        </p>
      </div>

      {state.status === "success" ? (
        <div className="contact-success-state" role="status" aria-live="polite">
          <div className="contact-success-icon-wrap">
            <CheckCircle2 size={36} aria-hidden="true" />
          </div>
          <h4 className="contact-success-title">Message Sent Successfully!</h4>
          <p className="contact-success-text">
            {state.message || "Thank you for reaching out! I have received your message and will get back to you as soon as possible."}
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="action-link action-primary contact-reset-btn"
          >
            Send Another Message <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="contact-form-fields">
          {/* Honeypot field for anti-spam bots */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="hp_company">Do not fill this field</label>
            <input
              type="text"
              id="hp_company"
              name="hp_company"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Form-level error alert */}
          {state.status === "error" && (
            <div className="contact-form-alert error" role="alert">
              <AlertCircle size={18} aria-hidden="true" className="flex-shrink-0" />
              <span>{state.message || "An error occurred. Please check the fields below."}</span>
            </div>
          )}

          {/* Full Name Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-name" className="contact-field-label">
              Full Name <span className="contact-field-required" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              placeholder="e.g. Juan dela Cruz"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) {
                  setClientErrors((prev) => ({
                    ...prev,
                    name: e.target.value.trim() ? "" : "Full name is required.",
                  }));
                }
              }}
              onBlur={() => handleBlur("name")}
              aria-invalid={Boolean((touched.name && clientErrors.name) || state.errors?.name)}
              aria-describedby={
                (touched.name && clientErrors.name) || state.errors?.name
                  ? "contact-name-error"
                  : undefined
              }
              className={`contact-input ${
                (touched.name && clientErrors.name) || state.errors?.name ? "has-error" : ""
              }`}
            />
            {((touched.name && clientErrors.name) || state.errors?.name) && (
              <p id="contact-name-error" className="contact-input-error" role="alert">
                {clientErrors.name || state.errors?.name}
              </p>
            )}
          </div>

          {/* Email Address Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-email" className="contact-field-label">
              Email Address <span className="contact-field-required" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="e.g. juan@example.com"
              value={email}
              suppressHydrationWarning
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setClientErrors((prev) => ({
                    ...prev,
                    email: e.target.value.trim() ? "" : "Email address is required.",
                  }));
                }
              }}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean((touched.email && clientErrors.email) || state.errors?.email)}
              aria-describedby={
                (touched.email && clientErrors.email) || state.errors?.email
                  ? "contact-email-error"
                  : undefined
              }
              className={`contact-input ${
                (touched.email && clientErrors.email) || state.errors?.email ? "has-error" : ""
              }`}
            />
            {((touched.email && clientErrors.email) || state.errors?.email) && (
              <p id="contact-email-error" className="contact-input-error" role="alert">
                {clientErrors.email || state.errors?.email}
              </p>
            )}
          </div>

          {/* Subject Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-subject" className="contact-field-label">
              Subject <span className="contact-field-required" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              required
              maxLength={200}
              placeholder="e.g. Project Inquiry / Collaboration"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (touched.subject) {
                  setClientErrors((prev) => ({
                    ...prev,
                    subject: e.target.value.trim() ? "" : "Subject is required.",
                  }));
                }
              }}
              onBlur={() => handleBlur("subject")}
              aria-invalid={Boolean((touched.subject && clientErrors.subject) || state.errors?.subject)}
              aria-describedby={
                (touched.subject && clientErrors.subject) || state.errors?.subject
                  ? "contact-subject-error"
                  : undefined
              }
              className={`contact-input ${
                (touched.subject && clientErrors.subject) || state.errors?.subject ? "has-error" : ""
              }`}
            />
            {((touched.subject && clientErrors.subject) || state.errors?.subject) && (
              <p id="contact-subject-error" className="contact-input-error" role="alert">
                {clientErrors.subject || state.errors?.subject}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-message" className="contact-field-label">
              Message <span className="contact-field-required" aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              maxLength={5000}
              placeholder="Tell me about your project, idea, or inquiry…"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (touched.message) {
                  setClientErrors((prev) => ({
                    ...prev,
                    message: e.target.value.trim() ? "" : "Message is required.",
                  }));
                }
              }}
              onBlur={() => handleBlur("message")}
              aria-invalid={Boolean((touched.message && clientErrors.message) || state.errors?.message)}
              aria-describedby={
                (touched.message && clientErrors.message) || state.errors?.message
                  ? "contact-message-error"
                  : undefined
              }
              className={`contact-textarea ${
                (touched.message && clientErrors.message) || state.errors?.message ? "has-error" : ""
              }`}
            />
            {((touched.message && clientErrors.message) || state.errors?.message) && (
              <p id="contact-message-error" className="contact-input-error" role="alert">
                {clientErrors.message || state.errors?.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="action-link action-primary contact-submit-btn"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Sending Message…</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <Send size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
