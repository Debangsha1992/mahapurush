import type { ReactNode } from "react";
import { editorialEyebrow, mutedText } from "@/components/ui/editorial";
import type {
  LifeStoryPage,
  LifeStoryResource,
  LifeStorySourceLink,
} from "@/lib/content/schemas";

type LifeStoryBodyProps = {
  page: LifeStoryPage;
  className?: string;
};

type LifeStoryResourcesProps = {
  resources?: LifeStoryResource[];
};

type LinkEntry = LifeStorySourceLink & {
  index: number;
  used: boolean;
};

const sourceLinkClassName =
  "font-semibold text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-4 transition hover:decoration-[var(--color-accent)]";

function renderLinkedText(
  text: string,
  sourceLinks: LifeStorySourceLink[] = [],
): ReactNode[] {
  const entries: LinkEntry[] = sourceLinks.map((sourceLink, index) => ({
    ...sourceLink,
    index,
    used: false,
  }));
  const nodes: ReactNode[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const nextMatch = entries
      .map((entry) => ({
        entry,
        position: entry.used ? -1 : text.indexOf(entry.text, cursor),
      }))
      .filter((match) => match.position >= 0)
      .sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        return b.entry.text.length - a.entry.text.length;
      })[0];

    if (!nextMatch) {
      nodes.push(text.slice(cursor));
      break;
    }

    if (nextMatch.position > cursor) {
      nodes.push(text.slice(cursor, nextMatch.position));
    }

    nodes.push(
      <a
        key={`${nextMatch.entry.index}-${nextMatch.position}`}
        href={nextMatch.entry.url}
        target="_blank"
        rel="noopener noreferrer"
        title={nextMatch.entry.title}
        className={sourceLinkClassName}
      >
        {nextMatch.entry.text}
      </a>,
    );

    nextMatch.entry.used = true;
    cursor = nextMatch.position + nextMatch.entry.text.length;
  }

  return nodes;
}

export function LifeStoryBody({
  page,
  className = "text-lg leading-8 text-[var(--color-text)]",
}: LifeStoryBodyProps) {
  const paragraphs = page.body.split(/\n{2,}/).filter(Boolean);

  return (
    <div className={`space-y-5 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${page.title}-${index}`}>
          {renderLinkedText(paragraph, page.sourceLinks)}
        </p>
      ))}
    </div>
  );
}

export function LifeStoryResources({ resources }: LifeStoryResourcesProps) {
  if (!resources?.length) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-[1rem] border border-[var(--color-border)] bg-white/40 p-4">
      <p className={editorialEyebrow}>Read or explore today</p>
      <div className="space-y-3">
        {resources.map((resource) => (
          <div key={resource.url} className="space-y-1">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-4 transition hover:decoration-[var(--color-accent)]"
            >
              {resource.title}
            </a>
            {resource.description && (
              <p className={`text-sm leading-6 ${mutedText}`}>
                {resource.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
