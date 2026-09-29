import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SkillsExplorer } from "@/components/skills/skills-explorer";
import { getPortfolio } from "@/lib/portfolio-data";
import { getVisibleSections, safeUrl } from "@/lib/portfolio";
import type { Metadata } from "next";
import type { NavigationItem } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skills & Technologies | Ryan Bien N Barilla",
  description:
    "A professional overview of technologies and tools used by Ryan Bien N Barilla across development, databases, testing, cloud services, and modern web projects.",
};

const defaultNavigation: NavigationItem[] = [
  { label: "Home", section: "home" },
  { label: "About", section: "about" },
  { label: "Projects", section: "projects" },
  { label: "Skills", section: "skills" },
  { label: "Contact", section: "contact" },
];

// Preferred category order as specified in requirements
const PREFERRED_CATEGORY_ORDER = [
  "Programming Languages",
  "Programming Language",
  "Frontend",
  "Backend",
  "Frameworks",
  "Framework",
  "Databases",
  "Database",
  "Styling",
  "DevOps",
  "Testing",
  "Cloud / Media",
  "Cloud",
  "Development Tools",
  "Development Tool",
  "Libraries",
  "Library",
  "APIs / Integrations",
  "AI Tools",
  "AI Tool",
  "Other",
];

export default async function SkillsPage() {
  const data = await getPortfolio();
  const visible = getVisibleSections(data);
  const navigation = (
    data.navigation.length ? data.navigation : defaultNavigation
  ).filter((item) => visible.has(item.section));

  // Sort all visible skills by sort_order ASC
  const allSkills = [...data.skills].sort((a, b) => a.order - b.order);

  // Extract unique categories that actually contain skills
  const categorySet = new Set<string>();
  for (const skill of allSkills) {
    if (skill.category?.trim()) {
      categorySet.add(skill.category.trim());
    }
  }

  // Sort available categories according to PREFERRED_CATEGORY_ORDER
  const availableCategories = Array.from(categorySet).sort((a, b) => {
    let indexA = PREFERRED_CATEGORY_ORDER.findIndex(
      (orderCat) => orderCat.toLowerCase() === a.toLowerCase()
    );
    let indexB = PREFERRED_CATEGORY_ORDER.findIndex(
      (orderCat) => orderCat.toLowerCase() === b.toLowerCase()
    );
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    if (indexA !== indexB) return indexA - indexB;
    return a.localeCompare(b);
  });

  return (
    <>
      <Header
        name={data.profile.name}
        brandName={data.brandName}
        items={navigation}
        hasContact={visible.has("contact")}
        isHomePage={false}
      />

      <main id="main-content" className="page-width skills-page-main">
        {/* Breadcrumb / Back Link */}
        <div className="skills-page-topbar">
          <Link href="/#skills" className="skills-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <header className="skills-page-hero">
          <p className="eyebrow">SKILLS &amp; TECHNOLOGIES</p>
          <h1 className="skills-page-title">My Skills &amp; Tools</h1>
          <p className="skills-page-subtitle body-copy">
            A collection of technologies and tools I use across development,
            databases, testing, cloud services, and modern web projects.
          </p>
        </header>

        {/* Interactive Skills Explorer with Horizontal Filter & Unified Grid */}
        <SkillsExplorer
          skills={allSkills}
          availableCategories={availableCategories}
        />
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
