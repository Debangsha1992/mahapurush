import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  LifeStoryBody,
  LifeStoryResources,
} from "@/components/thinkers/life-story-body";
import type { LifeStoryPage } from "@/lib/content/schemas";

const page: LifeStoryPage = {
  title: "Global Recognition",
  body: "In 1913, Rabindranath Tagore became the first non-European to win the Nobel Prize in Literature.\n\nGitanjali stayed alive for later readers.",
  sourceLinks: [
    {
      text: "In 1913, Rabindranath Tagore became the first non-European to win the Nobel Prize in Literature.",
      title: "The Nobel Prize: Rabindranath Tagore Facts",
      url: "https://www.nobelprize.org/prizes/literature/1913/tagore/facts/",
      accessedAt: "2026-07-10",
    },
  ],
  resources: [
    {
      title: "Read Gitanjali at Project Gutenberg",
      url: "https://www.gutenberg.org/ebooks/7164",
      accessedAt: "2026-07-10",
      description: "A public-domain edition keeps the poems available today.",
    },
  ],
};

describe("LifeStoryBody", () => {
  it("links only configured source phrases", () => {
    const markup = renderToStaticMarkup(<LifeStoryBody page={page} />);

    expect(markup).toContain(
      'href="https://www.nobelprize.org/prizes/literature/1913/tagore/facts/"',
    );
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).not.toContain('href="https://www.gutenberg.org/ebooks/7164"');
  });
});

describe("LifeStoryResources", () => {
  it("renders final-page resources with descriptions", () => {
    const markup = renderToStaticMarkup(
      <LifeStoryResources resources={page.resources} />,
    );

    expect(markup).toContain("Read or explore today");
    expect(markup).toContain("Read Gitanjali at Project Gutenberg");
    expect(markup).toContain("A public-domain edition keeps the poems available today.");
    expect(markup).toContain('href="https://www.gutenberg.org/ebooks/7164"');
  });
});
