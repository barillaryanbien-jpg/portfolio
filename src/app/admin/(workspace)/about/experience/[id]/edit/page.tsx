import EditRecordPage from "../../../../[section]/[id]/edit/page";

export default function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return EditRecordPage({
    params: params.then(({ id }) => ({ section: "experience", id })),
  });
}
