import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { editors } from "@/lib/admin/fields";
import { loadCollection } from "@/lib/admin/data";
import { Collection } from "@/components/admin/collection";

export default async function StatisticsPage() {
  await requireAdmin();
  const definition = editors.statistics;
  if (!definition) notFound();

  const items = await loadCollection("statistics");

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Manage your portfolio</p>
          <h1>{definition.title}</h1>
          <p>{definition.description}</p>
        </div>
      </div>
      <Collection resource="statistics" items={items} />
    </>
  );
}
