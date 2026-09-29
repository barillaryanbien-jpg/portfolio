"use client";

import { useRef } from "react";
import { Menu, X } from "lucide-react";
import type { NavigationItem } from "@/types/portfolio";

export function MobileNavigation({
  items,
  isHomePage = true,
}: {
  items: NavigationItem[];
  isHomePage?: boolean;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  function close() {
    if (menu.current) menu.current.open = false;
  }
  return (
    <details
      ref={menu}
      className="mobile-menu"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
          menu.current?.querySelector("summary")?.focus();
        }
      }}
    >
      <summary aria-label="Toggle navigation">
        <Menu className="menu-open-icon" size={22} aria-hidden="true" />
        <X className="menu-close-icon" size={22} aria-hidden="true" />
      </summary>
      <nav aria-label="Mobile navigation">
        {items.map((item) => {
          const href = isHomePage ? `#${item.section}` : `/#${item.section}`;
          return (
            <a key={item.section} href={href} onClick={close}>
              {item.label}
            </a>
          );
        })}
      </nav>
    </details>
  );
}
