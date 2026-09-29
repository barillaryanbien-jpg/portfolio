"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { SkillCard } from "@/components/ui/skill-card";
import type { Skill } from "@/types/portfolio";

export function SkillsExplorer({
  skills,
  availableCategories,
}: {
  skills: Skill[];
  availableCategories: string[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSkills = useMemo(() => {
    let result = skills;

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((skill) => {
        const cat = skill.category?.trim();
        return cat?.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (skill) =>
          skill.name.toLowerCase().includes(q) ||
          skill.category?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [skills, selectedCategory, searchQuery]);

  return (
    <div className="skills-explorer">
      {/* 1. Category Filter Buttons: Direct on normal page background, horizontally scrollable */}
      <div
        className="skills-filter-scroll"
        role="tablist"
        aria-label="Filter technologies by category"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "All"}
          className={`skills-filter-pill${selectedCategory === "All" ? " is-active" : ""}`}
          onClick={() => setSelectedCategory("All")}
        >
          All
          <span className="skills-pill-count">{skills.length}</span>
        </button>

        {availableCategories.map((cat) => {
          const count = skills.filter(
            (s) => s.category?.trim().toLowerCase() === cat.toLowerCase()
          ).length;
          const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();

          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`skills-filter-pill${isActive ? " is-active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              <span className="skills-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Search Field: Directly below category filters, outside any large container */}
      <div className="skills-search-bar-row">
        <div className="skills-search-wrapper">
          <Search size={15} className="skills-search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="skills-search-input"
            aria-label="Search skills by name"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="skills-search-clear"
              aria-label="Clear skill search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Showing X of Y technologies */}
      <div className="skills-results-meta">
        <span className="skills-results-count">
          Showing <strong>{filteredSkills.length}</strong> of {skills.length} {skills.length === 1 ? "technology" : "technologies"}
        </span>
        {(selectedCategory !== "All" || searchQuery) && (
          <button
            type="button"
            className="skills-reset-btn"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      {/* 4. Skills Grid: Directly underneath */}
      {filteredSkills.length > 0 ? (
        <ul className="skills-page-grid">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} showCategory={true} />
          ))}
        </ul>
      ) : (
        <div className="skills-page-empty">
          <p>
            No technologies found matching &quot;{searchQuery}&quot;
            {selectedCategory !== "All" && ` in ${selectedCategory}`}.
          </p>
          <button
            type="button"
            className="skills-reset-btn"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
          >
            Clear search &amp; filters
          </button>
        </div>
      )}
    </div>
  );
}
