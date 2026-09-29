import { ActionLink } from "@/components/ui/action-link";
import { ProfileVisual } from "./profile-visual";
import { Statistics } from "./statistics";
import type { PortfolioData } from "@/types/portfolio";

export function Hero({
  profile,
  hero,
  statistics,
  showStatistics = true,
}: Pick<PortfolioData, "profile" | "hero" | "statistics"> & {
  showStatistics?: boolean;
}) {
  const words = profile.name.split(/\s+/);
  const lastName = words.pop();
  return (
    <section id="home" aria-labelledby="hero-heading" className="hero-section">
      <div className="page-width hero">
        <div className="hero-copy">
          {hero.eyebrow && <p className="eyebrow">{hero.eyebrow}</p>}
          <h1 id="hero-heading" aria-label={profile.name}>
            <span>{words.join(" ")}</span> <span>{lastName}</span>
          </h1>
          {(profile.title || hero.caption) && (
            <p className="hero-title">{profile.title || hero.caption}</p>
          )}
          {hero.introduction && (
            <p className="hero-intro">{hero.introduction}</p>
          )}
          <div className="hero-actions">
            {hero.actions.map((link, index) => (
              <ActionLink key={link.url} link={link} primary={index === 0} />
            ))}
            {profile.resume && <ActionLink link={profile.resume} />}
          </div>
          {showStatistics && <Statistics items={statistics} preserveLayout />}
        </div>
        <ProfileVisual
          image={profile.image}
          name={profile.name}
          mode={profile.heroImageMode}
          scale={profile.heroImageScale}
          positionX={profile.heroImagePositionX}
          positionY={profile.heroImagePositionY}
        />
      </div>
    </section>
  );
}
