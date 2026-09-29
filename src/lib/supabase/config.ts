export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    // Accept only public keys; fail closed if a secret/service-role key is pasted.
    if (!key.startsWith("sb_publishable_")) {
      const payload = JSON.parse(Buffer.from(key.split(".")[1] || "", "base64url").toString("utf8")) as { role?: unknown };
      if (payload.role !== "anon") return null;
    }
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" &&
      !(
        parsed.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname)
      )
    )
      return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}
