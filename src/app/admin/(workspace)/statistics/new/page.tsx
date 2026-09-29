import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { editors } from "@/lib/admin/fields";
import { RecordForm } from "@/components/admin/record-form";

export default async function NewStatisticPage() {
  const { client } = await requireAdmin();
  const definition = editors.statistics;
  if (!definition) notFound();

  const initialValues = { sort_order: 1, is_visible: true };
  try {
    const { data: maxRow } = await client
      .from("statistics")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxRow?.sort_order !== undefined) {
      initialValues.sort_order = Number(maxRow.sort_order) + 1;
    }
  } catch {
    // fallback
  }

  return (
    <>
      <Link href="/admin/statistics" className="admin-back-link">
        ← Back to {definition.title.toLowerCase()}
      </Link>
      <div className="admin-page-heading">
        <div>
          <h1>Add {definition.singular.toLowerCase()}</h1>
          <p>{definition.description}</p>
        </div>
      </div>
      <RecordForm resource="statistics" initialValues={initialValues} previews={{}} />
    </>
  );
}
