import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin } from "./auth";
import { assetFields, signAssets } from "./storage";
import { readHeroSettingsFallback } from "./hero-settings-storage";
import { readCertificatesFallback } from "./certificates-storage";
import { getProjectPresentation } from "./project-settings-storage";
import {
  isCollection,
  type CollectionResource,
  type FormValues,
  type Resource,
} from "./schema";

export const collectionTables = {
  projects: "projects",
  skills: "skills",
  socials: "social_links",
  statistics: "statistics",
  education: "education",
  experience: "experience",
  certificates: "certificates",
} as const;

const collectionListColumns: Record<CollectionResource, string> = {
  projects:
    "id, title, category, is_published, featured, sort_order, cover_image_path, created_at",
  skills: "id, name, category, is_visible, sort_order, icon_path, icon, created_at",
  socials: "id, platform, url, is_visible, sort_order, created_at",
  statistics: "id, label, value, suffix, is_visible, sort_order, created_at",
  education:
    "id, institution, degree, current_academic_level, field_of_study, start_date, end_date, is_current, location, is_visible, sort_order, created_at",
  experience:
    "id, title, organization, type, is_visible, sort_order, created_at",
  certificates:
    "id, title, issue_date, is_visible, sort_order, certificate_image_path, created_at",
};

export async function loadEditor(resource: Resource, id?: string) {
  const { client } = await requireAdmin();
  if (isCollection(resource) && !id)
    return { values: {} as FormValues, previews: {} as Record<string, string> };
  const table = isCollection(resource)
    ? collectionTables[resource]
    : resource === "settings"
      ? "site_settings"
      : "profiles";
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq("id", id || true)
    .maybeSingle();

  let recordData = data;
  if (error || !data) {
    if (resource === "certificates" && id) {
      const fallbackList = readCertificatesFallback();
      const match = fallbackList.find((c) => c.id === id);
      if (match) {
        recordData = match as unknown as typeof data;
      } else {
        notFound();
      }
    } else {
      if (error) {
        throw new Error(
          "This content could not be loaded. Check your connection and database setup.",
        );
      }
      notFound();
    }
  }

  const values: FormValues = { ...(recordData as unknown as FormValues) };
  if (resource === "projects") {
    const { data: tags, error: tagError } = await client
      .from("project_technologies")
      .select("name")
      .eq("project_id", id!)
      .order("sort_order");
    if (tagError) throw new Error("Project technologies could not be loaded.");
    values.technologies = tags.map((tag) => tag.name);

    if (id) {
      const presentation = getProjectPresentation(id);
      values.cover_display_type = values.cover_display_type || presentation.cover_display_type;
      values.cover_fit = values.cover_fit || presentation.cover_fit;
      if (values.cover_position_x === undefined || values.cover_position_x === null) {
        values.cover_position_x = presentation.cover_position_x;
      }
      if (values.cover_position_y === undefined || values.cover_position_y === null) {
        values.cover_position_y = presentation.cover_position_y;
      }
      if (values.cover_zoom === undefined || values.cover_zoom === null) {
        values.cover_zoom = presentation.cover_zoom;
      }
    }
  }
  if (resource === "contact") {
    const { data: settings, error: settingsError } = await client
      .from("site_settings")
      .select("contact_heading, contact_description")
      .eq("id", true)
      .single();
    if (settingsError) throw new Error("Contact settings could not be loaded.");
    Object.assign(values, settings);
  }
  if (resource === "profile") {
    const fallback = readHeroSettingsFallback();
    if (!values.hero_image_mode) values.hero_image_mode = fallback.hero_image_mode;
    if (values.hero_image_scale === undefined || values.hero_image_scale === null) {
      values.hero_image_scale = fallback.hero_image_scale;
    }
    if (values.hero_image_position_x === undefined || values.hero_image_position_x === null) {
      values.hero_image_position_x = fallback.hero_image_position_x;
    }
    if (values.hero_image_position_y === undefined || values.hero_image_position_y === null) {
      values.hero_image_position_y = fallback.hero_image_position_y;
    }
  }
  const paths = assetFields.map((field) =>
    typeof values[field] === "string" ? (values[field] as string) : null,
  );
  return { values, previews: await signAssets(client, paths) };
}

export interface AdminItem {
  id: string;
  title: string;
  subtitle: string | null;
  visible: boolean;
  featured?: boolean;
  order: number;
  image?: string;
  iconKey?: string | null;
}

type CollectionRow = Record<string, unknown> & {
  id: string;
  sort_order: number;
  is_visible?: boolean;
  is_published?: boolean;
  featured?: boolean;
  cover_image_path?: string | null;
  certificate_image_path?: string | null;
  icon_path?: string | null;
  icon?: string | null;
};

export async function loadCollection(
  resource: CollectionResource,
): Promise<AdminItem[]> {
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from(collectionTables[resource])
    .select(collectionListColumns[resource])
    .order("sort_order")
    .order("created_at");

  let rows = data as CollectionRow[] | null;
  if (error || !rows) {
    if (resource === "certificates") {
      rows = readCertificatesFallback() as unknown as CollectionRow[];
    } else {
      throw new Error("The collection could not be loaded. Please try again.");
    }
  }

  const paths = rows.map((row) => row.cover_image_path || row.certificate_image_path || row.icon_path || null);
  const signed = await signAssets(client, paths);
  return rows.map((row) => toAdminItem(row, signed));
}

function toAdminItem(
  row: CollectionRow,
  signed: Record<string, string>,
): AdminItem {
  return {
    id: row.id,
    title: getRowTitle(row),
    subtitle: getRowSubtitle(row),
    visible:
      typeof row.is_published === "boolean"
        ? row.is_published
        : row.is_visible !== false,
    featured: row.featured,
    order: row.sort_order,
    image:
      row.cover_image_path && signed[row.cover_image_path]
        ? signed[row.cover_image_path]
        : row.certificate_image_path && signed[row.certificate_image_path]
          ? signed[row.certificate_image_path]
          : row.icon_path && signed[row.icon_path]
            ? signed[row.icon_path]
            : undefined,
    iconKey: row.icon || null,
  };
}

function getRowTitle(row: CollectionRow) {
  if (typeof row.institution === "string") return row.institution;
  if (typeof row.title === "string") return row.title;
  if (typeof row.name === "string") return row.name;
  if (typeof row.platform === "string") return row.platform;
  if (typeof row.label === "string") return row.label;
  return "Untitled";
}

function getRowSubtitle(row: CollectionRow) {
  if ("certificate_image_path" in row) {
    return [row.issue_date].filter(Boolean).join(" • ") || null;
  }
  if (typeof row.degree === "string") {
    const date = formatDateRange(
      text(row.start_date),
      text(row.end_date),
      row.is_current === true,
    );
    return [
      [row.degree, row.current_academic_level].filter(Boolean).join(" - "),
      row.field_of_study,
      date,
      row.location,
    ]
      .filter(Boolean)
      .join(" • ");
  }
  if ("organization" in row) {
    return [row.organization, row.type].filter(Boolean).join(" • ") || null;
  }
  if (typeof row.category === "string") return row.category;
  if (typeof row.url === "string") return row.url;
  if (typeof row.value === "string") return row.value + (text(row.suffix) || "");
  return null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function formatDateRange(start?: string, end?: string, current?: boolean) {
  if (start && current) return `${start} - Present`;
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  if (current) return "Present";
  return null;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function loadUnreadMessagesCount(): Promise<number> {
  try {
    const { client } = await requireAdmin();
    const { count, error } = await client
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function loadContactMessages(): Promise<{
  messages: AdminContactMessage[];
  unreadCount: number;
  tableMissing?: boolean;
}> {
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from("contact_messages")
    .select("id, name, email, subject, message, is_read, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.code === "42P01" ||
      error.message?.toLowerCase().includes("does not exist") ||
      error.message?.toLowerCase().includes("schema cache")
    ) {
      return { messages: [], unreadCount: 0, tableMissing: true };
    }
    throw new Error("Messages could not be loaded. Please try again.");
  }

  const messages: AdminContactMessage[] = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  }));

  const unreadCount = messages.filter((m) => !m.isRead).length;
  return { messages, unreadCount, tableMissing: false };
}

export async function loadDashboard() {
  const { client } = await requireAdmin();
  const [projects, skills, socials, messages, profile] = await Promise.all([
    client.from("projects").select("id", { count: "exact", head: true }),
    client.from("skills").select("id", { count: "exact", head: true }),
    client.from("social_links").select("id", { count: "exact", head: true }),
    client
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
    client
      .from("profiles")
      .select("owner_name, profile_image_path, resume_path, email, phone")
      .eq("id", true)
      .single(),
  ]);
  if (projects.error || skills.error || socials.error || profile.error)
    throw new Error(
      "Dashboard data is unavailable. Check the Supabase migration and try again.",
    );
  return {
    projects: projects.count || 0,
    skills: skills.count || 0,
    socials: socials.count || 0,
    unreadMessages: messages.error ? 0 : (messages.count || 0),
    profile: profile.data,
  };
}
