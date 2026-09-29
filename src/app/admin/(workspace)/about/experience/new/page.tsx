import NewRecordPage from "../../../[section]/new/page";

export default function NewExperiencePage() {
  return NewRecordPage({
    params: Promise.resolve({ section: "experience" }),
  });
}
