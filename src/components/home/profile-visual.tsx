import Image from "next/image";
import type { PortfolioImage } from "@/types/portfolio";

export interface ProfileVisualProps {
  image?: PortfolioImage;
  name: string;
  mode?: "cutout" | "full" | string;
  scale?: number;
  positionX?: number;
  positionY?: number;
  className?: string;
  hideBadges?: boolean;
}

export function ProfileVisual({
  image,
  name,
  mode = "cutout",
  scale = 1.0,
  positionX = 50.0,
  positionY = 55.0,
  className = "",
  hideBadges = false,
}: ProfileVisualProps) {
  const displayMode = mode === "full" ? "full" : "cutout";
  const hasImage = Boolean(image?.src);
  const safeScale = typeof scale === "number" && !isNaN(scale) ? scale : 1.0;
  const safeX = typeof positionX === "number" && !isNaN(positionX) ? positionX : 50.0;
  const safeY = typeof positionY === "number" && !isNaN(positionY) ? positionY : (displayMode === "full" ? 50.0 : 55.0);

  return (
    <div
      className={`profile-visual hero-portrait-frame ${
        hasImage ? `has-portrait mode-${displayMode}` : "portrait-placeholder"
      } ${className}`}
    >
      {/* Layer 1: Designed cream/beige abstract artwork (always preserved as default foundation) */}
      <div className="portrait-scene" aria-hidden="true">
        <div className="portrait-wall" />
        <div className="window-light" />
        <div className="botanical-shadow">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="portrait-ledge" />
        <div className="portrait-vase" />
      </div>

      {/* Layer 2: Admin portrait */}
      {hasImage && displayMode === "cutout" && (
        <div className="hero-portrait-layer mode-cutout" aria-hidden="true">
          <div
            className="hero-cutout-anchor"
            style={{
              left: `${safeX}%`,
              top: `${safeY}%`,
              transform: `translate(-50%, -50%) scale(${safeScale})`,
            }}
          >
            <Image
              src={image!.src}
              alt={image!.alt || name}
              width={960}
              height={1280}
              sizes="(max-width: 767px) 82vw, 47vw"
              className="hero-cutout-img"
              fetchPriority="high"
              draggable={false}
            />
          </div>
        </div>
      )}

      {hasImage && displayMode === "full" && (
        <div className="hero-portrait-layer mode-full" aria-hidden="true">
          <div className="hero-full-viewport">
            <Image
              src={image!.src}
              alt={image!.alt || name}
              width={1200}
              height={1400}
              sizes="(max-width: 767px) 82vw, 47vw"
              className="hero-full-img"
              style={{
                left: `${safeX}%`,
                top: `${safeY}%`,
                transform: `translate(-50%, -50%) scale(${safeScale})`,
              }}
              fetchPriority="high"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Layer 3: Editorial vertical label and decorative seal / badge */}
      {!hideBadges && (
        <>
          <div className="portrait-label" aria-hidden="true">
            <span />
            Portrait space
          </div>
          <div className="portrait-seal" aria-hidden="true">
            <span>
              Personal
              <br />
              portfolio
            </span>
            <i />
          </div>
        </>
      )}
    </div>
  );
}
