import { FactsBrowser } from "@/components/facts/facts-browser";
import { getAllFacts } from "@/lib/content/loaders";

export default function FactsPage() {
  const facts = getAllFacts().filter((fact) => fact.verified);
  return <FactsBrowser facts={facts} />;
}
