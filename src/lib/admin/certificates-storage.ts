import fs from "fs";
import path from "path";

export interface CertificateItem {
  id: string;
  title: string;
  issuer?: string | null;
  category?: string | null;
  issue_date?: string | null;
  expiration_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  description?: string | null;
  certificate_image_path?: string | null;
  certificate_image_public_id?: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

function getCertificatesFilePath(): string {
  return path.join(process.cwd(), "src", "data", "certificates.json");
}

export function readCertificatesFallback(): CertificateItem[] {
  try {
    const filePath = getCertificatesFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.error("[readCertificatesFallback] Error reading fallback certificates:", err);
  }
  return [];
}

export function writeCertificatesFallback(items: CertificateItem[]): boolean {
  try {
    const filePath = getCertificatesFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[writeCertificatesFallback] Error writing fallback certificates:", err);
    return false;
  }
}

export function saveCertificateFallback(
  item: Partial<CertificateItem> & { id?: string | null }
): CertificateItem {
  const current = readCertificatesFallback();
  const now = new Date().toISOString();
  let saved: CertificateItem;

  if (item.id && current.some((c) => c.id === item.id)) {
    // Update existing
    saved = {
      id: item.id,
      title: item.title || "Untitled Certificate",
      issuer: item.issuer ?? null,
      category: item.category ?? null,
      issue_date: item.issue_date ?? null,
      expiration_date: item.expiration_date ?? null,
      credential_id: item.credential_id ?? null,
      credential_url: item.credential_url ?? null,
      description: item.description ?? null,
      certificate_image_path: item.certificate_image_path ?? null,
      certificate_image_public_id: item.certificate_image_public_id ?? null,
      sort_order: typeof item.sort_order === "number" ? item.sort_order : 0,
      is_visible: item.is_visible !== false,
      created_at: current.find((c) => c.id === item.id)?.created_at || now,
      updated_at: now,
    };
    const updated = current.map((c) => (c.id === item.id ? saved : c));
    writeCertificatesFallback(updated);
  } else {
    // Insert new
    saved = {
      id: item.id || crypto.randomUUID(),
      title: item.title || "Untitled Certificate",
      issuer: item.issuer ?? null,
      category: item.category ?? null,
      issue_date: item.issue_date ?? null,
      expiration_date: item.expiration_date ?? null,
      credential_id: item.credential_id ?? null,
      credential_url: item.credential_url ?? null,
      description: item.description ?? null,
      certificate_image_path: item.certificate_image_path ?? null,
      certificate_image_public_id: item.certificate_image_public_id ?? null,
      sort_order: typeof item.sort_order === "number" ? item.sort_order : current.length + 1,
      is_visible: item.is_visible !== false,
      created_at: now,
      updated_at: now,
    };
    writeCertificatesFallback([...current, saved]);
  }

  return saved;
}

export function deleteCertificateFallback(id: string): boolean {
  const current = readCertificatesFallback();
  const filtered = current.filter((c) => c.id !== id);
  if (filtered.length !== current.length) {
    return writeCertificatesFallback(filtered);
  }
  return false;
}
