import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PersonCard } from "@/components/people/person-card";
import type { PersonSummary } from "@/lib/content/schemas";

const person: PersonSummary = {
  id: "puyi",
  slug: "puyi",
  name: "Puyi",
  shortName: "Puyi",
  era: "1906-1967",
  region: "China",
  regionId: "east-asia",
  primaryDomain: "justice-governance-leadership",
  summary: "Puyi is a notable politician connected with China.",
  knownFor: ["Politician", "China"],
  featured: true,
};

describe("PersonCard", () => {
  it("does not render generated person-summary metadata", () => {
    const markup = renderToStaticMarkup(<PersonCard person={person} />);

    expect(markup).not.toContain("is a notable politician");
    expect(markup).not.toContain("connected with China");
  });
});
