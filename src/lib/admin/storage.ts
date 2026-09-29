import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const assetFields = [
  "profile_image_path",
  "about_image_path",
  "resume_path",
  "cover_image_path",
  "icon_path",
  "certificate_image_path",
] as const;

export function isExternalAssetUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

export function bucketFor(path: string) {
  return path.endsWith(".pdf") ? "portfolio-files" : "portfolio-images";
}
export async function signAssets(
  client: SupabaseClient<Database>,
  paths: (string | null | undefined)[],
) {
  const result: Record<string, string> = {};
  const unique = [...new Set(paths.filter((path): path is string => !!path))];
  for (const path of unique) {
    if (isExternalAssetUrl(path)) {
      result[path] = path;
    }
  }
  const storagePaths = unique.filter((path) => !isExternalAssetUrl(path));
  await Promise.all(
    ["portfolio-images", "portfolio-files"].map(async (bucket) => {
      const files = storagePaths.filter((path) => bucketFor(path) === bucket);
      if (!files.length) return;
      const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrls(files, 3600);
      if (error)
        throw new Error("Files could not be loaded. Please try again.");
      for (const file of data) {
        if (file.path && file.signedUrl && !file.error) {
          result[file.path] = file.signedUrl;
          continue;
        }
        if (file.path) {
          const { data: publicData } = client.storage
            .from(bucket)
            .getPublicUrl(file.path);
          if (publicData.publicUrl) result[file.path] = publicData.publicUrl;
        }
      }
    }),
  );
  for (const path of storagePaths) {
    if (result[path]) continue;
    const { data: publicData } = client.storage
      .from(bucketFor(path))
      .getPublicUrl(path);
    if (publicData.publicUrl) result[path] = publicData.publicUrl;
  }
  return result;
}

export async function removeUnusedAsset(
  client: SupabaseClient<Database>,
  path: string,
) {
  if (isExternalAssetUrl(path)) return false;
  try {
    const { data: referenced, error } = await client.rpc(
      "asset_is_referenced",
      { object_path: path },
    );
    if (error || referenced) return false;
    const { error: removalError } = await client.storage
      .from(bucketFor(path))
      .remove([path]);
    return !removalError;
  } catch {
    return false;
  }
}
