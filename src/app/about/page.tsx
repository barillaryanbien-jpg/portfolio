import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, GraduationCap } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ActionLink } from "@/components/ui/action-link";
import { getPortfolio } from "@/lib/portfolio-data";
import { getVisibleSections, safeUrl } from "@/lib/portfolio";
import type { Metadata } from "next";
import type { Education, NavigationItem } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return {
    title: `About | ${profile.name}`,
    description: `Learn more about ${profile.name}, background, education, and experience.`,
  };
}

const defaultNavigation: NavigationItem[] = [
  { label: "Home", section: "home" },
  { label: "About", section: "about" },
  { label: "Projects", section: "projects" },
  { label: "Skills", section: "skills" },
  { label: "Contact", section: "contact" },
];

export default async function AboutPage() {
  const data = await getPortfolio();
  const visible = getVisibleSections(data);
  const navigation = (
    data.navigation.length ? data.navigation : defaultNavigation
  ).filter((item) => visible.has(item.section));
  const about = data.about;
  const education = [...data.education].sort((a, b) => a.order - b.order);
  const experience = [...data.experience].sort((a, b) => a.order - b.order);
  const resume = data.profile.resume;

  return (
    <>
      <Header
        name={data.profile.name}
        brandName={data.brandName}
        items={navigation}
        hasContact={visible.has("contact")}
        isHomePage={false}
      />

      <main id="main-content" className="page-width about-page-main">
        <div className="about-page-topbar">
          <Link href="/#about" className="about-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>

        <header className="about-page-hero">
          <p className="eyebrow">About me</p>
          <h1 className="about-page-title">
            {about?.heading || "Background & Story"}
          </h1>
        </header>

        <section className="about-story-section">
          <div
            className={`about-story-grid${about?.image?.src ? " has-image" : ""}`}
          >
            <div className="about-story-content">
              {about?.biography ? (
                <div className="about-text-block">
                  <p className="body-copy whitespace-pre-line leading-relaxed">
                    {about.biography}
                  </p>
                </div>
              ) : null}

              {about?.secondaryDescription ? (
                <div className="about-text-block mt-6">
                  <p className="body-copy whitespace-pre-line leading-relaxed text-secondary-copy">
                    {about.secondaryDescription}
                  </p>
                </div>
              ) : null}

              {resume && (
                <div className="about-resume-action mt-6">
                  <ActionLink link={resume} />
                </div>
              )}
            </div>

            {about?.image?.src && (
              <div className="about-story-visual">
                <div className="about-portrait-card">
                  <Image
                    src={about.image.src}
                    alt={about.image.alt || `${data.profile.name} - About`}
                    fill
                    sizes="(max-width: 768px) 90vw, 420px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {(experience.length > 0 || education.length > 0) && (
          <section className="about-timeline-grid" aria-label="Background timeline">
            {experience.length > 0 && (
              <TimelineCard
                eyebrow="Professional timeline"
                title="Experience"
                icon="experience"
                items={experience.map((item) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: [item.organization, item.type]
                    .filter(Boolean)
                    .join(" • "),
                  date: formatRange(item.startDate, item.endDate, item.isCurrent),
                  status: item.status || (item.isCurrent ? "Ongoing" : undefined),
                  description: item.description,
                  active: item.isCurrent,
                }))}
              />
            )}
            {education.length > 0 && (
              <TimelineCard
                eyebrow="Academic background"
                title="Education"
                icon="education"
                items={education.map((item) => ({
                  id: item.id,
                  title: formatEducationTitle(item),
                  subtitle: item.institution,
                  date: formatRange(item.startDate, item.endDate, item.isCurrent),
                  status: item.isCurrent ? "Present" : undefined,
                  description: [item.location, item.description]
                    .filter(Boolean)
                    .join("\n"),
                  active: item.isCurrent,
                }))}
              />
            )}
          </section>
        )}
      </main>

      <Footer
        name={data.profile.name}
        footerText={data.footerText}
        socialLinks={data.socialLinks.filter((link) => safeUrl(link.url))}
        isHomePage={false}
      />
    </>
  );
}

function formatRange(start?: string, end?: string, current?: boolean) {
  if (start && current) return `${start} - Present`;
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  if (current) return "Present";
  return undefined;
}

function formatEducationTitle(item: Education) {
  return [item.degree, item.currentAcademicLevel].filter(Boolean).join(" - ");
}

function TimelineCard({
  eyebrow,
  title,
  icon,
  items,
}: {
  eyebrow: string;
  title: string;
  icon: "education" | "experience";
  items: {
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    status?: string;
    description?: string;
    active: boolean;
  }[];
}) {
  const Icon = icon === "education" ? GraduationCap : BriefcaseBusiness;

  return (
    <article className="about-timeline-card">
      <div className="about-timeline-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <span aria-hidden="true">
          <Icon size={20} />
        </span>
      </div>

      <div className="about-timeline-list">
        {items.map((item) => (
          <div
            key={item.id}
            className={`about-timeline-item${item.active ? " is-active" : ""}`}
          >
            <div className="about-timeline-marker" aria-hidden="true" />
            <div className="about-timeline-content">
              <div className="about-timeline-row">
                <h3>{item.title}</h3>
                <div className="about-timeline-meta">
                  {item.date && <span>{item.date}</span>}
                  {item.status && <strong>{item.status}</strong>}
                </div>
              </div>
              {item.subtitle && (
                <p className="about-timeline-subtitle">{item.subtitle}</p>
              )}
              {item.description && (
                <p className="about-timeline-description whitespace-pre-line">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
