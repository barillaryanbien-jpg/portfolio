"use server";

import "server-only";
import crypto from "node:crypto";
import { requireAdmin } from "./auth";
import type { ActionResult } from "./schema";

export interface UploadResult extends ActionResult {
  path?: string;
  preview?: string;
  publicId?: string;
}

interface CloudinaryErrorPayload {
  error?: {
    message?: string;
    http_code?: number;
  };
  secure_url?: string;
  public_id?: string;
}

function readServerEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || null;
}

function cloudinaryConfig() {
  const cloudName = readServerEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readServerEnv("CLOUDINARY_API_KEY");
  const apiSecret = readServerEnv("CLOUDINARY_API_SECRET");
  const availability = {
    cloudName: Boolean(cloudName),
    apiKey: Boolean(apiKey),
    apiSecret: Boolean(apiSecret),
  };
  if (!cloudName || !apiKey || !apiSecret)
    return { config: null, availability } as const;
  return { cloudName, apiKey, apiSecret };
}

function uploadErrorMessage(detail: string) {
  return process.env.NODE_ENV === "development"
    ? `Certificate upload failed: ${detail}`
    : "The certificate image could not be uploaded. Please try again.";
}

function errorDetails(error: unknown) {
  if (!(error instanceof Error))
    return { name: "UnknownError", message: String(error), code: undefined };
  const cause = error.cause as { code?: unknown } | undefined;
  return {
    name: error.name,
    message: error.message,
    code: typeof cause?.code === "string" ? cause.code : undefined,
  };
}

async function uploadCertificateToCloudinary(
  file: File,
  bytes: Uint8Array,
  certificateId: string | null,
): Promise<UploadResult> {
  const cloudinary = cloudinaryConfig();
  if ("config" in cloudinary) {
    console.error("[uploadAsset] Cloudinary configuration is incomplete.", {
      ...cloudinary.availability,
      certificateId,
    });
    return {
      status: "error",
      message: uploadErrorMessage(
        "Cloudinary is not configured on the server. Restart the development server after updating .env.local.",
      ),
    };
  }
  const config = cloudinary;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "portfolio/certificates";
  const publicId = crypto.randomUUID();
  const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");
  const body = new FormData();
  // A data URI avoids forwarding the browser File object across a second
  // multipart boundary after the server action has already consumed it.
  body.set(
    "file",
    `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`,
  );
  body.set("api_key", config.apiKey);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("public_id", publicId);
  body.set("signature", signature);

  let response: Response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: "POST", body, cache: "no-store" },
    );
  } catch (error) {
    const detail = errorDetails(error);
    console.error("[uploadAsset] Cloudinary request failed before a response.", {
      ...detail,
      cloudName: true,
      apiKey: true,
      apiSecret: true,
      certificateId,
    });
    return {
      status: "error",
      message: uploadErrorMessage(
        `${detail.code ? `${detail.code}: ` : ""}${detail.message}`,
      ),
    };
  }
  const payload = (await response
    .json()
    .catch(() => null)) as CloudinaryErrorPayload | null;

  if (
    !response.ok ||
    !payload?.secure_url ||
    !payload.public_id ||
    !payload.secure_url.startsWith("https://")
  ) {
    const cloudinaryMessage =
      payload?.error?.message ||
      response.headers.get("x-cld-error") ||
      "Cloudinary returned an invalid upload response.";
    console.error("[uploadAsset] Cloudinary certificate upload failed:", {
      status: response.status,
      code: payload?.error?.http_code,
      message: cloudinaryMessage,
      cloudName: true,
      apiKey: true,
      apiSecret: true,
      certificateId,
    });
    return {
      status: "error",
      message: uploadErrorMessage(
        `Cloudinary returned HTTP ${response.status}: ${cloudinaryMessage}`,
      ),
    };
  }

  return {
    status: "success",
    path: payload.secure_url,
    preview: payload.secure_url,
    publicId: payload.public_id,
    message: "Image uploaded to Cloudinary. Save changes to publish it.",
  };
}

export async function uploadCertificateImage(
  file: File,
  certificateId: string | null = null,
): Promise<UploadResult> {
  const limit = 5 * 1024 * 1024;
  if (!file.size || file.size > limit) {
    return {
      status: "error",
      message: "Choose a certificate image smaller than 5 MB.",
    };
  }

  const types: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = types[file.type];
  if (!extension) {
    return {
      status: "error",
      message: "Use a JPEG, PNG, or WebP certificate image.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder().decode(bytes.slice(0, 12));
  const valid =
    extension === "jpg"
      ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : extension === "png"
        ? [137, 80, 78, 71, 13, 10, 26, 10].every(
            (value, index) => bytes[index] === value,
          )
        : signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP";

  if (!valid) {
    return {
      status: "error",
      message:
        "The certificate image contents do not match its type. Choose a different image.",
    };
  }

  return uploadCertificateToCloudinary(file, bytes, certificateId);
}

export async function uploadAsset(form: FormData): Promise<UploadResult> {
  const { client, user } = await requireAdmin();
  const file = form.get("file");
  const folder = form.get("folder");
  const rawCertificateId = form.get("certificateId");
  const certificateId =
    typeof rawCertificateId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      rawCertificateId,
    )
      ? rawCertificateId
      : null;
  if (
    typeof folder !== "string" ||
    !["profile", "projects", "about", "skills", "resume", "certificates"].includes(folder) ||
    !(file instanceof File)
  )
    return { status: "error", message: "Choose a valid file." };
  const isPdf = folder === "resume";
  const limit = (isPdf ? 10 : 5) * 1024 * 1024;
  if (!file.size || file.size > limit)
    return {
      status: "error",
      message: `Choose a file smaller than ${isPdf ? 10 : 5} MB.`,
    };
  const types: Record<string, string> = isPdf
    ? { "application/pdf": "pdf" }
    : { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const extension = types[file.type];
  if (!extension)
    return {
      status: "error",
      message: isPdf
        ? "Only PDF files are supported."
        : "Use a JPEG, PNG, or WebP image.",
    };
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const signature = new TextDecoder().decode(bytes.slice(0, 12));
    const valid =
      extension === "pdf"
        ? signature.startsWith("%PDF-")
        : extension === "jpg"
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : extension === "png"
            ? [137, 80, 78, 71, 13, 10, 26, 10].every(
                (value, index) => bytes[index] === value,
              )
            : signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP";
    if (!valid)
      return {
        status: "error",
        message:
          "The file contents do not match its type. Choose a different file.",
      };
    if (folder === "certificates")
      return await uploadCertificateToCloudinary(file, bytes, certificateId);
    const bucket = isPdf ? "portfolio-files" : "portfolio-images";
    const path = `${user.id}/${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage
      .from(bucket)
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (error)
      return {
        status: "error",
        message:
          "The upload failed. Check your connection and Storage setup, then try again.",
      };
    const { data } = await client.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    return {
      status: "success",
      path,
      preview: data?.signedUrl,
      message: "File uploaded. Save changes to publish it.",
    };
  } catch (error) {
    const detail = errorDetails(error);
    console.error("[uploadAsset] Unexpected upload failure.", {
      ...detail,
      folder: typeof folder === "string" ? folder : null,
      certificateId,
    });
    return {
      status: "error",
      message:
        folder === "certificates"
          ? uploadErrorMessage(
              `${detail.code ? `${detail.code}: ` : ""}${detail.message}`,
            )
          : "The upload service is unavailable. Please try again.",
    };
  }
}
