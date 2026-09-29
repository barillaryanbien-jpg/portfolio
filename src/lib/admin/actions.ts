"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient, createPublicClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { requireAdmin } from "./auth";
import {
  schemas,
  resourceSchema,
  isCollection,
  contactMessageSubmissionSchema,
  type ActionResult,
} from "./schema";
import { editors } from "./fields";
import { collectionTables } from "./data";
import { assetFields, isExternalAssetUrl, removeUnusedAsset } from "./storage";
import { writeHeroSettingsFallback } from "./hero-settings-storage";
import { saveProjectPresentation } from "./project-settings-storage";
import type { ProjectDisplayType, ProjectFit } from "@/types/portfolio";
import {
  saveCertificateFallback,
  deleteCertificateFallback,
  readCertificatesFallback,
  writeCertificatesFallback,
} from "./certificates-storage";
import { uploadCertificateImage } from "./uploads";

type MutationError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
} | null;
type MutationResult = Promise<{
  data: { id?: string } | Record<string, unknown> | null;
  error: MutationError;
}>;
type MutationChain = {
  eq(column: string, value: string | boolean): MutationChain;
  select(columns?: string): MutationChain;
  single(): MutationResult;
  update(payload: Record<string, unknown>): MutationChain;
  insert(payload: Record<string, unknown>): MutationChain;
  delete(): MutationChain;
};

function revalidateResource(resource: string, id?: string | null) {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  revalidatePath("/admin/about");
  revalidatePath("/certificates");
  revalidatePath(`/admin/${resource}`);
  if (id) revalidatePath(`/admin/${resource}/${id}/edit`);
}
function failure(
  message = "Your changes could not be saved. Please try again.",
): ActionResult {
  return { status: "error", message };
}

function logMutationError(
  context: string,
  error: MutationError,
  meta?: Record<string, string | null | undefined>,
) {
  if (!error) return;
  console.error(context, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    ...meta,
  });
}

function isMissingRowError(error: MutationError) {
  return (
    error?.code === "PGRST116" ||
    error?.message?.toLowerCase().includes("0 rows") ||
    error?.message?.toLowerCase().includes("no rows") ||
    error?.message?.toLowerCase().includes("json object requested")
  );
}

function isMissingCertificateTableError(error: MutationError) {
  return (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    Boolean(
      error?.message &&
        error.message.toLowerCase().includes("relation") &&
        error.message.toLowerCase().includes("certificates") &&
        error.message.toLowerCase().includes("does not exist"),
    )
  );
}

function isMissingCertificatePublicIdColumn(error: MutationError) {
  return Boolean(
    error &&
      (error.code === "PGRST204" || error.code === "42703") &&
      `${error.message || ""} ${error.details || ""}`.includes(
        "certificate_image_public_id",
      ),
  );
}

function selectedFile(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}

export async function login(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  if (!supabaseConfig())
    return failure(
      "Connect Supabase before signing in. See the setup instructions below.",
    );
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(1000) })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success)
    return failure("Enter a valid email address and your password.");
  try {
    const client = await createSessionClient();
    const { error } = await client.auth.signInWithPassword(parsed.data);
    if (error)
      return failure(
        error.status === 429
          ? "Too many attempts. Please wait before trying again."
          : "Unable to sign in. Check your credentials and owner access.",
      );
    const { data: allowed, error: roleError } =
      await client.rpc("is_portfolio_admin");
    if (roleError || !allowed) {
      await client.auth.signOut({ scope: "local" });
      return failure(
        "Unable to sign in. Check your credentials and owner access.",
      );
    }
  } catch {
    return failure("The sign-in service is unavailable. Please try again.");
  }
  redirect("/admin");
}

export async function logout(
  _previous: ActionResult,
  _form: FormData,
): Promise<ActionResult> {
  void _previous;
  void _form;
  try {
    const client = await createSessionClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return failure("Could not sign out. Please try again.");
  } catch {
    return failure("Could not sign out. Please try again.");
  }
  redirect("/admin/login");
}

export async function saveRecord(
  resourceValue: string,
  idValue: string | null,
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { client, user } = await requireAdmin();
  const resourceCheck = resourceSchema.safeParse(resourceValue);
  if (
    !resourceCheck.success ||
    (idValue && !z.uuid().safeParse(idValue).success)
  )
    return failure("Invalid editor request.");
  const resource = resourceCheck.data;
  const raw: Record<string, unknown> = {};
  try {
    for (const field of editors[resource].fields) {
      const value = form.get(field.name);
      raw[field.name] =
        field.type === "toggle"
          ? (value === "on" || value === "true" || value === "1")
          : field.type === "tags"
            ? JSON.parse(typeof value === "string" ? value : "[]")
            : typeof value === "string"
              ? value
              : "";
    }

    if (resource === "certificates") {
      const uploaded = selectedFile(form.get("certificate_image_file"));
      const existingPath =
        typeof raw.certificate_image_path === "string"
          ? raw.certificate_image_path.trim()
          : "";

      if (uploaded) {
        const upload = await uploadCertificateImage(uploaded, idValue);
        if (upload.status !== "success" || !upload.path || !upload.publicId) {
          return failure(
            upload.message ||
              "The certificate image could not be uploaded. Please try again.",
          );
        }
        raw.certificate_image_path = upload.path;
        raw.certificate_image_public_id = upload.publicId;
      } else if (!existingPath) {
        return {
          status: "error",
          message: "Upload a certificate image before saving.",
          errors: {
            certificate_image_path: "Upload a certificate image before saving.",
          },
        };
      }
    }
  } catch {
    return failure("The form could not be read. Please refresh and try again.");
  }
  const parsed = schemas[resource].safeParse(raw);
  if (!parsed.success) {
    console.error(`[saveRecord] Validation failed for ${resource}:`, parsed.error.issues, raw);
    const issueMessages = parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(", ");
    return {
      status: "error",
      message: `Please check the fields (${issueMessages})`,
      errors: Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      ),
    };
  }
  const payload = parsed.data;
  const table = isCollection(resource)
    ? collectionTables[resource]
    : resource === "settings"
      ? "site_settings"
      : "profiles";
  try {
    // Storage file identifiers are constrained to this owner's uploads. Certificate
    // images may also be existing HTTPS URLs, such as Cloudinary delivery URLs.
    for (const field of assetFields) {
      const asset =
        field in payload ? (Reflect.get(payload, field) as unknown) : null;
      if (
        typeof asset === "string" &&
        !asset.startsWith(user.id + "/") &&
        !(field === "certificate_image_path" && isExternalAssetUrl(asset))
      )
        return failure("Choose a file uploaded by this account.");
    }
    let fallbackCertificate:
      | ReturnType<typeof readCertificatesFallback>[number]
      | undefined;
    const old =
      idValue || !isCollection(resource)
        ? await client
            .from(table)
            .select("*")
            .eq("id", idValue || true)
            .maybeSingle()
        : null;
    if (old?.error || (old && !old.data)) {
      if (resource === "certificates" && idValue) {
        fallbackCertificate = readCertificatesFallback().find(
          (certificate) => certificate.id === idValue,
        );
        logMutationError("[saveRecord] Certificate existence check failed", old?.error || null, {
          resource,
          id: idValue,
          fallbackMatch: fallbackCertificate ? "true" : "false",
        });
      }
      if (!fallbackCertificate) {
        return failure("This record no longer exists. Return to Certificates and choose an existing record.");
      }
    }
    let savedId = idValue;
    let error: { code?: string; message?: string } | null = null;
    let certificatePublicIdPendingMigration = false;
    if (resource === "projects" && "technologies" in payload) {
      const technologies = Array.isArray(payload.technologies)
        ? (payload.technologies as string[])
        : [];
      const {
        cover_display_type,
        cover_fit,
        cover_position_x,
        cover_position_y,
        cover_zoom,
        ...record
      } = payload as Record<string, unknown>;

      const result = await client.rpc("save_project", {
        record: { ...record, ...(idValue ? { id: idValue } : {}) },
        technologies,
      });
      error = result.error;
      savedId = result.data;

      if (!error && savedId) {
        const presentation = {
          cover_display_type: (cover_display_type as ProjectDisplayType | undefined) || "desktop",
          cover_fit: (cover_fit as ProjectFit | undefined) || "cover",
          cover_position_x: typeof cover_position_x === "number" ? cover_position_x : 50.0,
          cover_position_y: typeof cover_position_y === "number" ? cover_position_y : 50.0,
          cover_zoom: typeof cover_zoom === "number" ? cover_zoom : 1.0,
        };
        saveProjectPresentation(savedId, presentation);
        if (typeof record.slug === "string" && record.slug) {
          saveProjectPresentation(record.slug, presentation);
        }
      }
    } else if (resource === "contact") {
      const result = await client.rpc("save_contact", {
        record: payload,
      });
      error = result.error;
    } else if (isCollection(resource)) {
      const dbPayload = { ...payload };
      const writablePayload: Record<string, unknown> = { ...dbPayload };
      const tableName = collectionTables[resource];
      const tableClient = client.from(tableName) as unknown as MutationChain;
      let insertWithExistingCertificateId = false;
      let result = idValue
        ? await tableClient
            .update(writablePayload)
            .eq("id", idValue)
            .select("id")
            .single()
        : await tableClient
            .insert(writablePayload)
            .select("id")
            .single();

      if (
        resource === "certificates" &&
        isMissingCertificatePublicIdColumn(result.error)
      ) {
        certificatePublicIdPendingMigration = true;
        delete writablePayload.certificate_image_public_id;
        console.warn(
          "[saveRecord] certificate_image_public_id is pending migration 011; saving the Cloudinary URL without discarding the edit.",
          { id: idValue },
        );
        result = idValue
          ? await tableClient
              .update(writablePayload)
              .eq("id", idValue)
              .select("id")
              .single()
          : await tableClient
              .insert(writablePayload)
              .select("id")
              .single();
      }

      if (
        result.error &&
        resource === "certificates" &&
        idValue &&
        fallbackCertificate &&
        isMissingRowError(result.error)
      ) {
        console.warn("[saveRecord] Certificate ID existed only in fallback storage; inserting it into Supabase.", {
          id: idValue,
        });
        insertWithExistingCertificateId = true;
        result = await tableClient
          .insert({ id: idValue, ...writablePayload })
          .select("id")
          .single();
      }

      // If remote Supabase table has legacy check constraint (skills_icon_check),
      // retry with icon mapped to null or legacy code symbol so user's skill save is never blocked
      if (
        result.error &&
        result.error.code === "23514" &&
        resource === "skills" &&
        "icon" in dbPayload
      ) {
        console.warn("[saveRecord] skills_icon_check triggered; retrying insert with compliant legacy symbol fallback");
        const fallbackPayload = {
          ...dbPayload,
          icon: ["code", "terminal", "database", "globe", "layers", "palette", "cloud", "cpu"].includes(String(dbPayload.icon))
            ? dbPayload.icon
            : null,
        };
        result = idValue
          ? await tableClient
              .update(fallbackPayload)
              .eq("id", idValue)
              .select("id")
              .single()
          : await tableClient
              .insert(fallbackPayload)
              .select("id")
              .single();
      }

      if (
        result.error &&
        resource === "certificates" &&
        result.error.code === "23502" &&
        result.error.message &&
        result.error.message.includes("issuer")
      ) {
        console.warn("[saveRecord] legacy NOT NULL on issuer detected, retrying with empty string");
        const fallbackWithIssuer = {
          ...writablePayload,
          issuer: "",
        };
        result = idValue && !insertWithExistingCertificateId
          ? await tableClient
              .update(fallbackWithIssuer)
              .eq("id", idValue)
              .select("id")
              .single()
          : await tableClient
              .insert(
                insertWithExistingCertificateId && idValue
                  ? { id: idValue, ...fallbackWithIssuer }
                  : fallbackWithIssuer,
              )
              .select("id")
              .single();
      }

      if (
        result.error &&
        resource === "certificates" &&
        isMissingCertificateTableError(result.error)
      ) {
        console.warn("[saveRecord] remote certificates table pending migration; saving to certificates fallback store");
        const savedItem = saveCertificateFallback({
          id: idValue || undefined,
          ...(dbPayload as Record<string, unknown>),
        });
        result = { data: { id: savedItem.id }, error: null };
      }

      error = result.error;
      savedId = (result.data as { id?: string } | null)?.id || null;
    } else {
      const tableClient = client.from(table) as unknown as MutationChain;
      let result = await tableClient
        .update(payload)
        .eq("id", true)
        .select("id")
        .single();

      if (
        result.error &&
        resource === "profile" &&
        (result.error.code === "PGRST204" ||
          (result.error.message &&
            (result.error.message.includes("hero_image_") ||
              result.error.message.includes("schema cache"))))
      ) {
        console.warn("[saveRecord] profiles table missing hero columns; saving hero settings to fallback store and retrying profile update");
        const profilePayload = payload as Record<string, unknown>;
        writeHeroSettingsFallback({
          hero_image_mode: profilePayload.hero_image_mode as "cutout" | "full" | undefined,
          hero_image_scale: typeof profilePayload.hero_image_scale === "number" ? profilePayload.hero_image_scale : undefined,
          hero_image_position_x: typeof profilePayload.hero_image_position_x === "number" ? profilePayload.hero_image_position_x : undefined,
          hero_image_position_y: typeof profilePayload.hero_image_position_y === "number" ? profilePayload.hero_image_position_y : undefined,
        });

        const fallbackPayload: Record<string, unknown> = { ...profilePayload };
        delete fallbackPayload.hero_image_mode;
        delete fallbackPayload.hero_image_scale;
        delete fallbackPayload.hero_image_position_x;
        delete fallbackPayload.hero_image_position_y;

        result = await tableClient
          .update(fallbackPayload)
          .eq("id", true)
          .select("id")
          .single();
      }
      error = result.error;
    }
    if (error) {
      logMutationError(`[saveRecord] Supabase error saving ${resource}`, error, {
        resource,
        id: idValue,
      });
      if (idValue && isCollection(resource) && isMissingRowError(error)) {
        return failure("This record no longer exists. Return to the list and choose an existing record.");
      }
      return failure(
        error.code === "23505"
          ? "That slug or record already exists. Choose a unique value."
          : `Database error (${error.code || "unknown"}): ${error.message || "Failed to save record."}`,
      );
    }
    let cleanupFailed = false;
    if (old?.data)
      for (const field of assetFields) {
        if (!(field in payload)) continue;
        const previous = Reflect.get(old.data, field) as unknown;
        if (
          typeof previous === "string" &&
          previous !== Reflect.get(payload, field)
        ) {
          if (!(await removeUnusedAsset(client, previous)))
            cleanupFailed = true;
        }
      }
    revalidateResource(resource, savedId);
    return {
      status: "success",
      message: `${editors[resource].singular} ${isCollection(resource) && !idValue ? "created" : "updated"} successfully.${cleanupFailed ? " An old file remains in Storage; review unused files in Supabase." : ""}`,
      ...(certificatePublicIdPendingMigration
        ? {
            message: `${editors[resource].singular} ${isCollection(resource) && !idValue ? "created" : "updated"} successfully. The Cloudinary URL is saved; apply migration 011 to store its public ID too.${cleanupFailed ? " An old file remains in Storage; review unused files in Supabase." : ""}`,
          }
        : {}),
      ...(savedId ? { id: savedId } : {}),
    };
  } catch (err: unknown) {
    console.error(`[saveRecord] Exception saving ${resource}:`, err);
    const detail = err instanceof Error ? err.message : String(err);
    return failure(`Save failed: ${detail}`);
  }
}

export async function deleteRecord(
  resourceValue: string,
  id: string,
): Promise<ActionResult> {
  const { client } = await requireAdmin();
  const parsed = resourceSchema.safeParse(resourceValue);
  if (
    !parsed.success ||
    !isCollection(parsed.data) ||
    !z.uuid().safeParse(id).success
  )
    return failure("Invalid delete request.");
  try {
    const tableClient = client.from(
      collectionTables[parsed.data],
    ) as unknown as MutationChain;
    const { data, error } = await tableClient
      .delete()
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      if (parsed.data === "certificates") {
        deleteCertificateFallback(id);
        revalidateResource(parsed.data, id);
        return {
          status: "success",
          message: "Certificate deleted.",
        };
      }
      return failure(
        "The record could not be deleted. Please refresh and try again.",
      );
    }
    if (!data) return failure("This record no longer exists. Refresh the page.");
    let cleanupFailed = false;
    for (const field of assetFields) {
      const path = Reflect.get(data, field) as unknown;
      if (typeof path === "string" && !(await removeUnusedAsset(client, path)))
        cleanupFailed = true;
    }
    revalidateResource(parsed.data, id);
    return {
      status: "success",
      message: `${editors[parsed.data].singular} deleted.${cleanupFailed ? " An unused file remains in Storage." : ""}`,
    };
  } catch {
    return failure("The service is unavailable. Please try again.");
  }
}

export async function toggleRecordVisibility(
  resourceValue: string,
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  const { client } = await requireAdmin();
  const parsed = resourceSchema.safeParse(resourceValue);
  if (
    !parsed.success ||
    !isCollection(parsed.data) ||
    !z.uuid().safeParse(id).success
  )
    return failure("Invalid visibility request.");
  const field = parsed.data === "projects" ? "is_published" : "is_visible";
  try {
    const tableClient = client.from(
      collectionTables[parsed.data],
    ) as unknown as MutationChain;
    const { error } = await tableClient
      .update({ [field]: visible })
      .eq("id", id)
      .select("id")
      .single();
    if (error) {
      if (parsed.data === "certificates") {
        const list = readCertificatesFallback();
        const found = list.find((c) => c.id === id);
        if (found) {
          found.is_visible = visible;
          writeCertificatesFallback(list);
          revalidateResource(parsed.data, id);
          return {
            status: "success",
            message: `Certificate ${visible ? "shown" : "hidden"}.`,
          };
        }
      }
      console.error(
        `[toggleRecordVisibility] Supabase error for ${parsed.data}:`,
        error,
      );
      return failure(
        `Database error (${error.code || "unknown"}): ${error.message || "Failed to update visibility."}`,
      );
    }
    revalidateResource(parsed.data, id);
    return {
      status: "success",
      message: `${editors[parsed.data].singular} ${visible ? "shown" : "hidden"}.`,
    };
  } catch (err: unknown) {
    console.error(`[toggleRecordVisibility] Exception:`, err);
    return failure("The service is unavailable. Please try again.");
  }
}

export async function saveHeroImageSettings(params: {
  hero_image_mode: "cutout" | "full";
  hero_image_scale: number;
  hero_image_position_x: number;
  hero_image_position_y: number;
  profile_image_path?: string | null;
}): Promise<ActionResult> {
  const { client, user } = await requireAdmin();
  try {
    // 1. Always persist hero image settings locally/to fallback storage
    writeHeroSettingsFallback({
      hero_image_mode: params.hero_image_mode,
      hero_image_scale: params.hero_image_scale,
      hero_image_position_x: params.hero_image_position_x,
      hero_image_position_y: params.hero_image_position_y,
    });

    const payload: Partial<import("@/types/database").ProfileRow> = {
      hero_image_mode: params.hero_image_mode,
      hero_image_scale: params.hero_image_scale,
      hero_image_position_x: params.hero_image_position_x,
      hero_image_position_y: params.hero_image_position_y,
    };
    if (params.profile_image_path !== undefined) {
      if (
        params.profile_image_path &&
        !params.profile_image_path.startsWith(user.id + "/")
      ) {
        return failure("Choose a file uploaded by this account.");
      }
      payload.profile_image_path = params.profile_image_path;
    }

    // 2. Attempt remote Supabase profiles update
    const { error } = await client
      .from("profiles")
      .update(payload)
      .eq("id", true);

    if (error) {
      console.warn("[saveHeroImageSettings] Supabase profiles update error:", error);
      // Check if the error is due to missing columns or schema cache (e.g. PGRST204 or missing column name)
      const isMissingColumn =
        error.code === "PGRST204" ||
        (error.message &&
          (error.message.includes("hero_image_") ||
            error.message.includes("schema cache")));

      if (isMissingColumn) {
        // If image path was updated, persist the image path separately to profiles table
        if (params.profile_image_path !== undefined) {
          const { error: pathError } = await client
            .from("profiles")
            .update({ profile_image_path: params.profile_image_path })
            .eq("id", true);
          if (pathError) {
            console.error("[saveHeroImageSettings] Error saving profile_image_path:", pathError);
          }
        }
        // Successfully saved via fallback while remote migration is pending
        revalidateResource("profile", null);
        return {
          status: "success",
          message: "Hero image updated successfully.",
        };
      }

      return failure(
        `Database error (${error.code || "unknown"}): ${error.message || "Failed to save hero image settings."}`,
      );
    }

    revalidateResource("profile", null);
    return {
      status: "success",
      message: "Hero image updated successfully.",
    };
  } catch (err: unknown) {
    console.error("[saveHeroImageSettings] Exception:", err);
    return failure("Failed to save hero image settings.");
  }
}

export async function submitContactMessage(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const honeypot = form.get("hp_company");
  if (honeypot && String(honeypot).trim().length > 0) {
    // Silently return success to mislead bots
    return {
      status: "success",
      message: "Thank you for reaching out! Your message has been sent successfully.",
    };
  }

  const renderTimestamp = form.get("form_ts");
  if (renderTimestamp) {
    const elapsed = Date.now() - Number(renderTimestamp);
    // If submitted faster than 800ms, likely an automated bot
    if (!Number.isNaN(elapsed) && elapsed < 800) {
      return {
        status: "success",
        message: "Thank you for reaching out! Your message has been sent successfully.",
      };
    }
  }

  const name = String(form.get("name") || "").trim();
  const emailVal = String(form.get("email") || "").trim();
  const subject = String(form.get("subject") || "").trim();
  const message = String(form.get("message") || "").trim();

  const parsed = contactMessageSubmissionSchema.safeParse({
    name,
    email: emailVal,
    subject,
    message,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      errors: Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      ),
    };
  }

  const client = createPublicClient();
  if (!client) {
    return failure("The contact service is currently unavailable. Please try again later.");
  }

  const { error } = await client.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    is_read: false,
  });

  if (error) {
    console.error("[submitContactMessage] Supabase error:", error);
    if (
      error.code === "PGRST205" ||
      error.code === "42P01" ||
      error.message?.toLowerCase().includes("does not exist") ||
      error.message?.toLowerCase().includes("schema cache")
    ) {
      return failure(
        "The message service is temporarily undergoing maintenance. Please reach out directly via email or try again shortly.",
      );
    }
    return failure("Your message could not be sent. Please check your information and try again.");
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return {
    status: "success",
    message: "Thank you for reaching out! Your message has been sent successfully.",
  };
}

export async function markContactMessageRead(
  id: string,
  isRead: boolean,
): Promise<ActionResult> {
  const { client } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) {
    return failure("Invalid message identifier.");
  }

  const { error } = await client
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);

  if (error) {
    console.error("[markContactMessageRead] Error:", error);
    return failure("Failed to update message status.");
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return {
    status: "success",
    message: isRead ? "Marked as read." : "Marked as unread.",
  };
}

export async function deleteContactMessage(id: string): Promise<ActionResult> {
  const { client } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) {
    return failure("Invalid message identifier.");
  }

  const { error } = await client
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteContactMessage] Error:", error);
    return failure("Failed to delete message.");
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { status: "success", message: "Message deleted successfully." };
}
