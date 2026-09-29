import type { PortfolioData } from "@/types/portfolio";

export const portfolio: PortfolioData = {
  profile: { name: "Ryan Bien N Barilla" },
  navigation: [],
  hero: {
    eyebrow: "Personal portfolio",
    caption: "Portfolio",
    actions: [{ label: "View My Work", url: "#projects" }],
  },
  statistics: [],
  projects: [],
  skills: [],
  education: [],
  experience: [],
  certificates: [],
  presentation: {
    projects: { eyebrow: "Selected work", heading: "Featured Projects" },
    skills: { eyebrow: "Skills & technologies", heading: "Tools I Work With" },
  },
  contact: {
    heading: "Have a Project in Mind?",
    description:
      "A conversation is a good place to start. Let’s explore what we could create together.",
  },
  socialLinks: [],
};
