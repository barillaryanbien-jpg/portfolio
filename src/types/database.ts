export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
interface Timestamped {
  created_at: string;
  updated_at: string;
}
export interface ProfileRow extends Timestamped {
  id: boolean;
  owner_name: string;
  professional_title: string | null;
  short_intro: string | null;
  bio: string | null;
  profile_image_path: string | null;
  resume_path: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  availability_text: string | null;
  about_heading: string | null;
  secondary_description: string | null;
  about_image_path: string | null;
  hero_image_mode?: string | null;
  hero_image_scale?: number | null;
  hero_image_position_x?: number | null;
  hero_image_position_y?: number | null;
}
export interface SettingsRow extends Timestamped {
  id: boolean;
  brand_name: string | null;
  hero_eyebrow: string;
  hero_caption: string | null;
  hero_cta_text: string;
  contact_heading: string;
  contact_description: string | null;
  footer_text: string;
  projects_heading: string;
  projects_description: string | null;
  skills_heading: string;
  skills_description: string | null;
  show_statistics: boolean;
  show_projects: boolean;
  show_skills: boolean;
  show_about: boolean;
  show_contact: boolean;
}
export interface ProjectRow extends Timestamped {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  cover_image_path: string | null;
  category: string | null;
  live_url: string | null;
  repository_url: string | null;
  featured: boolean;
  is_published: boolean;
  sort_order: number;

}
export interface SkillRow extends Timestamped {
  id: string;
  name: string;
  icon: string | null;
  icon_path: string | null;
  category: string | null;
  sort_order: number;
  is_visible: boolean;
}
export interface SocialRow extends Timestamped {
  id: string;
  platform: string;
  url: string;
  username: string | null;
  sort_order: number;
  is_visible: boolean;
}
export interface StatisticRow extends Timestamped {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  sort_order: number;
  is_visible: boolean;
}
export interface EducationRow extends Timestamped {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  current_academic_level: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  location: string | null;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
}
export interface ExperienceRow extends Timestamped {
  id: string;
  title: string;
  organization: string | null;
  type: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  status: string | null;
  sort_order: number;
  is_visible: boolean;
}
export interface CertificateRow extends Timestamped {
  id: string;
  title: string;
  issuer: string | null;
  category: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  certificate_image_path: string | null;
  certificate_image_public_id: string | null;
  sort_order: number;
  is_visible: boolean;
}
export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
type Table<Row> = {
  Row: { [Key in keyof Row]: Row[Key] };
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};
export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      site_settings: Table<SettingsRow>;
      projects: Table<ProjectRow>;
      skills: Table<SkillRow>;
      social_links: Table<SocialRow>;
      statistics: Table<StatisticRow>;
      education: Table<EducationRow>;
      experience: Table<ExperienceRow>;
      certificates: Table<CertificateRow>;
      contact_messages: Table<ContactMessageRow>;
      project_technologies: Table<{
        project_id: string;
        name: string;
        sort_order: number;
      }>;
    };
    Views: { [key: string]: never };
    Functions: {
      is_portfolio_admin: { Args: Record<string, never>; Returns: boolean };
      get_public_profile: {
        Args: Record<string, never>;
        Returns: ProfileRow[];
      };
      save_project: {
        Args: { record: Json; technologies: string[] };
        Returns: string;
      };
      save_contact: { Args: { record: Json }; Returns: undefined };
      asset_is_referenced: { Args: { object_path: string }; Returns: boolean };
    };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
}
