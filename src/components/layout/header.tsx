"use client";

import { useEffect, useState } from "react";
import type { NavigationItem } from "@/types/portfolio";
import { MobileNavigation } from "./mobile-navigation";

export function Header({
  name,
  items,
  hasContact,
  brandName,
  isHomePage = true,
}: {
  name: string;
  items: NavigationItem[];
  hasContact: boolean;
  brandName?: string;
  isHomePage?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeaderState = () => {
      setIsScrolled(window.scrollY > 10);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, []);

  const headerClassName = [
    "site-header",
    isHomePage ? "is-home-page" : "",
    isScrolled ? "is-scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
      <div className="page-width header-inner">
        <a href={isHomePage ? "#home" : "/#home"} className="brand" aria-label={`${name} — home`}>
          {brandName || initials}
          <span aria-hidden="true">.</span>
        </a>
        <nav aria-label="Main navigation" className="desktop-nav">
          {items.map((item) => {
            const href = isHomePage ? `#${item.section}` : `/#${item.section}`;
            return (
              <a
                key={item.section}
                href={href}
                className={isHomePage && item.section === "home" ? "home-link" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        {hasContact ? (
          <a href={isHomePage ? "#contact" : "/#contact"} className="header-cta">
            Let’s talk <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="header-note">Personal portfolio</span>
        )}
        {items.length > 1 && <MobileNavigation items={items} isHomePage={isHomePage} />}
      </div>
    </header>
  );
}
