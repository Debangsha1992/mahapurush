import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  factClaimStatusSchema,
  factSourceTypeSchema,
} from "../src/lib/content/schemas";

const seedFactSchema = z.object({
  personSlug: z.string().min(1),
  text: z.string().min(1),
  context: z.string().min(1),
  sourceTitle: z.string().min(1),
  sourceUrl: z.string().url().startsWith("https://"),
  sourceExcerpt: z.string().min(1).optional(),
  sourceNote: z.string().min(1).optional(),
  sourceType: factSourceTypeSchema.default("reference"),
  claimStatus: factClaimStatusSchema,
  editorialStatus: z.literal("facts-mode-approved"),
  reviewedBy: z.string().min(1),
  reviewedAt: z.string().min(1),
});

const seedSchema = z.array(seedFactSchema).refine(
  (facts) => facts.every((fact) => fact.sourceExcerpt || fact.sourceNote),
  "Each curated fact needs sourceExcerpt or sourceNote",
);

type SeedFact = z.infer<typeof seedFactSchema>;
type PersonJsonFact = {
  id?: string;
  [key: string]: unknown;
};
type PersonJson = {
  primaryDomain: string;
  facts?: PersonJsonFact[];
  sourceRefs?: Array<{
    title?: string;
    url?: string;
    accessedAt?: string;
  }>;
};

const root = process.cwd();
const peopleDirectory = path.join(root, "content", "people");
const seedPath = path.join(root, "content", "person-research", "curated-facts.seed.json");

function factIdFor(personSlug: string, index: number): string {
  return `${personSlug}-approved-${String(index + 1).padStart(2, "0")}`;
}

function factsByPersonSlug(seedFacts: SeedFact[]): Map<string, SeedFact[]> {
  const grouped = new Map<string, SeedFact[]>();
  for (const fact of seedFacts) {
    const facts = grouped.get(fact.personSlug) ?? [];
    facts.push(fact);
    grouped.set(fact.personSlug, facts);
  }
  return grouped;
}

async function main(): Promise<void> {
  const seedFacts = seedSchema.parse(JSON.parse(await readFile(seedPath, "utf8")));
  const groupedFacts = factsByPersonSlug(seedFacts);
  const missingPeople: string[] = [];

  for (const [personSlug, curatedFacts] of groupedFacts) {
    const personPath = path.join(peopleDirectory, `${personSlug}.json`);
    let rawPerson: string;
    try {
      rawPerson = await readFile(personPath, "utf8");
    } catch {
      missingPeople.push(personSlug);
      continue;
    }

    const person = JSON.parse(rawPerson) as PersonJson;
    const existingFacts = Array.isArray(person.facts) ? person.facts : [];
    const draftExistingFacts = existingFacts
      .filter((fact) => {
        const id = typeof fact.id === "string" ? fact.id : "";
        return !id.startsWith(`${personSlug}-approved-`);
      })
      .map((fact) => ({
        ...fact,
        editorialStatus: "draft",
      }));

    const approvedFacts = curatedFacts.map((fact, index) => ({
      id: factIdFor(personSlug, index),
      text: fact.text,
      context: fact.context,
      sourceTitle: fact.sourceTitle,
      sourceUrl: fact.sourceUrl,
      sourceAccessedAt: fact.reviewedAt,
      sourceType: fact.sourceType,
      claimStatus: fact.claimStatus,
      editorialStatus: fact.editorialStatus,
      sourceExcerpt: fact.sourceExcerpt,
      sourceNote: fact.sourceNote,
      tags: [person.primaryDomain],
      verified: true,
    }));

    person.facts = [...approvedFacts, ...draftExistingFacts];
    person.sourceRefs = Array.isArray(person.sourceRefs) ? person.sourceRefs : [];
    for (const fact of curatedFacts) {
      const alreadyReferenced = person.sourceRefs.some(
        (source: { url?: string }) => source.url === fact.sourceUrl,
      );
      if (!alreadyReferenced) {
        person.sourceRefs.push({
          title: fact.sourceTitle,
          url: fact.sourceUrl,
          accessedAt: fact.reviewedAt,
        });
      }
    }

    await mkdir(path.dirname(personPath), { recursive: true });
    await writeFile(personPath, `${JSON.stringify(person, null, 2)}\n`);
  }

  if (missingPeople.length > 0) {
    throw new Error(`Missing curated people: ${missingPeople.join(", ")}`);
  }

  console.log(`Applied ${seedFacts.length} approved facts from curated seed.`);
}

void main();
