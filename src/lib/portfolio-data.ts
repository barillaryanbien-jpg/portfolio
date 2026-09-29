import "server-only";
import { cache } from "react";
import { portfolio as initialPortfolio } from "@/data/portfolio";
import { createPublicClient } from "@/lib/supabase/server";
import { signAssets } from "@/lib/admin/storage";
import { readHeroSettingsFallback } from "@/lib/admin/hero-settings-storage";
import { readCertificatesFallback } from "@/lib/admin/certificates-storage";
import { getProjectPresentation } from "@/lib/admin/project-settings-storage";
import type { PortfolioData, Project } from "@/types/portfolio";

export const getPortfolio = cache(async (): Promise<PortfolioData> => {
  const client = createPublicClient();
  const heroFallback = readHeroSettingsFallback();
  // Setup-only fallback; once configured the database is the sole content source.
  if (!client) return initialPortfolio;
  const [
    profileResult,
    settingsResult,
    projectsResult,
    skillsResult,
    statsResult,
    socialsResult,
    tagsResult,
    educationResult,
    experienceResult,
    certificatesResult,
  ] = await Promise.all([
    client.rpc("get_public_profile"),
    client
      .from("site_settings")
      .select(
        "brand_name, footer_text, show_statistics, show_projects, show_skills, show_about, show_contact, hero_eyebrow, hero_caption, hero_cta_text, contact_heading, contact_description, projects_heading, projects_description, skills_heading, skills_description",
      )
      .eq("id", true)
      .single(),
    client
      .from("projects")
      .select(
        "id, title, slug, featured, short_description, cover_image_path, category, live_url, repository_url, sort_order",
      )
      .eq("is_published", true)
      .eq("featured", true)
      .order("sort_order")
      .order("created_at")
      .limit(3),
    client
      .from("skills")
      .select("id, name, icon, icon_path, category, sort_order")
      .eq("is_visible", true)
      .order("sort_order")
      .order("created_at"),
    client
      .from("statistics")
      .select("id, label, value, suffix")
      .eq("is_visible", true)
      .order("sort_order")
      .order("created_at"),
    client
      .from("social_links")
      .select("platform, url")
      .eq("is_visible", true)
      .order("sort_order")
      .order("created_at"),
    client
      .from("project_technologies")
      .select("project_id, name")
      .order("sort_order"),
    client
      .from("education")
      .select(
        "id, institution, degree, field_of_study, current_academic_level, start_date, end_date, is_current, location, description, sort_order",
      )
      .eq("is_visible", true)
      .order("sort_order")
      .order("created_at"),
    client
      .from("experience")
      .select(
        "id, title, organization, type, start_date, end_date, is_current, description, status, sort_order",
      )
      .eq("is_visible", true)
      .order("sort_order")
      .order("created_at"),
    client
      .from("certificates")
      .select(
        "id, title, issuer, category, issue_date, expiration_date, credential_id, credential_url, description, certificate_image_path, sort_order",
      )
      .eq("is_visible", true)
      .order("sort_order")
      .order("created_at"),
  ]);
  const queryErrors: Record<string, unknown> = {};
  if (profileResult.error) queryErrors.profile = profileResult.error;
  if (settingsResult.error) queryErrors.settings = settingsResult.error;
  if (projectsResult.error) queryErrors.projects = projectsResult.error;
  if (skillsResult.error) queryErrors.skills = skillsResult.error;
  if (statsResult.error) queryErrors.stats = statsResult.error;
  if (socialsResult.error) queryErrors.socials = socialsResult.error;
  if (tagsResult.error) queryErrors.tags = tagsResult.error;
  if (educationResult.error) queryErrors.education = educationResult.error;
  if (experienceResult.error) queryErrors.experience = experienceResult.error;
  if (!profileResult.data?.[0]) queryErrors.profileRowMissing = "Profile row not found in get_public_profile()";

  if (
    Object.keys(queryErrors).length > 0 ||
    !profileResult.data?.[0] ||
    !settingsResult.data ||
    !projectsResult.data ||
    !skillsResult.data ||
    !statsResult.data ||
    !socialsResult.data ||
    !tagsResult.data
  ) {
    console.error("[getPortfolio] Failed queries:", JSON.stringify(queryErrors, null, 2));
    const firstKey = Object.keys(queryErrors)[0] || "database_results";
    const firstErr = queryErrors[firstKey] || "One or more database result sets were null";
    throw new Error(
      `Portfolio content could not be loaded: ${firstKey} query failed (${typeof firstErr === "object" && firstErr && "message" in firstErr ? String((firstErr as { message: unknown }).message) : String(firstErr)})`
    );
  }
  const profile = profileResult.data[0];
  const settings = settingsResult.data;
  const certificatesData = certificatesResult.data && !certificatesResult.error
    ? certificatesResult.data
    : readCertificatesFallback().filter((c) => c.is_visible);

  const assets = await signAssets(client, [
    profile.profile_image_path,
    profile.about_image_path,
    profile.resume_path,
    ...projectsResult.data.map((project) => project.cover_image_path),
    ...skillsResult.data.map((skill) => skill.icon_path),
    ...certificatesData.map((cert) => cert.certificate_image_path),
  ]);
  const image = (path: string | null | undefined, alt: string) =>
    path && assets[path] ? { src: assets[path], alt } : undefined;
  const resume =
    profile.resume_path && assets[profile.resume_path]
      ? { label: "Download CV", url: assets[profile.resume_path] }
      : undefined;
  return {
    profile: {
      name: profile.owner_name,
      title: profile.professional_title || undefined,
      image: image(profile.profile_image_path, profile.owner_name),
      resume,
      heroImageMode:
        (profile.hero_image_mode as "cutout" | "full") ||
        heroFallback.hero_image_mode,
      heroImageScale:
        typeof profile.hero_image_scale === "number"
          ? Number(profile.hero_image_scale)
          : heroFallback.hero_image_scale,
      heroImagePositionX:
        typeof profile.hero_image_position_x === "number"
          ? Number(profile.hero_image_position_x)
          : heroFallback.hero_image_position_x,
      heroImagePositionY:
        typeof profile.hero_image_position_y === "number"
          ? Number(profile.hero_image_position_y)
          : heroFallback.hero_image_position_y,
    },
    brandName: settings.brand_name || undefined,
    footerText: settings.footer_text,
    visibility: {
      statistics: settings.show_statistics,
      projects: settings.show_projects,
      skills: settings.show_skills,
      about: settings.show_about,
      contact: settings.show_contact,
    },
    navigation: [],
    hero: {
      eyebrow: settings.hero_eyebrow,
      caption: settings.hero_caption || undefined,
      introduction: profile.short_intro || undefined,
      actions: settings.show_projects
        ? [{ label: settings.hero_cta_text, url: "#projects" }]
        : [],
    },
    statistics: statsResult.data.map((stat) => ({
      id: stat.id,
      label: stat.label,
      value: stat.value + (stat.suffix || ""),
    })),
    projects: (projectsResult.data || []).map((project) => {
      const presentation = getProjectPresentation(project.id || project.slug);
      return {
        id: project.id,
        title: project.title,
        slug: project.slug,
        featured: project.featured,
        description: project.short_description || undefined,
        image: image(project.cover_image_path, project.title),
        category: project.category || undefined,
        technologies: tagsResult.data
          .filter((tag) => tag.project_id === project.id)
          .map((tag) => tag.name),
        liveUrl: project.live_url || undefined,
        repositoryUrl: project.repository_url || undefined,
        order: project.sort_order,
        displayType: presentation.cover_display_type,
        fit: presentation.cover_fit,
        positionX: presentation.cover_position_x,
        positionY: presentation.cover_position_y,
        zoom: presentation.cover_zoom,
      };
    }),
    skills: skillsResult.data.map((skill) => ({
      id: skill.id,
      name: skill.name,
      icon: image(skill.icon_path, ""),
      iconName: skill.icon || undefined,
      category: skill.category || undefined,
      order: skill.sort_order,
    })),
    education: (educationResult.data || []).map((item) => ({
      id: item.id,
      institution: item.institution,
      degree: item.degree,
      fieldOfStudy: item.field_of_study || undefined,
      currentAcademicLevel: item.current_academic_level || undefined,
      startDate: item.start_date || undefined,
      endDate: item.end_date || undefined,
      isCurrent: !!item.is_current,
      location: item.location || undefined,
      description: item.description || undefined,
      order: item.sort_order,
    })),
    experience: (experienceResult.data || []).map((item) => ({
      id: item.id,
      title: item.title,
      organization: item.organization || undefined,
      type: item.type || undefined,
      startDate: item.start_date || undefined,
      endDate: item.end_date || undefined,
      isCurrent: !!item.is_current,
      description: item.description || undefined,
      status: item.status || undefined,
      order: item.sort_order,
    })),
    certificates: certificatesData.map((item) => ({
      id: item.id,
      title: item.title,
      issuer: item.issuer || undefined,
      category: item.category || undefined,
      issueDate: item.issue_date || undefined,
      expirationDate: item.expiration_date || undefined,
      credentialId: item.credential_id || undefined,
      credentialUrl: item.credential_url || undefined,
      description: item.description || undefined,
      image: image(item.certificate_image_path, item.title),
      imagePath: item.certificate_image_path || undefined,
      order: item.sort_order,
    })),
    presentation: {
      projects: {
        eyebrow: "Selected work",
        heading: settings.projects_heading,
        description: settings.projects_description || undefined,
      },
      skills: {
        eyebrow: "Skills & technologies",
        heading: settings.skills_heading,
        description: settings.skills_description || undefined,
      },
    },
    about: profile.bio
      ? {
          heading: profile.about_heading || undefined,
          biography: profile.bio,
          secondaryDescription: profile.secondary_description || undefined,
          image: image(
            profile.about_image_path,
            `${profile.owner_name} — About`,
          ),
          statistics: [],
        }
      : undefined,
    contact: {
      heading: settings.contact_heading,
      description: settings.contact_description || undefined,
      email: profile.email || undefined,
      phone: profile.phone || undefined,
      location: profile.location || undefined,
      availability: profile.availability_text || undefined,
    },
    socialLinks: socialsResult.data.map((social) => ({
      label: social.platform,
      url: social.url,
    })),
  };
});

export const getAllProjects = cache(async (): Promise<Project[]> => {
  const client = createPublicClient();
  if (!client) return [];

  const [projectsResult, tagsResult] = await Promise.all([
    client
      .from("projects")
      .select(
        "id, title, slug, featured, short_description, cover_image_path, category, live_url, repository_url, sort_order",
      )
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at"),
    client.from("project_technologies").select("project_id, name").order("sort_order"),
  ]);

  if (projectsResult.error || !projectsResult.data) {
    return [];
  }

  const paths = projectsResult.data.map((p) => p.cover_image_path).filter(Boolean);
  const assets = await signAssets(client, paths);

  function image(path: string | null, alt: string) {
    return path && assets[path] ? { src: assets[path], alt } : undefined;
  }

  const tags = tagsResult.data || [];

  return (projectsResult.data || []).map((project) => {
    const presentation = getProjectPresentation(project.id || project.slug);
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      featured: project.featured,
      description: project.short_description || undefined,
      image: image(project.cover_image_path, project.title),
      category: project.category || undefined,
      technologies: tags
        .filter((tag) => tag.project_id === project.id)
        .map((tag) => tag.name),
      liveUrl: project.live_url || undefined,
      repositoryUrl: project.repository_url || undefined,
      order: project.sort_order,
      displayType: presentation.cover_display_type,
      fit: presentation.cover_fit,
      positionX: presentation.cover_position_x,
      positionY: presentation.cover_position_y,
      zoom: presentation.cover_zoom,
    };
  });
});
