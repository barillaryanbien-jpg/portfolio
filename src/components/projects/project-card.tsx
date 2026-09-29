import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe, Code2 } from "lucide-react";
import type { Project } from "@/types/portfolio";

export function ProjectCard({
  project,
  priority = false,
}: {
  project?: Project;
  priority?: boolean;
}) {
  if (!project) {
    return (
      <div className="project-card project-placeholder" aria-hidden="true">
        <div className="project-image-box empty-preview">
          <span className="preview-outline" />
          <span className="preview-cross" />
        </div>
        <div className="project-card-content">
          <div className="skeleton project-title-slot" />
          <div className="project-tag-slots">
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton" />
          </div>
          <div className="skeleton project-copy-slot" />
          <div className="skeleton project-copy-slot short" />
        </div>
      </div>
    );
  }

  const displayType = project.displayType || "desktop";
  const fit = project.fit || "contain";
  const posX = typeof project.positionX === "number" ? project.positionX : 50;
  const posY = typeof project.positionY === "number" ? project.positionY : 50;
  const zoom = typeof project.zoom === "number" ? project.zoom : 1.0;

  // Primary link for entire card click or title click
  const primaryHref = project.liveUrl || project.repositoryUrl || project.detailsUrl || undefined;

  return (
    <article className={`project-card device-${displayType} group`}>
      {/* Visual Window Mockup Container */}
      <div className={`project-mockup-frame frame-${displayType}`}>
        {/* Browser / Device Chrome Header */}
        {displayType === "mobile" ? (
          <div className="project-phone-speaker-bar" aria-hidden="true">
            <span className="phone-notch-dot" />
            <span className="phone-speaker-slot" />
          </div>
        ) : displayType === "tablet" ? (
          <div className="project-tablet-bar" aria-hidden="true">
            <span className="tablet-camera-dot" />
          </div>
        ) : (
          <div className="project-frame-bar" aria-hidden="true">
            <div className="frame-dots">
              <span className="frame-dot" />
              <span className="frame-dot" />
              <span className="frame-dot" />
            </div>
            <div className="frame-address">
              {project.slug || project.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}
            </div>
          </div>
        )}

        {/* Viewport Frame */}
        <div className={`project-image-viewport aspect-${displayType}`}>
          {project.image?.src ? (
            <div
              className="project-image-scaler"
              style={{
                transform: `translate(${posX - 50}%, ${posY - 50}%) scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <Image
                src={project.image.src}
                alt={project.image.alt || project.title}
                fill
                priority={priority}
                sizes="(max-width: 639px) 94vw, (max-width: 1023px) 46vw, 32vw"
                className={`project-img object-${fit}`}
              />
            </div>
          ) : (
            <div className="project-empty-art">
              <span className="empty-label">{project.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Card Information */}
      <div className="project-card-content">
        {/* Category & Badge */}
        <div className="project-card-meta">
          {project.category && (
            <span className="project-category-badge">{project.category}</span>
          )}
          {project.featured && (
            <span className="project-featured-pill">Featured</span>
          )}
        </div>

        {/* Title */}
        <h3 className="project-title">
          {primaryHref ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="project-title-link"
            >
              <span>{project.title}</span>
              <ArrowUpRight size={18} className="project-title-arrow" aria-hidden="true" />
            </a>
          ) : (
            project.title
          )}
        </h3>

        {/* Technology Pills */}
        {project.technologies && project.technologies.length > 0 && (
          <ul className="project-tech-list" aria-label="Technologies used">
            {project.technologies.map((tech) => (
              <li key={tech} className="project-tech-pill">
                {tech}
              </li>
            ))}
          </ul>
        )}

        {/* Description */}
        {project.description && (
          <p className="project-description body-copy">{project.description}</p>
        )}

        {/* Footer Actions */}
        <div className="project-links-row">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-action-link primary"
            >
              <Globe size={14} aria-hidden="true" />
              <span>Live Website</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          )}
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-action-link"
            >
              <Code2 size={14} aria-hidden="true" />
              <span>Source Code</span>
            </a>
          )}
          {project.detailsUrl && !project.liveUrl && (
            <Link href={project.detailsUrl} className="project-action-link">
              <span>View Case Study</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
