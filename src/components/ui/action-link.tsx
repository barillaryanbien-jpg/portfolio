import { ArrowUpRight } from "lucide-react";
import { safeUrl } from "@/lib/portfolio";
import type { PortfolioLink } from "@/types/portfolio";

export function ActionLink({
  link,
  primary = false,
}: {
  link: PortfolioLink;
  primary?: boolean;
}) {
  const href = safeUrl(link.url);
  if (!href || !link.label.trim()) return null;
  return (
    <a
      className={primary ? "action-link action-primary" : "action-link"}
      href={href}
    >
      {link.label}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
