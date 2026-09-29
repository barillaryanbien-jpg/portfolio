import type {
  PortfolioData,
  PortfolioLink,
  SectionId,
} from "@/types/portfolio";

export function safeUrl(value?: string): string | undefined {
  const url = value?.trim();
  if (!url) return undefined;
  if (["#home", "#projects", "#skills", "#contact"].includes(url)) return url;
  if (/^\/(?!\/)/.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol))
      return url;
  } catch {
    return undefined;
  }
  return undefined;
}

export function getContactLinks(data: PortfolioData): PortfolioLink[] {
  const contact = data.contact;
  return [
    ...(contact?.email?.trim()
      ? [{ label: contact.email, url: `mailto:${contact.email.trim()}` }]
      : []),
    ...(contact?.phone?.trim()
      ? [
          {
            label: contact.phone,
            url: `tel:${contact.phone.replace(/[^+\d]/g, "")}`,
          },
        ]
      : []),
    ...(contact?.formUrl
      ? [{ label: "Get in touch", url: contact.formUrl }]
      : []),
    ...data.socialLinks,
  ].filter((link) => link.label.trim() && safeUrl(link.url));
}

export function getVisibleSections(data: PortfolioData): Set<SectionId> {
  const sections = new Set<SectionId>([
    "home",
    "projects",
    "skills",
    "contact",
  ]);
  if (data.about?.biography.trim()) sections.add("about");
  for (const section of ["projects", "skills", "about", "contact"] as const) {
    if (data.visibility?.[section] === false) sections.delete(section);
  }
  return sections;
}
