import SectionPage from "../[section]/page";

export default function AboutPage() {
  return SectionPage({
    params: Promise.resolve({ section: "about" }),
  });
}
