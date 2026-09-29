import type { Resource } from "./schema";

export interface EditorField {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "url"
    | "number"
    | "textarea"
    | "toggle"
    | "image"
    | "pdf"
    | "tags"
    | "select"
    | "icon-picker"
    | "hidden";
  required?: boolean;
  help?: string;
  options?: readonly string[];
  folder?: "profile" | "projects" | "about" | "resume" | "skills" | "certificates";
}
interface EditorDefinition {
  title: string;
  description: string;
  singular: string;
  fields: EditorField[];
}
const bio: EditorField = {
  name: "bio",
  label: "Biography",
  type: "textarea",
  help: "Only add information you want to publish in About.",
};
const resume: EditorField = {
  name: "resume_path",
  label: "Resume / CV",
  type: "pdf",
  folder: "resume",
  help: "PDF, up to 10 MB. A Download CV link appears after saving.",
};
const contactFields: EditorField[] = [
  { name: "email", label: "Public email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "location", label: "Location" },
  { name: "availability_text", label: "Availability message" },
];
const sort: EditorField = {
  name: "sort_order",
  label: "Display order",
  type: "number",
  help: "Lower numbers appear first. Use 0–10000.",
};
const visible: EditorField = {
  name: "is_visible",
  label: "Visible on the portfolio",
  type: "toggle",
};
const contactCopy: EditorField[] = [
  { name: "contact_heading", label: "Contact heading", required: true },
  {
    name: "contact_description",
    label: "Contact invitation",
    type: "textarea",
  },
];
export const editors: Record<Resource, EditorDefinition> = {
  profile: {
    title: "Profile",
    singular: "Profile",
    description:
      "The person behind your portfolio. Add only what you are ready to share.",
    fields: [
      { name: "owner_name", label: "Full name", required: true },
      { name: "professional_title", label: "Professional title" },
      { name: "short_intro", label: "Short introduction", type: "textarea" },
      bio,
      {
        name: "profile_image_path",
        label: "Profile image",
        type: "image",
        folder: "profile",
      },
      {
        name: "hero_image_mode",
        label: "Hero image display mode",
        type: "hidden",
      },
      {
        name: "hero_image_scale",
        label: "Hero image scale",
        type: "hidden",
      },
      {
        name: "hero_image_position_x",
        label: "Hero image position X",
        type: "hidden",
      },
      {
        name: "hero_image_position_y",
        label: "Hero image position Y",
        type: "hidden",
      },
      resume,
      ...contactFields,
    ],
  },
  about: {
    title: "About",
    singular: "About",
    description:
      "Tell your story. This section appears only when a biography exists and About is enabled.",
    fields: [
      { name: "about_heading", label: "About heading" },
      bio,
      {
        name: "secondary_description",
        label: "Additional description",
        type: "textarea",
      },
      {
        name: "about_image_path",
        label: "About image",
        type: "image",
        folder: "about",
      },
      resume,
    ],
  },
  contact: {
    title: "Contact",
    singular: "Contact",
    description:
      "Choose how visitors can reach you. Empty methods stay hidden.",
    fields: [...contactFields, ...contactCopy],
  },
  settings: {
    title: "Site settings",
    singular: "Settings",
    description: "Control your presentation and which sections visitors see.",
    fields: [
      {
        name: "brand_name",
        label: "Navigation brand",
        help: "Leave blank to use your initials.",
      },
      { name: "hero_eyebrow", label: "Hero eyebrow", required: true },
      {
        name: "hero_caption",
        label: "Neutral hero caption",
        help: "Used only when a professional title is not set.",
      },
      { name: "hero_cta_text", label: "Work button label", required: true },
      { name: "projects_heading", label: "Projects heading", required: true },
      {
        name: "projects_description",
        label: "Projects introduction",
        type: "textarea",
      },
      { name: "skills_heading", label: "Skills heading", required: true },
      {
        name: "skills_description",
        label: "Skills introduction",
        type: "textarea",
      },
      ...contactCopy,
      { name: "footer_text", label: "Footer text", required: true },
      ...["statistics", "projects", "skills", "about", "contact"].map(
        (name) => ({
          name: "show_" + name,
          label: "Show " + name,
          type: "toggle" as const,
        }),
      ),
    ],
  },
  projects: {
    title: "Projects",
    singular: "Project",
    description:
      "Manage your work. Only published, featured projects appear on the homepage.",
    fields: [
      { name: "title", label: "Project title", required: true },
      {
        name: "slug",
        label: "Slug",
        required: true,
        help: "Generated from the title; you can edit it.",
      },
      { name: "category", label: "Category" },
      {
        name: "short_description",
        label: "Short description",
        type: "textarea",
      },
      { name: "full_description", label: "Full description", type: "textarea" },
      {
        name: "cover_image_path",
        label: "Cover image",
        type: "image",
        folder: "projects",
      },
      {
        name: "cover_display_type",
        label: "Preview type",
        type: "select",
        options: ["desktop", "tablet", "mobile", "auto"],
        help: "Desktop (16:10 / 16:9), Tablet (4:3), Mobile (9:16 portrait), or Auto.",
      },
      {
        name: "cover_fit",
        label: "Image fit",
        type: "select",
        options: ["cover", "contain"],
        help: "Cover fills the frame. Contain keeps the full screenshot visible.",
      },
      {
        name: "cover_position_x",
        label: "Position X (%)",
        type: "hidden",
      },
      {
        name: "cover_position_y",
        label: "Position Y (%)",
        type: "hidden",
      },
      {
        name: "cover_zoom",
        label: "Zoom scale",
        type: "hidden",
      },
      {
        name: "technologies",
        label: "Technologies",
        type: "tags",
        help: "Type a technology, then press Enter. Do not add technologies you did not use.",
      },
      { name: "live_url", label: "Live website URL", type: "url" },
      { name: "repository_url", label: "Repository URL", type: "url" },
      { name: "featured", label: "Featured on the homepage", type: "toggle" },
      {
        name: "is_published",
        label: "Published",
        type: "toggle",
        help: "Leave off to keep this project as a draft.",
      },
      sort,
    ],
  },
  skills: {
    title: "Skills",
    singular: "Skill",
    description:
      "Keep your toolkit accurate. Choose an optional symbol or upload your own icon.",
    fields: [
      { name: "name", label: "Skill name", required: true },
      {
        name: "icon",
        label: "Technology icon",
        type: "icon-picker",
        help: "Search from the built-in technology icon library. Use custom upload only if your technology is not available.",
      },
      {
        name: "icon_path",
        label: "Custom icon (optional)",
        type: "image",
        folder: "skills",
        help: "An uploaded icon takes priority over the built-in icon.",
      },
      { name: "category", label: "Category" },
      sort,
      visible,
    ],
  },
  socials: {
    title: "Social links",
    singular: "Social link",
    description:
      "Add your real profiles. Only visible links appear on the portfolio.",
    fields: [
      {
        name: "platform",
        label: "Platform",
        required: true,
        help: "For example: GitHub, LinkedIn, Facebook, Instagram, X, YouTube, or your own label.",
      },
      { name: "url", label: "Profile URL", type: "url", required: true },
      { name: "username", label: "Username (optional)" },
      sort,
      visible,
    ],
  },
  statistics: {
    title: "Statistics",
    singular: "Statistic",
    description:
      "Publish only real, verifiable numbers. No statistics are added automatically.",
    fields: [
      { name: "label", label: "Label", required: true },
      { name: "value", label: "Value", required: true },
      { name: "suffix", label: "Suffix", help: "Optional, such as + or %." },
      sort,
      visible,
    ],
  },
  education: {
    title: "Education",
    singular: "Education",
    description:
      "Manage your academic background, degrees, programs, and certifications.",
    fields: [
      {
        name: "institution",
        label: "School / Institution name",
        required: true,
        help: "e.g., University or Academy name.",
      },
      {
        name: "degree",
        label: "Degree / Program / Course",
        required: true,
        help: "e.g., Bachelor of Science, Diploma, or Specialization.",
      },
      {
        name: "field_of_study",
        label: "Field of study (optional)",
        help: "e.g., Computer Science, Information Technology, Web Development.",
      },
      {
        name: "current_academic_level",
        label: "Current academic level (optional)",
        help: "e.g., 1st Year, 2nd Year, 3rd Year, 4th Year, Graduate.",
      },
      {
        name: "start_date",
        label: "Start year / date",
        help: "e.g., 2020 or Aug 2020.",
      },
      {
        name: "end_date",
        label: "End year / date",
        help: "e.g., 2024 or Present.",
      },
      {
        name: "is_current",
        label: "Currently studying / Present",
        type: "toggle",
      },
      {
        name: "location",
        label: "Location (optional)",
        help: "e.g., City, Country or Remote.",
      },
      {
        name: "description",
        label: "Description (optional)",
        type: "textarea",
        help: "Key achievements, honors, coursework, or relevant highlights.",
      },
      sort,
      visible,
    ],
  },
  experience: {
    title: "Experience",
    singular: "Experience",
    description:
      "Manage internships, work, freelance, academic projects, and other portfolio experience.",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "organization", label: "Organization / Project" },
      {
        name: "type",
        label: "Type",
        help: "Examples: Internship, Work Experience, Freelance, Capstone Project, Academic Project, Personal Project, Other.",
      },
      {
        name: "start_date",
        label: "Start year / date",
        help: "e.g., 2023 or Aug 2023.",
      },
      {
        name: "end_date",
        label: "End year / date",
        help: "Leave empty when Present / Ongoing is enabled.",
      },
      {
        name: "is_current",
        label: "Present / Ongoing",
        type: "toggle",
      },
      {
        name: "description",
        label: "Description (optional)",
        type: "textarea",
      },
      {
        name: "status",
        label: "Status label (optional)",
        help: "Examples: Current, Ongoing, Completed.",
      },
      sort,
      visible,
    ],
  },
  certificates: {
    title: "Certificates",
    singular: "Certificate",
    description:
      "Upload and manage your certificate credentials.",
    fields: [
      {
        name: "title",
        label: "Certificate title",
        required: true,
        help: "e.g., AWS Certified Solutions Architect, Responsive Web Design.",
      },
      {
        name: "issue_date",
        label: "Issue date",
        help: "e.g., 2024 or Aug 2024.",
      },
      {
        name: "certificate_image_path",
        label: "Certificate image",
        type: "image",
        folder: "certificates",
        required: true,
        help: "Upload your certificate image (JPEG, PNG, or WebP).",
      },
      {
        name: "certificate_image_public_id",
        label: "Certificate image public ID",
        type: "hidden",
      },
      sort,
      visible,
    ],
  },
};
