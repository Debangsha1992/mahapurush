import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FactsBrowser } from "@/components/facts/facts-browser";
import type { FactWithPerson } from "@/lib/content/schemas";

const facts: FactWithPerson[] = [
  {
    id: "galileo-telescope",
    text: "Galileo improved the telescope and used it to observe moons orbiting Jupiter.",
    context:
      "This source-backed Fact matters because it shows how direct observation can challenge inherited assumptions about the universe.",
    sourceTitle: "Galileo Project",
    sourceUrl: "https://example.com/galileo",
    sourceAccessedAt: "2026-07-06",
    sourceType: "reference",
    claimStatus: "verified",
    editorialStatus: "facts-mode-approved",
    sourceNote: "Galileo's observations of Jupiter's moons are documented by the Galileo Project.",
    tags: ["science", "observation"],
    verified: true,
    person: {
      id: "galileo",
      slug: "galileo",
      name: "Galileo Galilei",
      shortName: "Galileo",
      era: "1564-1642",
      region: "Italy",
      regionId: "europe",
      primaryDomain: "science-math-technology",
      domains: ["science"],
      summary: "Galileo tested inherited ideas through observation and measurement.",
      knownFor: ["Astronomy", "Scientific method"],
      featured: true,
      sourceRefs: [
        {
          title: "Galileo Project",
          url: "https://example.com/galileo",
          accessedAt: "2026-07-06",
        },
      ],
      reviewStatus: "published",
    },
    thinkerSlug: "galileo",
  },
];

describe("FactsBrowser", () => {
  it("renders a mobile 3D reading stage while preserving the desktop editorial layout", () => {
    const markup = renderToStaticMarkup(<FactsBrowser facts={facts} />);

    expect(markup).toContain("data-facts-mobile-deck");
    expect(markup).toContain("md:hidden");
    expect(markup).toContain("Swipe up or down for another fact");
    expect(markup).toContain("Exit Facts Mode");
    expect(markup).toContain("Close");
    expect(markup).toContain("perspective-[1200px]");
    expect(markup).toContain("touch-none");
    expect(markup).toContain("fact-card-refresh");
    expect(markup).not.toContain("3D Card");
    expect(markup).not.toContain("Scroll for another Fact");
    expect(markup).not.toContain("max-h-24 overflow-y-auto");
    expect(markup).not.toContain("overflow-y-auto");
    expect(markup).not.toContain("What to learn");
    expect(markup).toContain("data-facts-desktop-layout");
    expect(markup).toContain("hidden md:block");
    expect(markup).toContain("Next fact");
    expect(markup).toContain("Cool facts about notable people");
    expect(markup).toContain("Worth knowing");
  });

  it("does not render generated person-summary metadata in Facts Mode", () => {
    const placeholderFacts: FactWithPerson[] = [
      {
        ...facts[0],
        person: {
          ...facts[0].person,
          summary:
            "Ada Lovelace is a notable science, math & technology connected with United Kingdom.",
        },
      },
    ];

    const markup = renderToStaticMarkup(<FactsBrowser facts={placeholderFacts} />);

    expect(markup).not.toContain("is a notable science, math");
    expect(markup).not.toContain("connected with United Kingdom");
  });
});
