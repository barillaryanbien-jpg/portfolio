export interface PortfolioImage {
  src: string;
  alt: string;
}

export interface PortfolioLink {
  label: string;
  url: string;
}

export type SectionId = "home" | "about" | "projects" | "skills" | "contact";

export interface NavigationItem {
  label: string;
  section: SectionId;
}

export interface Statistic {
  id: string;
  value: string;
  label: string;
}

export type ProjectDisplayType = "desktop" | "tablet" | "mobile" | "auto";
export type ProjectFit = "cover" | "contain";

export interface Project {
  id: string;
  title: string;
  slug?: string;
  featured?: boolean;
  description?: string;
  image?: PortfolioImage;
  category?: string;
  technologies: string[];
  liveUrl?: string;
  repositoryUrl?: string;
  detailsUrl?: string;
  order: number;
  displayType?: ProjectDisplayType;
  fit?: ProjectFit;
  positionX?: number;
  positionY?: number;
  zoom?: number;
}

export interface Skill {
  id: string;
  name: string;
  icon?: PortfolioImage;
  iconName?: string;
  category?: string;
  order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  currentAcademicLevel?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  description?: string;
  order: number;
}
export interface Experience {
  id: string;
  title: string;
  organization?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  status?: string;
  order: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer?: string;
  category?: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  image?: PortfolioImage;
  imagePath?: string | null;
  order: number;
}

export interface PortfolioData {
  brandName?: string;
  footerText?: string;
  visibility?: Record<
    "statistics" | "projects" | "skills" | "about" | "contact",
    boolean
  >;
  profile: {
    name: string;
    title?: string;
    image?: PortfolioImage;
    resume?: PortfolioLink;
    heroImageMode?: "cutout" | "full";
    heroImageScale?: number;
    heroImagePositionX?: number;
    heroImagePositionY?: number;
  };
  navigation: NavigationItem[];
  hero: {
    eyebrow?: string;
    caption?: string;
    introduction?: string;
    actions: PortfolioLink[];
  };
  statistics: Statistic[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  certificates: Certificate[];
  presentation: {
    projects: {
      eyebrow: string;
      heading: string;
      description?: string;
      allProjects?: PortfolioLink;
    };
    skills: { eyebrow: string; heading: string; description?: string };
  };
  about?: {
    heading?: string;
    biography: string;
    secondaryDescription?: string;
    image?: PortfolioImage;
    statistics: Statistic[];
  };
  contact?: {
    heading?: string;
    description?: string;
    email?: string;
    phone?: string;
    location?: string;
    formUrl?: string;
    availability?: string;
  };
  socialLinks: PortfolioLink[];
}
