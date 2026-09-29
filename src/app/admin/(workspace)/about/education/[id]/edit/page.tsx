import EditRecordPage from "../../../../[section]/[id]/edit/page";

export default function EditEducationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return EditRecordPage({
    params: params.then(({ id }) => ({ section: "education", id })),
  });
}
