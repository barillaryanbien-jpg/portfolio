import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { resourceSchema, isCollection } from "@/lib/admin/schema";
import { editors } from "@/lib/admin/fields";
import { loadEditor } from "@/lib/admin/data";
import { RecordForm } from "@/components/admin/record-form";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ section: string; id: string }>;
}) {
  const { section, id } = await params;
  const parsed = resourceSchema.safeParse(section);
  if (
    !parsed.success ||
    !isCollection(parsed.data) ||
    !z.uuid().safeParse(id).success
  )
    notFound();
  const resource = parsed.data;
  const { values, previews } = await loadEditor(resource, id);
  const backHref = resource === "education" || resource === "experience" ? "/admin/about" : `/admin/${resource}`;
  const backLabel = resource === "education" || resource === "experience" ? "about" : editors[resource].title.toLowerCase();

  return (
    <>
      <Link href={backHref} className="admin-back-link">
        ← Back to {backLabel}
      </Link>
      <div className="admin-page-heading">
        <div>
          <h1>Edit {editors[resource].singular.toLowerCase()}</h1>
          <p>{editors[resource].description}</p>
        </div>
      </div>
      <RecordForm
        resource={resource}
        id={id}
        initialValues={values}
        previews={previews}
      />
    </>
  );
}
