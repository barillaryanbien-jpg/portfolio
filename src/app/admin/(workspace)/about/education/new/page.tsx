import NewRecordPage from "../../../[section]/new/page";

export default function NewEducationPage() {
  return NewRecordPage({
    params: Promise.resolve({ section: "education" }),
  });
}
