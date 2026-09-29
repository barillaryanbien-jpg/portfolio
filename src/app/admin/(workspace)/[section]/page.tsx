import { notFound } from "next/navigation";
import { resourceSchema, isCollection } from "@/lib/admin/schema";
import { editors } from "@/lib/admin/fields";
import { loadCollection, loadEditor } from "@/lib/admin/data";
import { Collection } from "@/components/admin/collection";
import { RecordForm } from "@/components/admin/record-form";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const parsed = resourceSchema.safeParse((await params).section);
  if (!parsed.success) notFound();
  const resource = parsed.data;
  const definition = editors[resource];
  const educationItems =
    resource === "about" ? await loadCollection("education") : null;
  const experienceItems =
    resource === "about" ? await loadCollection("experience") : null;
  const content = isCollection(resource) ? (
    <Collection resource={resource} items={await loadCollection(resource)} />
  ) : (
    await (async () => {
      const { values, previews } = await loadEditor(resource);
      return (
        <>
          <RecordForm
            resource={resource}
            initialValues={values}
            previews={previews}
          />
          {resource === "about" && educationItems && (
            <div className="mt-10">
              <Collection resource="education" items={educationItems} />
            </div>
          )}
          {resource === "about" && experienceItems && (
            <div className="mt-10">
              <Collection resource="experience" items={experienceItems} />
            </div>
          )}
        </>
      );
    })()
  );
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Manage your portfolio</p>
          <h1>{definition.title}</h1>
          <p>{definition.description}</p>
        </div>
      </div>
      {content}
    </>
  );
}
