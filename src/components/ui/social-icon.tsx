import React from "react";
import {
  siFacebook,
  siGithub,
  siInstagram,
  siX,
  siYoutube,
  siTiktok,
  siDiscord,
  siMessenger,
  siTelegram,
  siWhatsapp,
} from "simple-icons";
import { Globe, Link as LinkIcon } from "lucide-react";

interface SocialIconProps {
  platform: string;
  url?: string;
  size?: number;
  className?: string;
}

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.222 0h.003z";

const TWITTER_BIRD_PATH =
  "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z";

type SvgIconDefinition = {
  type: "svg";
  path: string;
};

type LucideIconDefinition = {
  type: "lucide";
  component: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
};

type ResolvedIcon = SvgIconDefinition | LucideIconDefinition;

/**
 * Normalized resolution of platform name or URL into icon definition
 */
export function resolveSocialIconDefinition(platform: string, url?: string): ResolvedIcon {
  const normPlatform = (platform || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const normUrl = (url || "").toLowerCase().trim();

  // 1. Facebook
  if (
    normPlatform.includes("facebook") ||
    normPlatform === "fb" ||
    normUrl.includes("facebook.com") ||
    normUrl.includes("fb.me") ||
    normUrl.includes("fb.com")
  ) {
    return { type: "svg", path: siFacebook.path };
  }

  // 2. GitHub
  if (
    normPlatform.includes("github") ||
    normPlatform === "gh" ||
    normUrl.includes("github.com")
  ) {
    return { type: "svg", path: siGithub.path };
  }

  // 3. LinkedIn
  if (
    normPlatform.includes("linkedin") ||
    normPlatform === "li" ||
    normUrl.includes("linkedin.com")
  ) {
    return { type: "svg", path: LINKEDIN_PATH };
  }

  // 4. Instagram
  if (
    normPlatform.includes("instagram") ||
    normPlatform === "ig" ||
    normPlatform === "insta" ||
    normUrl.includes("instagram.com")
  ) {
    return { type: "svg", path: siInstagram.path };
  }

  // 5. X / Twitter
  if (
    normPlatform === "x" ||
    normPlatform.includes("twitter") ||
    normPlatform === "xtwitter" ||
    normUrl.includes("x.com") ||
    normUrl.includes("twitter.com")
  ) {
    return {
      type: "svg",
      path: normPlatform.includes("twitter") && !normPlatform.includes("x") ? TWITTER_BIRD_PATH : siX.path,
    };
  }

  // 6. YouTube
  if (
    normPlatform.includes("youtube") ||
    normPlatform === "yt" ||
    normUrl.includes("youtube.com") ||
    normUrl.includes("youtu.be")
  ) {
    return { type: "svg", path: siYoutube.path };
  }

  // 7. TikTok
  if (
    normPlatform.includes("tiktok") ||
    normPlatform === "tt" ||
    normUrl.includes("tiktok.com")
  ) {
    return { type: "svg", path: siTiktok.path };
  }

  // 8. Discord
  if (
    normPlatform.includes("discord") ||
    normUrl.includes("discord.gg") ||
    normUrl.includes("discord.com")
  ) {
    return { type: "svg", path: siDiscord.path };
  }

  // 9. Messenger
  if (
    normPlatform.includes("messenger") ||
    normUrl.includes("m.me") ||
    normUrl.includes("messenger.com")
  ) {
    return { type: "svg", path: siMessenger.path };
  }

  // 10. Telegram
  if (
    normPlatform.includes("telegram") ||
    normPlatform === "tg" ||
    normUrl.includes("t.me") ||
    normUrl.includes("telegram.me")
  ) {
    return { type: "svg", path: siTelegram.path };
  }

  // 11. WhatsApp
  if (
    normPlatform.includes("whatsapp") ||
    normPlatform === "wa" ||
    normUrl.includes("wa.me") ||
    normUrl.includes("whatsapp.com")
  ) {
    return { type: "svg", path: siWhatsapp.path };
  }

  // 12. Personal website / Portfolio / Web
  if (
    normPlatform.includes("website") ||
    normPlatform.includes("portfolio") ||
    normPlatform.includes("web") ||
    normPlatform.includes("site") ||
    normPlatform.includes("blog")
  ) {
    return { type: "lucide", component: Globe };
  }

  // 13. Graceful fallback for custom links
  return { type: "lucide", component: LinkIcon };
}

/**
 * Reusable helper returning the resolved React icon component or node
 */
export function getSocialIcon(
  platform: string,
  options?: { url?: string; size?: number; className?: string },
) {
  const { url, size = 18, className = "" } = options || {};
  const resolved = resolveSocialIconDefinition(platform, url);

  if (resolved.type === "svg") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
        style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      >
        <path d={resolved.path} />
      </svg>
    );
  }

  const LucideIcon = resolved.component;
  return <LucideIcon size={size} className={className} aria-hidden="true" />;
}

/**
 * Reusable SocialIcon component
 */
export function SocialIcon({
  platform,
  url,
  size = 18,
  className = "",
}: SocialIconProps) {
  return getSocialIcon(platform, { url, size, className });
}
