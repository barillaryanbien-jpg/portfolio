import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { getPortfolio, getAllProjects } from "@/lib/portfolio-data";
import { getVisibleSections, safeUrl } from "@/lib/portfolio";
import type { Metadata } from "next";
import type { NavigationItem } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return {
    title: `Projects & Case Studies | ${profile.name}`,
    description: `A collection of web applications, systems, and digital projects built and developed by ${profile.name}.`,
  };
}

const defaultNavigation: NavigationItem[] = [
  { label: "Home", section: "home" },
  { label: "About", section: "about" },
  { label: "Projects", section: "projects" },
  { label: "Skills", section: "skills" },
  { label: "Contact", section: "contact" },
];

export default async function ProjectsPage() {
  const [data, allProjects] = await Promise.all([
    getPortfolio(),
    getAllProjects(),
  ]);

  const visible = getVisibleSections(data);
  const navigation = (
    data.navigation.length ? data.navigation : defaultNavigation
  ).filter((item) => visible.has(item.section));

  return (
    <>
      <Header
        name={data.profile.name}
        brandName={data.brandName}
        items={navigation}
        hasContact={visible.has("contact")}
        isHomePage={false}
      />

      <main id="main-content" className="page-width cert-page-main">
        {/* Breadcrumb / Back Link */}
        <div className="cert-page-topbar">
          <Link href="/#projects" className="cert-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="cert-page-hero">
          <p className="eyebrow">SELECTED WORK</p>
          <h1 className="cert-page-title">Projects</h1>
          <p className="cert-page-subtitle body-copy">
            A collection of web applications, systems, and digital projects I have built and contributed to.
          </p>
        </header>

        {/* Projects Explorer */}
        <ProjectsExplorer projects={allProjects} />
      </main>

      <Footer
        name={data.profile.name}
        footerText={data.footerText}
        socialLinks={data.socialLinks.filter((link) => safeUrl(link.url))}
      />
    </>
  );
}
