import fs from "fs";
import path from "path";

export interface HeroImageSettingsData {
  hero_image_mode: "cutout" | "full";
  hero_image_scale: number;
  hero_image_position_x: number;
  hero_image_position_y: number;
}

export const DEFAULT_HERO_IMAGE_SETTINGS: HeroImageSettingsData = {
  hero_image_mode: "cutout",
  hero_image_scale: 1.0,
  hero_image_position_x: 50.0,
  hero_image_position_y: 55.0,
};

function getSettingsFilePath(): string {
  return path.join(process.cwd(), "src", "data", "hero-settings.json");
}

export function readHeroSettingsFallback(): HeroImageSettingsData {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return {
        hero_image_mode: parsed.hero_image_mode === "full" ? "full" : "cutout",
        hero_image_scale:
          typeof parsed.hero_image_scale === "number"
            ? parsed.hero_image_scale
            : 1.0,
        hero_image_position_x:
          typeof parsed.hero_image_position_x === "number"
            ? parsed.hero_image_position_x
            : 50.0,
        hero_image_position_y:
          typeof parsed.hero_image_position_y === "number"
            ? parsed.hero_image_position_y
            : 55.0,
      };
    }
  } catch (err) {
    console.error("[readHeroSettingsFallback] Error reading fallback settings:", err);
  }
  return DEFAULT_HERO_IMAGE_SETTINGS;
}

export function writeHeroSettingsFallback(
  settings: Partial<HeroImageSettingsData>,
): boolean {
  try {
    const current = readHeroSettingsFallback();
    const updated: HeroImageSettingsData = {
      hero_image_mode:
        settings.hero_image_mode === "full" ? "full" : (settings.hero_image_mode || current.hero_image_mode),
      hero_image_scale:
        typeof settings.hero_image_scale === "number"
          ? settings.hero_image_scale
          : current.hero_image_scale,
      hero_image_position_x:
        typeof settings.hero_image_position_x === "number"
          ? settings.hero_image_position_x
          : current.hero_image_position_x,
      hero_image_position_y:
        typeof settings.hero_image_position_y === "number"
          ? settings.hero_image_position_y
          : current.hero_image_position_y,
    };
    const filePath = getSettingsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[writeHeroSettingsFallback] Error writing fallback settings:", err);
    return false;
  }
}
