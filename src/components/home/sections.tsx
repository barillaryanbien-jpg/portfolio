import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PortfolioData, Project, Skill } from "@/types/portfolio";
import { ActionLink } from "@/components/ui/action-link";
import { ProjectCard } from "@/components/projects/project-card";
import { Statistics } from "./statistics";
import { SkillCard } from "@/components/ui/skill-card";
import { CertificationsPanel } from "./certifications-panel";

export function Projects({
  projects,
  copy,
}: {
  projects: Project[];
  copy: PortfolioData["presentation"]["projects"];
}) {
  const displayedProjects = [...projects]
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="page-width content-section"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="projects-heading">{copy.heading}</h2>
        </div>
        {copy.description && <p className="body-copy">{copy.description}</p>}
        <div className="projects-heading-actions">
          <Link href="/projects" className="view-all-projects-link">
            <span>View All Projects</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      {!projects.length && (
        <p className="sr-only">
          Project presentation placeholders. No projects have been published.
        </p>
      )}
      <div className="project-grid">
        {displayedProjects.length > 0
          ? displayedProjects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} priority={idx === 0} />
            ))
          : Array.from({ length: 3 }, (_, index) => (
              <ProjectCard key={index} />
            ))}
      </div>

      {displayedProjects.length > 0 && (
        <div className="projects-bottom-cta">
          <Link href="/projects" className="view-all-projects-btn">
            <span>View All Projects</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}

export function Skills({
  skills,
  copy,
}: {
  skills: Skill[];
  copy: PortfolioData["presentation"]["skills"];
}) {
  const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
  const displayedSkills = sortedSkills.slice(0, 12);

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="page-width content-section"
    >
      <div className="skills-panel">
        <div className="skills-header-row">
          <div className="section-heading skills-heading-block">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2 id="skills-heading">{copy.heading}</h2>
            </div>
            {copy.description && <p className="body-copy">{copy.description}</p>}
          </div>

          <Link href="/skills" className="skills-more-btn" aria-label="More About My Skills">
            <span>More About My Skills</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {!skills.length && (
          <p className="sr-only">
            Skill presentation placeholders. No skills have been published.
          </p>
        )}
        <ul className="skills-grid">
          {displayedSkills.length
            ? displayedSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            : Array.from({ length: 12 }, (_, index) => (
                <li
                  key={index}
                  className="skill-placeholder"
                  aria-hidden="true"
                >
                  <span className="skill-icon-slot" />
                  <span className="skeleton skill-name-slot" />
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}


export function About({
  about,
  resume,
  certificates = [],
}: {
  about: PortfolioData["about"];
  resume: PortfolioData["profile"]["resume"];
  certificates?: PortfolioData["certificates"];
}) {
  if (!about?.biography.trim()) return null;
  const hasCertificates = Boolean(certificates && certificates.length > 0);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`page-width content-section ${
        hasCertificates ? "about-cert-layout" : "about-grid"
      }`}
    >
      {/* Left Column: About / Background & Story */}
      <div className="about-content-col">
        <p className="eyebrow">About</p>
        <h2 id="about-heading">{about.heading || "Background & Story"}</h2>
        <p className="body-copy whitespace-pre-line">{about.biography}</p>
        <div className="about-actions flex flex-wrap items-center gap-4 mt-6">
          <Link href="/about" className="about-more-btn" aria-label="More About Me">
            <span>More About Me</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          {resume && <ActionLink link={resume} />}
        </div>
        <Statistics items={about.statistics} />
      </div>

      {/* Right Column: Certifications Preview or Editorial Image */}
      {hasCertificates ? (
        <div className="about-cert-col">
          <CertificationsPanel certificates={certificates} maxDisplay={3} />
        </div>
      ) : (
        about.image?.src && (
          <div className="about-image">
            <Image
              src={about.image.src}
              alt={about.image.alt}
              fill
              sizes="(max-width: 767px) 90vw, 40vw"
              className="object-cover"
            />
          </div>
        )
      )}
    </section>
  );
}

import { ContactSection } from "./contact-section";

export const Contact = ContactSection;

