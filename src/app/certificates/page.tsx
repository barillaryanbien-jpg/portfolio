import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CertificatesExplorer } from "@/components/certificates/certificates-explorer";
import { getPortfolio } from "@/lib/portfolio-data";
import { getVisibleSections, safeUrl } from "@/lib/portfolio";
import type { Metadata } from "next";
import type { NavigationItem } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificates & Credentials | Ryan Bien N Barilla",
  description:
    "Explore professional certifications, credentials, and achievements earned by Ryan Bien N Barilla in full-stack web development and software engineering.",
};

const defaultNavigation: NavigationItem[] = [
  { label: "Home", section: "home" },
  { label: "About", section: "about" },
  { label: "Projects", section: "projects" },
  { label: "Skills", section: "skills" },
  { label: "Contact", section: "contact" },
];

export default async function CertificatesPage() {
  const data = await getPortfolio();
  const visible = getVisibleSections(data);
  const navigation = (
    data.navigation.length ? data.navigation : defaultNavigation
  ).filter((item) => visible.has(item.section));

  // Sort all certificates by order ASC
  const allCertificates = [...data.certificates].sort((a, b) => a.order - b.order);

  // Extract unique non-empty categories
  const categorySet = new Set<string>();
  for (const cert of allCertificates) {
    if (cert.category?.trim()) {
      categorySet.add(cert.category.trim());
    }
  }
  const availableCategories = Array.from(categorySet).sort((a, b) => a.localeCompare(b));

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
          <Link href="/#about" className="cert-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="cert-page-hero">
          <p className="eyebrow">CREDENTIALS &amp; ACHIEVEMENTS</p>
          <h1 className="cert-page-title">Certificates &amp; Credentials</h1>
          <p className="cert-page-subtitle body-copy">
            A curated record of professional certifications, technical training,
            and recognized milestones in modern software architecture, development,
            and design.
          </p>
        </header>

        {/* Client Explorer */}
        <CertificatesExplorer
          certificates={allCertificates}
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
