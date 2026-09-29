import {
  Code2,
  Terminal,
  Database,
  Globe,
  Layers,
  Palette,
  Cloud,
  Cpu,
} from "lucide-react";
import { getTechIcon } from "@/data/tech-icons";

const legacyIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  code: Code2,
  terminal: Terminal,
  database: Database,
  globe: Globe,
  layers: Layers,
  palette: Palette,
  cloud: Cloud,
  cpu: Cpu,
};

export function SkillIcon({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  if (!name) return null;

  // 1. Resolve from large technology icon library
  const tech = getTechIcon(name);
  if (tech) {
    if (tech.svgRender) {
      return tech.svgRender({ size, className });
    }
    if (tech.path) {
      const color = tech.color || "currentColor";
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          style={{ display: "inline-block", verticalAlign: "middle" }}
          aria-hidden="true"
        >
          <path d={tech.path} fill={color} />
        </svg>
      );
    }
  }

  // 2. Resolve legacy Lucide generic icon keywords
  const normalizedKey = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const Legacy = legacyIcons[name] || legacyIcons[normalizedKey];
  if (Legacy) {
    return <Legacy size={size} className={className} aria-hidden="true" />;
  }

  // 3. Fallback generic icon
  return <Terminal size={size} className={className} aria-hidden="true" />;
}
