import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  getAllQuoteCards,
  getAllThinkers,
  getQuoteCardById,
} from "@/lib/content/loaders";

export function generateStaticParams() {
  return getAllQuoteCards().map((quote) => ({ id: quote.id }));
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = getQuoteCardById(id);
  if (!quote) {
    notFound();
  }

  const thinker = getAllThinkers().find((item) => item.id === quote.thinkerId);

  return (
    <Card className="mx-auto max-w-2xl space-y-5">
      <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
        Quote Card
      </p>
      <p className="font-serif text-3xl leading-tight">&ldquo;{quote.quote}&rdquo;</p>
      <p className="text-[var(--color-muted)]">— {thinker?.name}</p>
      <div>
        <h3 className="font-semibold">Meaning</h3>
        <p className="mt-2 leading-8 text-[var(--color-muted)]">{quote.meaning}</p>
      </div>
      <div>
        <h3 className="font-semibold">Context</h3>
        <p className="mt-2 leading-8 text-[var(--color-muted)]">{quote.context}</p>
      </div>
      <div>
        <h3 className="font-semibold">Today&apos;s Question</h3>
        <p className="mt-2 leading-8">{quote.todayQuestion}</p>
      </div>
    </Card>
  );
}
