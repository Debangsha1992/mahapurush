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

function getMobileMarkup(markup: string): string {
  const start = markup.indexOf("data-facts-mobile-deck");
  const end = markup.indexOf("data-facts-desktop-layout");

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return markup.slice(start, end);
}

describe("FactsBrowser", () => {
  it("renders a light mobile swipe card while preserving the desktop editorial layout", () => {
    const markup = renderToStaticMarkup(<FactsBrowser facts={facts} />);
    const mobileMarkup = getMobileMarkup(markup);

    expect(markup).toContain("data-facts-mobile-deck");
    expect(markup).toContain("md:hidden");
    expect(mobileMarkup).toContain("Swipe up or down for another fact");
    expect(mobileMarkup).toContain("Exit Facts Mode");
    expect(mobileMarkup).toContain("Close");
    expect(mobileMarkup).toContain("fixed inset-0");
    expect(mobileMarkup).toContain("bg-[#f7f1e7]");
    expect(mobileMarkup).toContain("touch-none");
    expect(mobileMarkup).toContain("fact-card-refresh");
    expect(mobileMarkup).toContain("science");
    expect(mobileMarkup).toContain("observation");
    expect(mobileMarkup).not.toContain("Next fact");
    expect(mobileMarkup).not.toContain("3D Card");
    expect(mobileMarkup).not.toContain("perspective-[1200px]");
    expect(mobileMarkup).not.toContain("Scroll for another Fact");
    expect(mobileMarkup).not.toContain("max-h-24 overflow-y-auto");
    expect(mobileMarkup).not.toContain("overflow-y-auto");
    expect(mobileMarkup).not.toContain("What to learn");
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
