import { ActionLink } from "@/components/ui/action-link";
import type { PortfolioLink } from "@/types/portfolio";

export function Footer({
  name,
  socialLinks,
  footerText = "All rights reserved.",
  isHomePage = true,
}: {
  name: string;
  socialLinks: PortfolioLink[];
  footerText?: string;
  isHomePage?: boolean;
}) {
  return (
    <footer className="page-width site-footer">
      <a href={isHomePage ? "#home" : "/#home"} className="footer-name">
        {name}
      </a>
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-x-6">
          {socialLinks.map((link) => (
            <ActionLink key={link.url} link={link} />
          ))}
        </div>
      )}
      <span className="copyright">
        © {new Date().getFullYear()} <span>{footerText}</span>
      </span>
      <a href={isHomePage ? "#home" : "/#home"} className="back-top" aria-label="Back to top">
        ↑
      </a>
    </footer>
  );
}
