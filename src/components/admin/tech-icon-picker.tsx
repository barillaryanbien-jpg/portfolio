"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { searchTechIcons, getTechIcon } from "@/data/tech-icons";
import { SkillIcon } from "@/components/ui/skill-icon";

export function TechIconPicker({
  id,
  name,
  value,
  onChange,
  onCategorySuggest,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onCategorySuggest?: (category: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedIcon = useMemo(() => (value ? getTechIcon(value) : undefined), [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, [isOpen]);

  // Perform fast dynamic search over 3,400+ icons (limited to 40 results for fast rendering)
  const filteredIcons = useMemo(() => {
    return searchTechIcons(search, 40);
  }, [search]);

  function selectIcon(key: string, category?: string) {
    onChange(key);
    if (category && onCategorySuggest) {
      onCategorySuggest(category);
    }
    setIsOpen(false);
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <div className="admin-icon-picker-container" ref={containerRef}>
      <input type="hidden" name={name} value={value} />

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        className="admin-icon-picker-trigger"
        onClick={() => {
          if (!isOpen) setSearch("");
          setIsOpen(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="admin-icon-picker-trigger-content">
          {value ? (
            <>
              <div className="admin-icon-picker-preview-box">
                <SkillIcon name={value} size={22} />
              </div>
              <span className="admin-icon-picker-selected-label">
                {selectedIcon ? selectedIcon.name : value}
              </span>
            </>
          ) : (
            <span className="admin-icon-picker-placeholder">
              Search &amp; choose a technology icon...
            </span>
          )}
        </div>

        <div className="admin-icon-picker-trigger-actions">
          {value && (
            <span
              role="button"
              tabIndex={0}
              className="admin-icon-picker-clear-btn"
              onClick={clearSelection}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange("");
                }
              }}
              title="Remove icon"
              aria-label="Remove icon"
            >
              <X size={15} aria-hidden="true" />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`admin-icon-picker-chevron${isOpen ? " is-open" : ""}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="admin-icon-picker-dropdown" role="listbox">
          <div className="admin-icon-picker-search-bar">
            <Search size={15} className="admin-icon-picker-search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search technologies (e.g. Python, React, Next, OpenAI, PyTorch)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-icon-picker-search-input"
              aria-label="Search icons"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="admin-icon-picker-search-clear"
                aria-label="Clear search"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="admin-icon-picker-list">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={`admin-icon-picker-item${!value ? " is-selected" : ""}`}
              onClick={() => selectIcon("")}
            >
              <div className="admin-icon-picker-item-icon-box">
                <span className="admin-icon-picker-no-icon">✕</span>
              </div>
              <div className="admin-icon-picker-item-meta">
                <span className="admin-icon-picker-item-name">No icon</span>
                <span className="admin-icon-picker-item-sub">Remove selected icon</span>
              </div>
              {!value && <Check size={16} className="admin-icon-picker-check" aria-hidden="true" />}
            </button>

            {filteredIcons.map((item) => {
              const isSelected = value === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`admin-icon-picker-item${isSelected ? " is-selected" : ""}`}
                  onClick={() => selectIcon(item.key, item.category)}
                >
                  <div className="admin-icon-picker-item-icon-box">
                    <SkillIcon name={item.key} size={22} />
                  </div>
                  <div className="admin-icon-picker-item-meta">
                    <span className="admin-icon-picker-item-name">{item.name}</span>
                    {item.category && (
                      <span className="admin-icon-picker-item-sub">{item.category}</span>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={16} className="admin-icon-picker-check" aria-hidden="true" />
                  )}
                </button>
              );
            })}

            {filteredIcons.length === 0 && (
              <div className="admin-icon-picker-empty">
                No technology icon matched &quot;{search}&quot;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
