import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { resourceSchema, isCollection, type FormValues } from "@/lib/admin/schema";
import { editors } from "@/lib/admin/fields";
import { RecordForm } from "@/components/admin/record-form";
import { collectionTables } from "@/lib/admin/data";

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { client } = await requireAdmin();
  const parsed = resourceSchema.safeParse((await params).section);
  if (!parsed.success || !isCollection(parsed.data)) notFound();
  const resource = parsed.data;

  // Determine next sort_order
  let initialValues: FormValues = { is_visible: true };
  try {
    const { data: maxRow } = await client
      .from(collectionTables[resource])
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle<{ sort_order: number }>();

    const nextOrder = maxRow?.sort_order !== undefined ? (Number(maxRow.sort_order) + 1) : 1;
    initialValues = {
      sort_order: nextOrder,
      is_visible: true,
      ...(resource === "projects" ? {
        is_published: true,
        featured: false,
        cover_display_type: "desktop",
        cover_fit: "cover",
        cover_zoom: 1.0,
        cover_position_x: 50.0,
        cover_position_y: 50.0,
      } : {}),
    };
  } catch {
    // Graceful fallback if query fails
    initialValues = {
      sort_order: 1,
      is_visible: true,
      ...(resource === "projects" ? {
        is_published: true,
        featured: false,
        cover_display_type: "desktop",
        cover_fit: "cover",
        cover_zoom: 1.0,
        cover_position_x: 50.0,
        cover_position_y: 50.0,
      } : {}),
    };
  }

  const backHref = resource === "education" || resource === "experience" ? "/admin/about" : `/admin/${resource}`;
  const backLabel = resource === "education" || resource === "experience" ? "about" : editors[resource].title.toLowerCase();

  return (
    <>
      <Link href={backHref} className="admin-back-link">
        ← Back to {backLabel}
      </Link>
      <div className="admin-page-heading">
        <div>
          <h1>Add {editors[resource].singular.toLowerCase()}</h1>
          <p>{editors[resource].description}</p>
        </div>
      </div>
      <RecordForm resource={resource} initialValues={initialValues} previews={{}} />
    </>
  );
}
