"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types/portfolio";
import { ProjectCard } from "./project-card";

export function ProjectsExplorer({
  projects,
}: {
  projects: Project[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Derive unique categories from real projects only
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.category?.trim()) {
        set.add(p.category.trim());
      }
    }
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ["All", ...list];
  }, [projects]);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return projects;
    return projects.filter(
      (p) => p.category?.trim().toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [projects, selectedCategory]);

  return (
    <div className="projects-explorer">
      {/* Category Filter Pills (if multiple categories exist) */}
      {categories.length > 2 && (
        <div className="projects-filter-bar" role="toolbar" aria-label="Filter projects by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`projects-filter-btn ${selectedCategory === cat ? "is-active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
              {cat !== "All" && (
                <span className="filter-count">
                  {projects.filter((p) => p.category?.trim().toLowerCase() === cat.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="project-grid projects-page-grid">
          {filteredProjects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} priority={idx < 3} />
          ))}
        </div>
      ) : (
        <div className="projects-empty-state">
          <p className="empty-title">No projects found in this category.</p>
          <button
            type="button"
            className="projects-filter-btn is-active"
            onClick={() => setSelectedCategory("All")}
          >
            Show all projects
          </button>
        </div>
      )}
    </div>
  );
}
