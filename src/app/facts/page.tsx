import { FactsBrowser } from "@/components/facts/facts-browser";
import { getFactBatch } from "@/lib/content/loaders";

export default function FactsPage() {
  const facts = getFactBatch();
  return <FactsBrowser facts={facts} />;
}
