import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { editors } from "@/lib/admin/fields";
import { loadEditor } from "@/lib/admin/data";
import { RecordForm } from "@/components/admin/record-form";

export default async function EditStatisticPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const definition = editors.statistics;
  const { values, previews } = await loadEditor("statistics", id);

  return (
    <>
      <Link href="/admin/statistics" className="admin-back-link">
        ← Back to {definition.title.toLowerCase()}
      </Link>
      <div className="admin-page-heading">
        <div>
          <h1>Edit {definition.singular.toLowerCase()}</h1>
          <p>{definition.description}</p>
        </div>
      </div>
      <RecordForm
        resource="statistics"
        id={id}
        initialValues={values}
        previews={previews}
      />
    </>
  );
}
