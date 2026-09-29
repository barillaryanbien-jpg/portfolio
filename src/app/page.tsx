import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { About, Contact, Projects, Skills } from "@/components/home/sections";
import { getVisibleSections, safeUrl } from "@/lib/portfolio";
import { getPortfolio } from "@/lib/portfolio-data";
import type { Metadata } from "next";
import type { NavigationItem } from "@/types/portfolio";

const defaultNavigation: NavigationItem[] = [
  { label: "Home", section: "home" },
  { label: "About", section: "about" },
  { label: "Projects", section: "projects" },
  { label: "Skills", section: "skills" },
  { label: "Contact", section: "contact" },
];

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  const title = `${profile.name} | Portfolio`;
  const description = `The personal portfolio of ${profile.name}.`;
  const siteUrl = process.env.SITE_URL;
  return {
    title,
    description,
    ...(siteUrl
      ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } }
      : {}),
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      ...(siteUrl ? { url: siteUrl } : {}),
    },
  };
}

export default async function HomePage() {
  const data = await getPortfolio();
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
      />
      <main id="main-content">
        <Hero
          profile={data.profile}
          hero={data.hero}
          statistics={data.statistics}
          showStatistics={data.visibility?.statistics !== false}
        />
        {visible.has("projects") && (
          <Projects
            projects={data.projects}
            copy={data.presentation.projects}
          />
        )}
        {visible.has("skills") && (
          <Skills skills={data.skills} copy={data.presentation.skills} />
        )}
        {visible.has("about") && (
          <About
            about={data.about}
            resume={data.profile.resume}
            certificates={data.certificates}
          />
        )}
        {visible.has("contact") && <Contact data={data} />}
      </main>
      <Footer
        name={data.profile.name}
        footerText={data.footerText}
        socialLinks={data.socialLinks.filter((link) => safeUrl(link.url))}
      />
    </>
  );
}
