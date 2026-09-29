import { z } from "zod";

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .optional()
    .nullable()
    .transform((value) => value || null);
const requiredText = (max = 120) =>
  z
    .string()
    .trim()
    .min(1, "This field is required.")
    .max(max, `Use ${max} characters or fewer.`);
const path = z
  .string()
  .trim()
  .max(2048)
  .regex(
    /^$|^(https:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>]*)?|[0-9a-f-]{36}\/(profile|projects|about|resume|skills|certificates)\/[0-9a-f-]{36}\.(jpg|png|webp|pdf))$/,
    "Select an uploaded file.",
  )
  .optional()
  .nullable()
  .transform((value) => value || null);
const order = z.coerce.number().int("Use a whole number.").min(0).max(10000);
const url = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const parsed = new URL(value);
      return (
        ["http:", "https:"].includes(parsed.protocol) &&
        !parsed.username &&
        !parsed.password
      );
    } catch {
      return false;
    }
  }, "Enter a full http:// or https:// URL.")
  .transform((value) => value || null);
const email = z
  .string()
  .trim()
  .max(254)
  .refine(
    (value) => !value || z.email().safeParse(value).success,
    "Enter a valid email address.",
  )
  .transform((value) => value || null);
const phone = z
  .string()
  .trim()
  .max(40)
  .refine(
    (value) => !value || /^[+\d\s().-]{5,40}$/.test(value),
    "Use a phone number with digits and optional country code.",
  )
  .transform((value) => value || null);

export const legacyIconNames = [
  "code",
  "terminal",
  "database",
  "globe",
  "layers",
  "palette",
  "cloud",
  "cpu",
] as const;

export const iconNames = legacyIconNames;
export type SkillIconName = string;

export const heroImageSettingsSchema = z.object({
  hero_image_mode: z.enum(["cutout", "full"]).default("cutout"),
  hero_image_scale: z.coerce.number().min(0.1).max(5).default(1.0),
  hero_image_position_x: z.coerce.number().min(-100).max(200).default(50.0),
  hero_image_position_y: z.coerce.number().min(-100).max(200).default(50.0),
});

export const profileSchema = z.object({
  owner_name: requiredText(),
  professional_title: optionalText(160),
  short_intro: optionalText(1000),
  bio: optionalText(15000),
  profile_image_path: path,
  resume_path: path,
  email,
  phone,
  location: optionalText(200),
  availability_text: optionalText(250),
  hero_image_mode: z.enum(["cutout", "full"]).default("cutout").optional().catch("cutout"),
  hero_image_scale: z.coerce.number().min(0.1).max(5).default(1.0).optional().catch(1.0),
  hero_image_position_x: z.coerce.number().min(-100).max(200).default(50.0).optional().catch(50.0),
  hero_image_position_y: z.coerce.number().min(-100).max(200).default(50.0).optional().catch(50.0),
});
export const aboutSchema = z.object({
  about_heading: optionalText(160),
  bio: optionalText(15000),
  secondary_description: optionalText(5000),
  about_image_path: path,
  resume_path: path,
});
export const contactSchema = z.object({
  email,
  phone,
  location: optionalText(200),
  availability_text: optionalText(250),
  contact_heading: requiredText(180),
  contact_description: optionalText(1000),
});
export const contactMessageSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .max(254, "Email must be 254 characters or fewer.")
    .email("Please enter a valid email address."),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(200, "Subject must be 200 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(5000, "Message must be 5000 characters or fewer."),
});
export const settingsSchema = z.object({
  brand_name: optionalText(24),
  hero_eyebrow: requiredText(100),
  hero_caption: optionalText(100),
  hero_cta_text: requiredText(60),
  contact_heading: requiredText(180),
  contact_description: optionalText(1000),
  footer_text: requiredText(180),
  projects_heading: requiredText(160),
  projects_description: optionalText(1000),
  skills_heading: requiredText(160),
  skills_description: optionalText(1000),
  show_statistics: z.boolean(),
  show_projects: z.boolean(),
  show_skills: z.boolean(),
  show_about: z.boolean(),
  show_contact: z.boolean(),
});
export const projectSchema = z.object({
  title: requiredText(160),
  slug: requiredText(180).regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens.",
  ),
  category: optionalText(100),
  short_description: optionalText(500),
  full_description: optionalText(15000),
  cover_image_path: path,
  live_url: url,
  repository_url: url,
  featured: z.boolean(),
  is_published: z.boolean(),
  sort_order: order,
  cover_display_type: z.enum(["desktop", "tablet", "mobile", "auto"]).default("desktop").optional().catch("desktop"),
  cover_fit: z.enum(["cover", "contain"]).default("cover").optional().catch("cover"),
  cover_position_x: z.coerce.number().min(-100).max(200).default(50.0).optional().catch(50.0),
  cover_position_y: z.coerce.number().min(-100).max(200).default(50.0).optional().catch(50.0),
  cover_zoom: z.coerce.number().min(0.2).max(5.0).default(1.0).optional().catch(1.0),
  technologies: z
    .array(requiredText(50))
    .max(30, "Use at most 30 technologies.")
    .refine(
      (values) =>
        new Set(values.map((value) => value.toLowerCase())).size ===
        values.length,
      "Remove duplicate technologies.",
    ),
});
export const skillSchema = z.object({
  name: requiredText(100),
  icon: optionalText(100),
  icon_path: path,
  category: optionalText(100),
  sort_order: order,
  is_visible: z.boolean(),
});
export const socialSchema = z.object({
  platform: requiredText(60),
  url: url.refine((value) => !!value, "A URL is required."),
  username: optionalText(100),
  sort_order: order,
  is_visible: z.boolean(),
});
export const statisticSchema = z.object({
  label: requiredText(100),
  value: requiredText(30),
  suffix: optionalText(15),
  sort_order: order,
  is_visible: z.boolean(),
});
export const educationSchema = z.object({
  institution: requiredText(200),
  degree: requiredText(200),
  field_of_study: optionalText(200),
  current_academic_level: optionalText(100),
  start_date: optionalText(100),
  end_date: optionalText(100),
  is_current: z.boolean(),
  location: optionalText(200),
  description: optionalText(5000),
  sort_order: order,
  is_visible: z.boolean(),
}).transform((value) => ({
  ...value,
  end_date: value.is_current ? null : value.end_date,
}));
export const experienceSchema = z.object({
  title: requiredText(200),
  organization: optionalText(200),
  type: optionalText(100),
  start_date: optionalText(100),
  end_date: optionalText(100),
  is_current: z.boolean(),
  description: optionalText(5000),
  status: optionalText(100),
  sort_order: order,
  is_visible: z.boolean(),
}).transform((value) => ({
  ...value,
  end_date: value.is_current ? null : value.end_date,
}));
export const certificateSchema = z.object({
  title: requiredText(200),
  issue_date: optionalText(100),
  certificate_image_path: path.refine(
    (value) => !!value,
    "Upload a certificate image before saving.",
  ),
  certificate_image_public_id: optionalText(255),
  sort_order: order,
  is_visible: z.boolean(),
});
export const schemas = {
  profile: profileSchema,
  about: aboutSchema,
  education: educationSchema,
  experience: experienceSchema,
  certificates: certificateSchema,
  contact: contactSchema,
  settings: settingsSchema,
  projects: projectSchema,
  skills: skillSchema,
  socials: socialSchema,
  statistics: statisticSchema,
};
export type Resource = keyof typeof schemas;
export const resourceSchema = z.enum([
  "profile",
  "about",
  "education",
  "experience",
  "certificates",
  "contact",
  "settings",
  "projects",
  "skills",
  "socials",
  "statistics",
]);
export const collectionResources = [
  "projects",
  "skills",
  "socials",
  "statistics",
  "education",
  "experience",
  "certificates",
] as const;
export type CollectionResource = (typeof collectionResources)[number];
export function isCollection(
  resource: Resource,
): resource is CollectionResource {
  return (collectionResources as readonly string[]).includes(resource);
}
export type FormValues = Record<
  string,
  string | boolean | number | string[] | null
>;
export interface ActionResult {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  id?: string;
}
export const initialResult: ActionResult = { status: "idle" };
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}
