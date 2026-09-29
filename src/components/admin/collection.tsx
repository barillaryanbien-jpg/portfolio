"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Award,
  Eye,
  EyeOff,
  FolderOpen,
  GraduationCap,
  Pencil,
  Plus,
} from "lucide-react";
import { useAdminNotice } from "./notice";
import type { AdminItem } from "@/lib/admin/data";
import type { CollectionResource } from "@/lib/admin/schema";
import { editors } from "@/lib/admin/fields";
import { deleteRecord, toggleRecordVisibility } from "@/lib/admin/actions";
import { ConfirmButton } from "./confirm-button";
import { SkillIcon } from "@/components/ui/skill-icon";

export function Collection({
  resource,
  items,
}: {
  resource: CollectionResource;
  items: AdminItem[];
}) {
  const notify = useAdminNotice();
  const router = useRouter();
  const definition = editors[resource];
  const baseHref =
    resource === "education" || resource === "experience"
      ? `/admin/about/${resource}`
      : `/admin/${resource}`;
  return (
    <>
      <div className="admin-panel">
        <div className="admin-panel-heading admin-collection-heading">
          <div>
            <h2>All {definition.title.toLowerCase()}</h2>
            <p>
              {items.length} {items.length === 1 ? "record" : "records"}.
              Display order is editable on each record.
            </p>
          </div>
          <Link
            className="admin-button admin-button-primary"
            href={`${baseHref}/new`}
          >
            <Plus size={17} aria-hidden="true" />
            Add {definition.singular.toLowerCase()}
          </Link>
        </div>
        {items.length ? (
          <ul className="admin-record-list">
            {items.map((item) => (
              <li key={item.id}>
                {resource === "projects" && (
                  <div className="admin-record-thumbnail">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <FolderOpen size={23} aria-hidden="true" />
                    )}
                  </div>
                )}
                {resource === "skills" && (
                  <div className="admin-record-skill-icon">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={28}
                        height={28}
                        unoptimized
                        className="admin-record-custom-img"
                      />
                    ) : item.iconKey ? (
                      <SkillIcon name={item.iconKey} size={28} />
                    ) : (
                      <span className="admin-record-no-icon">―</span>
                    )}
                  </div>
                )}
                {resource === "education" && (
                  <div className="admin-record-education-icon">
                    <GraduationCap size={22} aria-hidden="true" />
                  </div>
                )}
                {resource === "certificates" && (
                  <div className="admin-record-thumbnail">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <Award size={22} aria-hidden="true" />
                    )}
                  </div>
                )}
                <div className="admin-record-info">
                  <h3>{item.title}</h3>
                  {item.subtitle && <p>{item.subtitle}</p>}
                  <div className="admin-record-badges">
                    <span
                      className={`admin-badge${item.visible ? " is-visible" : ""}`}
                    >
                      {resource === "projects"
                        ? item.visible
                          ? "Published"
                          : "Draft"
                        : item.visible
                          ? "Visible"
                          : "Hidden"}
                    </span>
                    {item.featured && (
                      <span className="admin-badge">Featured</span>
                    )}
                    <span className="admin-order">Order {item.order}</span>
                  </div>
                </div>
                <div className="admin-record-actions">
                  <Link
                    href={`${baseHref}/${item.id}/edit`}
                    className="admin-button"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="admin-button"
                    onClick={async () => {
                      const result = await toggleRecordVisibility(
                        resource,
                        item.id,
                        !item.visible,
                      );
                      if (result.status === "success") {
                        notify(result.message || "Visibility updated.");
                        router.refresh();
                      } else {
                        notify(result.message || "Visibility could not be updated.");
                      }
                    }}
                  >
                    {item.visible ? (
                      <EyeOff size={15} aria-hidden="true" />
                    ) : (
                      <Eye size={15} aria-hidden="true" />
                    )}
                    {item.visible ? "Hide" : "Show"}
                  </button>
                  <ConfirmButton
                    label="Delete"
                    title={`Delete ${item.title}?`}
                    description="This action cannot be undone. The record will be removed from your portfolio."
                    onConfirm={async () => {
                      const result = await deleteRecord(resource, item.id);
                      if (result.status === "success") {
                        notify(result.message || "Record deleted successfully.");
                        router.refresh();
                      }
                      return result;
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="admin-empty">
            <span>
              <FolderOpen size={29} aria-hidden="true" />
            </span>
            <h3>No {definition.title.toLowerCase()} yet</h3>
            <p>
              Add your first {definition.singular.toLowerCase()} when you’re
              ready. Nothing is created automatically.
            </p>
            <Link href={`${baseHref}/new`} className="admin-text-link">
              Add {definition.singular.toLowerCase()}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
