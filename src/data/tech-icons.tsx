import { SIMPLE_ICONS_DATA } from "./simple-icons-data";

export interface TechIconDefinition {
  key: string;
  name: string;
  category?: string;
  color?: string;
  path?: string;
  isCustomSvg?: boolean;
  svgRender?: (props: { size?: number; className?: string }) => React.ReactNode;
}

// Fallback registry for concepts or tools not present directly in simple-icons
export const FALLBACK_ICONS: TechIconDefinition[] = [
  {
    key: "openai",
    name: "OpenAI",
    category: "AI Tool",
    color: "#412991",
    path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  },
  {
    key: "chatgpt",
    name: "ChatGPT",
    category: "AI Tool",
    color: "#74AA9C",
    path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  },
  {
    key: "playwright",
    name: "Playwright",
    category: "Testing",
    color: "#2EAD33",
    path: "M17.4 8.7c-.5-1.5-1.7-2.6-3.2-3.1-2.2-.7-4.6.4-5.3 2.6L4.5 20.8c-.3.8.3 1.7 1.2 1.7h7.8c.8 0 1.5-.5 1.8-1.2l2.1-12.6zm2.1-5.4c-1.3-.8-3.1-.3-3.8 1.1l-2.4 4.8 5.1 1.7 2.3-4.5c.6-1.3.1-2.6-1.2-3.1z",
  },
  {
    key: "restapi",
    name: "REST API",
    category: "Backend",
    color: "#0288D1",
    path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 13h10v-2H7v2zm7-4l3 3-3 3v-2H9v-2h5V9z",
  },
  {
    key: "websocket",
    name: "WebSocket",
    category: "Backend",
    color: "#E65100",
    path: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z",
  },
  {
    key: "css3",
    name: "CSS3",
    category: "Frontend",
    color: "#1572B6",
    path: "M2.5 1.5l1.7 19.3L12 23.5l7.8-2.7 1.7-19.3H2.5zm15.7 15.6l-6.2 2.2-6.2-2.2-1.4-15.6h15.2l-1.4 15.6z",
  },
];

// Curated popular icons shown by default when search query is empty
export const POPULAR_ICON_SLUGS = [
  "python",
  "javascript",
  "typescript",
  "react",
  "nextdotjs",
  "nodedotjs",
  "tailwindcss",
  "postgresql",
  "supabase",
  "docker",
  "git",
  "github",
  "openai",
  "googlegemini",
  "claude",
  "huggingface",
  "tensorflow",
  "pytorch",
  "langchain",
  "flask",
  "django",
  "fastapi",
  "express",
  "mongodb",
  "mysql",
  "sqlite",
  "redis",
  "firebase",
  "vercel",
  "netlify",
  "cloudinary",
  "playwright",
  "cypress",
  "jest",
  "vitest",
  "figma",
  "postman",
  "graphql",
  "linux",
];

// Aliases mapping common search terms & old stored database keys to canonical slug
export const ICON_ALIASES: Record<string, string> = {
  // Database / Legacy Keys compatibility
  nextjs: "nextdotjs",
  tailwind: "tailwindcss",
  node: "nodedotjs",
  nodejs: "nodedotjs",
  vue: "vuedotjs",
  vuejs: "vuedotjs",
  chartjs: "chartdotjs",
  gemini: "googlegemini",
  google_gemini: "googlegemini",
  anthropic: "claude",
  hugging_face: "huggingface",
  hf: "huggingface",
  tf: "tensorflow",
  postgres: "postgresql",
  py: "python",
  js: "javascript",
  ts: "typescript",
  golang: "go",
  html: "html5",
  css: "css3",
  reactjs: "react",
  next: "nextdotjs",
  docker_compose: "docker",
  gh: "github",
  chat_gpt: "chatgpt",
  open_ai: "openai",
};

// Known category inference table
export const CATEGORY_MAP: Record<string, string> = {
  python: "Programming Language",
  javascript: "Programming Language",
  typescript: "Programming Language",
  php: "Programming Language",
  go: "Programming Language",
  rust: "Programming Language",
  ruby: "Programming Language",
  kotlin: "Programming Language",
  swift: "Programming Language",
  cplusplus: "Programming Language",
  react: "Frontend",
  nextdotjs: "Framework",
  vuedotjs: "Frontend",
  svelte: "Frontend",
  angular: "Frontend",
  astro: "Framework",
  nuxt: "Framework",
  remix: "Framework",
  html5: "Frontend",
  css3: "Frontend",
  css: "Frontend",
  tailwindcss: "Styling",
  bootstrap: "Styling",
  sass: "Styling",
  nodedotjs: "Backend",
  express: "Backend",
  flask: "Backend",
  django: "Backend",
  fastapi: "Backend",
  restapi: "Backend",
  websocket: "Backend",
  graphql: "Backend",
  postgresql: "Database",
  supabase: "Database",
  sqlite: "Database",
  mysql: "Database",
  mongodb: "Database",
  redis: "Database",
  firebase: "Database",
  docker: "DevOps",
  kubernetes: "DevOps",
  git: "Development Tool",
  github: "Development Tool",
  gitlab: "Development Tool",
  vercel: "Cloud / Hosting",
  netlify: "Cloud / Hosting",
  cloudinary: "Cloud / Media",
  googlecloud: "Cloud",
  playwright: "Testing",
  cypress: "Testing",
  jest: "Testing",
  vitest: "Testing",
  openai: "AI Tool",
  chatgpt: "AI Tool",
  googlegemini: "AI Tool",
  claude: "AI Tool",
  huggingface: "AI Tool",
  tensorflow: "AI Tool",
  pytorch: "AI Tool",
  langchain: "AI Tool",
  figma: "Design",
  postman: "Development Tool",
  swagger: "Development Tool",
  linux: "Operating System",
};

// Fast lookup maps initialized once
const ALL_ICONS_MAP = new Map<string, TechIconDefinition>();

// 1. Add Fallback icons first
for (const item of FALLBACK_ICONS) {
  ALL_ICONS_MAP.set(item.key.toLowerCase(), item);
}

// 2. Add Simple Icons
for (const icon of SIMPLE_ICONS_DATA) {
  const slug = icon.slug.toLowerCase();
  if (!ALL_ICONS_MAP.has(slug)) {
    ALL_ICONS_MAP.set(slug, {
      key: slug,
      name: icon.title,
      category: CATEGORY_MAP[slug] || "Technology",
      color: icon.hex ? `#${icon.hex}` : "#D4AF37",
      path: icon.path,
    });
  }
}

// Helper to resolve an icon key considering aliases & normalization
export function getTechIcon(keyOrName: string): TechIconDefinition | undefined {
  if (!keyOrName) return undefined;
  const raw = keyOrName.trim().toLowerCase();
  const normalized = raw.replace(/[^a-z0-9]/g, "");

  // Direct hit
  if (ALL_ICONS_MAP.has(raw)) return ALL_ICONS_MAP.get(raw);
  if (ALL_ICONS_MAP.has(normalized)) return ALL_ICONS_MAP.get(normalized);

  // Alias lookup
  const aliasTarget = ICON_ALIASES[raw] || ICON_ALIASES[normalized];
  if (aliasTarget && ALL_ICONS_MAP.has(aliasTarget)) {
    return ALL_ICONS_MAP.get(aliasTarget);
  }

  // Exact title match search
  for (const item of ALL_ICONS_MAP.values()) {
    if (item.name.toLowerCase() === raw) {
      return item;
    }
  }

  return undefined;
}

// Search through the entire library of 3,400+ icons
export function searchTechIcons(query: string, limit = 40): TechIconDefinition[] {
  const q = query.trim().toLowerCase();
  const qClean = q.replace(/[^a-z0-9]/g, "");

  // If query is empty, return popular curated icons
  if (!q) {
    const popular: TechIconDefinition[] = [];
    for (const slug of POPULAR_ICON_SLUGS) {
      const icon = getTechIcon(slug);
      if (icon && !popular.includes(icon)) {
        popular.push(icon);
      }
    }
    return popular.slice(0, limit);
  }

  // Check alias
  const aliasMatch = ICON_ALIASES[q] || ICON_ALIASES[qClean];
  const results: TechIconDefinition[] = [];
  const seen = new Set<string>();

  if (aliasMatch) {
    const aliased = getTechIcon(aliasMatch);
    if (aliased) {
      results.push(aliased);
      seen.add(aliased.key);
    }
  }

  // Exact slug / name match
  const direct = getTechIcon(q);
  if (direct && !seen.has(direct.key)) {
    results.push(direct);
    seen.add(direct.key);
  }

  // Filter with prefix and inclusion scoring
  const startsWithTitle: TechIconDefinition[] = [];
  const includesTitle: TechIconDefinition[] = [];
  const startsWithSlug: TechIconDefinition[] = [];
  const otherMatches: TechIconDefinition[] = [];

  for (const item of ALL_ICONS_MAP.values()) {
    if (seen.has(item.key)) continue;

    const titleLower = item.name.toLowerCase();
    const slugLower = item.key;

    if (titleLower.startsWith(q)) {
      startsWithTitle.push(item);
    } else if (slugLower.startsWith(q) || slugLower.startsWith(qClean)) {
      startsWithSlug.push(item);
    } else if (titleLower.includes(q)) {
      includesTitle.push(item);
    } else if (slugLower.includes(q) || slugLower.includes(qClean)) {
      otherMatches.push(item);
    }
  }

  const combined = [
    ...results,
    ...startsWithTitle,
    ...startsWithSlug,
    ...includesTitle,
    ...otherMatches,
  ];

  return combined.slice(0, limit);
}

// Auto-suggest tech icon when user types skill name
export function suggestTechIconFromName(skillName: string): TechIconDefinition | undefined {
  if (!skillName || !skillName.trim()) return undefined;
  const name = skillName.trim();
  return getTechIcon(name);
}

export const TECH_ICON_MAP = ALL_ICONS_MAP;
export const TECH_ICON_KEYS = Array.from(ALL_ICONS_MAP.keys());
