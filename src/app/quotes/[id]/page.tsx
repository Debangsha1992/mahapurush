import { notFound } from "next/navigation";
import {
  EditorialCard,
  EditorialPageHero,
  SectionHeader,
  mutedText,
} from "@/components/ui/editorial";
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
    <div className="mx-auto max-w-3xl space-y-5">
      <EditorialPageHero
        eyebrow="Quote Card"
        title={thinker?.name ?? "Great Mind"}
        description="A short prompt for reflection."
      >
        <p className="font-serif text-3xl leading-tight md:text-4xl">
          &ldquo;{quote.quote}&rdquo;
        </p>
      </EditorialPageHero>

      <EditorialCard className="space-y-5">
        <div>
          <SectionHeader eyebrow="Meaning" title="What it points to" />
          <p className={`mt-2 leading-8 ${mutedText}`}>{quote.meaning}</p>
        </div>
        <div>
          <SectionHeader eyebrow="Context" title="Why it mattered" />
          <p className={`mt-2 leading-8 ${mutedText}`}>{quote.context}</p>
        </div>
        <div>
          <SectionHeader eyebrow="Today" title="Question" />
          <p className="mt-2 leading-8">{quote.todayQuestion}</p>
        </div>
      </EditorialCard>
    </div>
  );
}
