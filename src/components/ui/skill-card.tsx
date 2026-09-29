import Image from "next/image";
import { SkillIcon } from "@/components/ui/skill-icon";
import type { Skill } from "@/types/portfolio";

export function SkillCard({
  skill,
  showCategory = true,
}: {
  skill: Skill;
  showCategory?: boolean;
}) {
  return (
    <li className="skill-card-item">
      {skill.icon?.src ? (
        <div className="skill-icon-wrapper">
          <Image
            src={skill.icon.src}
            alt={skill.icon.alt || `${skill.name} icon`}
            width={48}
            height={48}
            unoptimized
            className="skill-custom-icon"
          />
        </div>
      ) : (skill.iconName || skill.name) ? (
        <div className="skill-icon-wrapper">
          <SkillIcon name={skill.iconName || skill.name} />
        </div>
      ) : null}
      <span className="skill-name">{skill.name}</span>
      {showCategory && skill.category && (
        <small className="skill-category">{skill.category}</small>
      )}
    </li>
  );
}
