import fs from "fs";
import path from "path";
import type { ProjectDisplayType, ProjectFit } from "@/types/portfolio";

export interface ProjectPresentationData {
  cover_display_type: ProjectDisplayType;
  cover_fit: ProjectFit;
  cover_position_x: number;
  cover_position_y: number;
  cover_zoom: number;
}

export const DEFAULT_PROJECT_PRESENTATION: ProjectPresentationData = {
  cover_display_type: "desktop",
  cover_fit: "contain",
  cover_position_x: 50.0,
  cover_position_y: 50.0,
  cover_zoom: 1.0,
};

function getSettingsFilePath(): string {
  return path.join(process.cwd(), "src", "data", "project-presentations.json");
}

export function readProjectPresentations(): Record<string, ProjectPresentationData> {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as Record<string, ProjectPresentationData>;
    }
  } catch (err) {
    console.error("[readProjectPresentations] Error reading project presentation store:", err);
  }
  return {};
}

export function getProjectPresentation(idOrSlug: string): ProjectPresentationData {
  const store = readProjectPresentations();
  return store[idOrSlug] || DEFAULT_PROJECT_PRESENTATION;
}

export function saveProjectPresentation(
  idOrSlug: string,
  data: Partial<ProjectPresentationData>,
): boolean {
  try {
    const filePath = getSettingsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const store = readProjectPresentations();
    const current = store[idOrSlug] || DEFAULT_PROJECT_PRESENTATION;
    store[idOrSlug] = {
      cover_display_type: data.cover_display_type || current.cover_display_type,
      cover_fit: data.cover_fit || current.cover_fit,
      cover_position_x: typeof data.cover_position_x === "number" ? data.cover_position_x : current.cover_position_x,
      cover_position_y: typeof data.cover_position_y === "number" ? data.cover_position_y : current.cover_position_y,
      cover_zoom: typeof data.cover_zoom === "number" ? data.cover_zoom : current.cover_zoom,
    };
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[saveProjectPresentation] Error saving project presentation store:", err);
    return false;
  }
}
