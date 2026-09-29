"use client";

import { useActionState, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { saveRecord } from "@/lib/admin/actions";
import { editors, type EditorField } from "@/lib/admin/fields";
import {
  initialResult,
  slugify,
  type FormValues,
  type Resource,
} from "@/lib/admin/schema";
import { useAdminNotice } from "./notice";
import { FileUpload } from "./file-upload";
import { TechIconPicker } from "./tech-icon-picker";
import { HeroImageEditor } from "./hero-image-editor";
import { ProjectImageEditor } from "./project-image-editor";
import { suggestTechIconFromName } from "@/data/tech-icons";

export function RecordForm({
  resource,
  id,
  initialValues,
  previews: initialPreviews,
}: {
  resource: Resource;
  id?: string;
  initialValues: FormValues;
  previews: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [previews, setPreviews] = useState<Record<string, string>>(initialPreviews);
  const [heroEditorOpen, setHeroEditorOpen] = useState(false);
  const [projectEditorOpen, setProjectEditorOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [slugEdited, setSlugEdited] = useState(!!id);
  const notify = useAdminNotice();

  const profileImagePath =
    typeof values.profile_image_path === "string" ? values.profile_image_path : "";
  const profileImageUrl = profileImagePath
    ? previews[profileImagePath] || profileImagePath
    : "";

  const handleHeroSettingsSaved = (settings: {
    mode: "cutout" | "full";
    scale: number;
    positionX: number;
    positionY: number;
  }) => {
    setValues((current) => ({
      ...current,
      hero_image_mode: settings.mode,
      hero_image_scale: settings.scale,
      hero_image_position_x: settings.positionX,
      hero_image_position_y: settings.positionY,
    }));
  };

  const projectImagePath =
    typeof values.cover_image_path === "string" ? values.cover_image_path : "";
  const projectImageUrl = projectImagePath
    ? previews[projectImagePath] || projectImagePath
    : "";

  const handleProjectSettingsSaved = (settings: {
    displayType: "desktop" | "tablet" | "mobile" | "auto";
    fit: "cover" | "contain";
    scale: number;
    positionX: number;
    positionY: number;
  }) => {
    setValues((current) => ({
      ...current,
      cover_display_type: settings.displayType,
      cover_fit: settings.fit,
      cover_zoom: settings.scale,
      cover_position_x: settings.positionX,
      cover_position_y: settings.positionY,
    }));
  };

  const [state, action, pending] = useActionState(
    async (previous: typeof initialResult, form: FormData) => {
      const result = await saveRecord(resource, id || null, previous, form);
      if (result.status === "success") {
        notify(result.message || "Changes saved successfully.");
        if (!id && resource === "skills") {
          // Continuous entry mode for skills: reset form fields, auto-increment order, stay on /admin/skills/new
          setValues((current) => {
            const currentOrder = typeof current.sort_order === "number" ? current.sort_order : Number(current.sort_order || 0);
            return {
              name: "",
              icon: "",
              icon_path: "",
              category: "",
              sort_order: currentOrder + 1,
              is_visible: true,
            };
          });
          setPreviews({});
          setFormKey((k) => k + 1);
          router.refresh();
        } else if (resource === "education" || resource === "experience") {
          router.replace("/admin/about");
          router.refresh();
        } else if (!id && result.id) {
          router.replace(`/admin/${resource}`);
        } else {
          router.refresh();
        }
      }
      return result;
    },
    initialResult,
  );
  const definition = editors[resource];
  const formId = useId();
  function change(name: string, value: string | boolean | string[]) {
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(resource === "projects" &&
      name === "title" &&
      !slugEdited &&
      typeof value === "string"
        ? { slug: slugify(value) }
        : {}),
    }));
    if (name === "slug") setSlugEdited(true);

    // Auto-suggest Technology Icon & Category when typing Skill Name
    if (resource === "skills" && name === "name" && typeof value === "string") {
      const trimmed = value.trim();
      const suggested = suggestTechIconFromName(trimmed);
      if (suggested) {
        setValues((current) => ({
          ...current,
          // Only auto-fill icon if user hasn't explicitly set a custom one or it's empty
          icon: current.icon ? current.icon : suggested.key,
          // Only auto-fill category if currently empty
          category: current.category ? current.category : (suggested.category || ""),
        }));
      }
    }
  }

  return (
    <>
      <form key={formKey} action={action} className="admin-editor">
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <h2>{definition.singular} details</h2>
            <p>Fields marked * are required. Other fields can remain empty.</p>
          </div>
          <fieldset disabled={pending} className="admin-form-grid">
            {definition.fields.map((field) => {
              if (field.type === "hidden") {
                const hiddenVal = values[field.name];
                return (
                  <input
                    key={field.name}
                    type="hidden"
                    name={field.name}
                    value={hiddenVal !== undefined && hiddenVal !== null ? String(hiddenVal) : ""}
                  />
                );
              }

              const inputId = `${formId}-${field.name}`;
              const value =
                values[field.name] ??
                (field.type === "toggle"
                  ? field.name.startsWith("show_") || field.name === "is_visible" || (resource === "projects" && field.name === "is_published" && !id)
                  : field.type === "number"
                    ? 0
                    : "");
              const error = state.errors?.[field.name];
              return (
                <div
                  key={field.name}
                  className={`admin-field${["textarea", "image", "pdf", "tags"].includes(field.type || "") ? " admin-field-wide" : ""}`}
                >
                  {field.type !== "toggle" && (
                    <label htmlFor={inputId}>
                      {field.label}
                      {field.required && <span aria-hidden="true"> *</span>}
                    </label>
                  )}
                  <EditorInput
                    field={field}
                    id={inputId}
                    resource={resource}
                    recordId={id}
                    values={values}
                    value={value}
                    error={error}
                    preview={
                      typeof value === "string" ? previews[value] : undefined
                    }
                    onChange={(value) => change(field.name, value)}
                    onBlocked={() => undefined}
                    onOpenHeroEditor={
                      resource === "profile" && field.name === "profile_image_path"
                        ? () => setHeroEditorOpen(true)
                        : undefined
                    }
                    onOpenProjectEditor={
                      resource === "projects" && field.name === "cover_image_path"
                        ? () => setProjectEditorOpen(true)
                        : undefined
                    }
                    onUploadSuccess={
                      resource === "profile" && field.name === "profile_image_path"
                        ? (path, previewUrl) => {
                            if (previewUrl) {
                              setPreviews((prev) => ({ ...prev, [path]: previewUrl }));
                            }
                            setHeroEditorOpen(true);
                          }
                        : resource === "projects" && field.name === "cover_image_path"
                          ? (path, previewUrl) => {
                              if (previewUrl) {
                                setPreviews((prev) => ({ ...prev, [path]: previewUrl }));
                              }
                              setProjectEditorOpen(true);
                            }
                        : resource === "certificates" &&
                            field.name === "certificate_image_path"
                          ? (path, previewUrl, publicId) => {
                              if (previewUrl) {
                                setPreviews((current) => ({
                                  ...current,
                                  [path]: previewUrl,
                                }));
                              }
                              if (publicId)
                                change("certificate_image_public_id", publicId);
                            }
                        : undefined
                    }
                    onRemove={
                      resource === "certificates" &&
                      field.name === "certificate_image_path"
                        ? () => change("certificate_image_public_id", "")
                        : undefined
                    }
                    onCategorySuggest={(cat) => {
                      // Only auto-fill category if it's currently empty
                      if (!values.category) {
                        change("category", cat);
                      }
                    }}
                  />
                  {field.help &&
                    field.type !== "image" &&
                    field.type !== "pdf" && (
                      <p className="admin-help" id={`${inputId}-help`}>
                        {field.help}
                      </p>
                    )}
                  {error && (
                    <p className="admin-field-error" id={`${inputId}-error`}>
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </fieldset>
        </div>
        <div className="admin-save-bar">
          <div aria-live="polite">
            {state.message && (
              <p
                className={`admin-notice ${state.status}`}
                role={state.status === "error" ? "alert" : "status"}
              >
                {state.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="admin-button admin-button-primary"
            disabled={pending}
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      {resource === "profile" && profileImageUrl && heroEditorOpen && (
        <HeroImageEditor
          isOpen={heroEditorOpen}
          onClose={() => setHeroEditorOpen(false)}
          imageUrl={profileImageUrl}
          imagePath={profileImagePath}
          initialMode={(values.hero_image_mode as "cutout" | "full") || "cutout"}
          initialScale={
            typeof values.hero_image_scale === "number"
              ? values.hero_image_scale
              : Number(values.hero_image_scale || 1.0)
          }
          initialPositionX={
            typeof values.hero_image_position_x === "number"
              ? values.hero_image_position_x
              : Number(values.hero_image_position_x || 50.0)
          }
          initialPositionY={
            typeof values.hero_image_position_y === "number"
              ? values.hero_image_position_y
              : Number(values.hero_image_position_y || 55.0)
          }
          ownerName={String(values.owner_name || "Ryan Bien Barilla")}
          professionalTitle={String(values.professional_title || "")}
          onSaved={handleHeroSettingsSaved}
        />
      )}
      {resource === "projects" && projectImageUrl && projectEditorOpen && (
        <ProjectImageEditor
          isOpen={projectEditorOpen}
          onClose={() => setProjectEditorOpen(false)}
          imageUrl={projectImageUrl}
          initialDisplayType={
            (values.cover_display_type as "desktop" | "tablet" | "mobile" | "auto") || "desktop"
          }
          initialFit={
            (values.cover_fit as "cover" | "contain") || "contain"
          }
          initialScale={
            typeof values.cover_zoom === "number"
              ? values.cover_zoom
              : Number(values.cover_zoom || 1.0)
          }
          initialPositionX={
            typeof values.cover_position_x === "number"
              ? values.cover_position_x
              : Number(values.cover_position_x || 50.0)
          }
          initialPositionY={
            typeof values.cover_position_y === "number"
              ? values.cover_position_y
              : Number(values.cover_position_y || 50.0)
          }
          projectTitle={String(values.title || "Project Preview")}
          onSaved={handleProjectSettingsSaved}
        />
      )}
    </>
  );
}

function EditorInput({
  field,
  id,
  resource,
  recordId,
  values,
  value,
  error,
  preview,
  onChange,
  onBlocked,
  onOpenHeroEditor,
  onOpenProjectEditor,
  onUploadSuccess,
  onRemove,
  onCategorySuggest,
}: {
  field: EditorField;
  id: string;
  resource: Resource;
  recordId?: string;
  values: FormValues;
  value: FormValues[string];
  error?: string;
  preview?: string;
  onChange: (value: string | boolean | string[]) => void;
  onBlocked: (blocked: boolean) => void;
  onOpenHeroEditor?: () => void;
  onOpenProjectEditor?: () => void;
  onUploadSuccess?: (
    path: string,
    previewUrl?: string,
    publicId?: string,
  ) => void;
  onRemove?: () => void;
  onCategorySuggest?: (category: string) => void;
}) {
  const description =
    [field.help ? `${id}-help` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  const common = {
    id,
    name: field.name,
    required: field.required,
    "aria-invalid": !!error,
    "aria-describedby": description,
  };
  const disabledByCurrent =
    field.name === "end_date" &&
    (resource === "education" || resource === "experience") &&
    values.is_current === true;

  if (field.type === "hidden") {
    return <input type="hidden" id={id} name={field.name} value={String(value ?? "")} />;
  }

  if (field.type === "image" || field.type === "pdf")
    return (
      <FileUpload
        id={id}
        field={field}
        recordId={recordId}
        value={String(value || "")}
        preview={preview}
        onChange={onChange}
        onBlocked={onBlocked}
        onOpenHeroEditor={onOpenHeroEditor}
        onOpenProjectEditor={onOpenProjectEditor}
        onUploadSuccess={onUploadSuccess}
        onRemove={onRemove}
      />
    );
  if (field.type === "toggle")
    return (
      <label className="admin-toggle">
        <input type="hidden" name={field.name} value={value ? "on" : "off"} />
        <input
          id={id}
          required={field.required}
          aria-invalid={!!error}
          aria-describedby={description}
          type="checkbox"
          checked={!!value}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  if (field.type === "textarea")
    return (
      <textarea
        {...common}
        rows={field.name === "bio" || field.name === "full_description" ? 7 : 3}
        value={String(value || "")}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  if (field.type === "select")
    return (
      <select
        {...common}
        value={String(value || "")}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">No icon</option>
        {field.options?.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    );
  if (field.type === "icon-picker")
    return (
      <TechIconPicker
        id={id}
        name={field.name}
        value={String(value || "")}
        onChange={onChange}
        onCategorySuggest={(suggestedCategory) => {
          onCategorySuggest?.(suggestedCategory);
        }}
      />
    );
  if (field.type === "tags")
    return (
      <TagInput
        id={id}
        name={field.name}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
      />
    );
  return (
    <input
      {...common}
      type={field.type || "text"}
      disabled={disabledByCurrent}
      placeholder={disabledByCurrent ? "Present" : undefined}
      min={field.type === "number" ? 0 : undefined}
      max={field.type === "number" ? 10000 : undefined}
      step={field.type === "number" ? 1 : undefined}
      value={disabledByCurrent ? "" : String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function TagInput({
  id,
  name,
  value,
  onChange,
}: {
  id: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  function add() {
    const tag = draft.trim();
    if (!tag) return;
    if (tag.length > 50 || value.length >= 30) {
      setError("Use up to 30 tags, each 50 characters or fewer.");
      return;
    }
    if (value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setError("That technology is already included.");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
    setError("");
  }
  return (
    <div className="admin-tags">
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div className="admin-tag-list">
        {value.map((tag) => (
          <span key={tag}>
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <div className="admin-tag-input">
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="admin-button" onClick={add}>
          Add tag
        </button>
      </div>
      {error && (
        <p className="admin-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
