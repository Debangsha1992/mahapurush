import fs from "node:fs";
import path from "node:path";

type FactRecord = {
  id: string;
  text: string;
  context: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceAccessedAt: string;
  sourceType?: string;
  claimStatus?: string;
  editorialStatus?: "draft" | "source-checked" | "facts-mode-approved";
  sourceExcerpt?: string;
  sourceNote?: string;
  currentAsOf?: string;
  storyAngle?: string;
  tags: string[];
  verified: boolean;
};

type PersonRecord = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  knownFor: string[];
  facts: FactRecord[];
};

const peopleDir = path.join(process.cwd(), "content", "people");
const bannedPhrases = [
  "pantheon ranks",
  "historical popularity index",
  "language biography editions",
  "language editions",
];
const weakAppealPhrases = [
  "famous",
  "greatest",
  "popular",
  "well-known",
];
const forbiddenUserCopyPhrases = [
  "profile",
  "facts mode",
  "people library",
  "recorded life dates",
  "connected with",
  "grouped with",
  "reserved for deeper source research",
  "background gives readers",
  "belongs in the people library",
];
const seedPath = path.join(
  process.cwd(),
  "content",
  "person-research",
  "curated-facts.seed.json",
);
const curatedSeed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as Array<{
  personSlug: string;
  text: string;
  context: string;
  sourceUrl: string;
  sourceExcerpt?: string;
  sourceNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}>;
const curatedApprovalKeys = new Set(
  curatedSeed
    .filter(
      (fact) =>
        fact.reviewedBy &&
        fact.reviewedAt &&
        (fact.sourceExcerpt || fact.sourceNote),
    )
    .map((fact) =>
      [fact.personSlug, fact.text, fact.context, fact.sourceUrl].join("\u0000"),
    ),
);

function sentenceCount(value: string): number {
  const normalized = value
    .replace(/\b(?:U\.S|U\.K|St|Dr|Mr|Mrs|Ms|Prof|Jr|Sr|c)\./gi, (match) =>
      match.replaceAll(".", ""),
    )
    .replace(/\b[A-Z]\./g, (match) => match.replace(".", ""));

  return normalized
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

function containsAny(value: string, phrases: string[]): string | undefined {
  const normalized = value.toLowerCase();
  return phrases.find((phrase) => normalized.includes(phrase));
}

function namesPerson(person: PersonRecord, value: string): boolean {
  return [person.name, person.shortName]
    .filter(Boolean)
    .some((name) => {
      if (name.length <= 2) {
        return new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
          value,
        );
      }
      return value.toLowerCase().includes(name.toLowerCase());
    });
}

function auditPerson(person: PersonRecord): string[] {
  const issues: string[] = [];

  for (const phrase of bannedPhrases) {
    if (
      containsAny(
        [person.summary, ...person.knownFor, ...person.facts.flatMap((fact) => [fact.text, fact.context])].join(" "),
        [phrase],
      )
    ) {
      issues.push(`${person.slug}: contains banned phrase "${phrase}"`);
    }
  }

  const angles = new Set<string>();
  for (const fact of person.facts) {
    const isApproved = fact.editorialStatus === "facts-mode-approved";
    if (!fact.verified) {
      issues.push(`${person.slug}/${fact.id}: Fact is not verified`);
    }
    if (!namesPerson(person, fact.text)) {
      issues.push(`${person.slug}/${fact.id}: Fact text does not name the person`);
    }
    if (!fact.sourceTitle || !fact.sourceUrl || !fact.sourceAccessedAt) {
      issues.push(`${person.slug}/${fact.id}: missing source metadata`);
    }
    if (!fact.sourceUrl?.startsWith("https://")) {
      issues.push(`${person.slug}/${fact.id}: source URL must be HTTPS`);
    }
    if (!fact.sourceType || !fact.claimStatus) {
      issues.push(`${person.slug}/${fact.id}: missing sourceType or claimStatus`);
    }
    if (fact.claimStatus === "current-as-of" && !fact.currentAsOf) {
      issues.push(`${person.slug}/${fact.id}: current claim missing currentAsOf`);
    }
    if (isApproved) {
      const curatedKey = [person.slug, fact.text, fact.context, fact.sourceUrl].join("\u0000");
      if (!curatedApprovalKeys.has(curatedKey)) {
        issues.push(`${person.slug}/${fact.id}: approved Fact is not in curated seed`);
      }
      if (fact.sourceTitle?.toLowerCase().startsWith("pantheon:")) {
        issues.push(`${person.slug}/${fact.id}: approved Fact cannot be Pantheon-only`);
      }
      if (!fact.sourceExcerpt && !fact.sourceNote) {
        issues.push(`${person.slug}/${fact.id}: approved Fact needs sourceExcerpt or sourceNote`);
      }
      const forbiddenPhrase = containsAny(
        [fact.text, fact.context, fact.sourceTitle].join(" "),
        forbiddenUserCopyPhrases,
      );
      if (forbiddenPhrase) {
        issues.push(
          `${person.slug}/${fact.id}: approved Fact contains forbidden phrase "${forbiddenPhrase}"`,
        );
      }
      if (sentenceCount(fact.text) > 2 || sentenceCount(fact.context) > 2) {
        issues.push(`${person.slug}/${fact.id}: Fact text/context is too long`);
      }
      const weakPhrase = containsAny(fact.text, weakAppealPhrases);
      if (weakPhrase) {
        issues.push(`${person.slug}/${fact.id}: weak appeal phrase "${weakPhrase}"`);
      }
    }
    if (isApproved && fact.storyAngle) {
      if (angles.has(fact.storyAngle)) {
        issues.push(`${person.slug}/${fact.id}: duplicate story angle "${fact.storyAngle}"`);
      }
      angles.add(fact.storyAngle);
    }
  }

  return issues;
}

const allPeople = fs
  .readdirSync(peopleDir)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => {
    const raw = fs.readFileSync(path.join(peopleDir, file), "utf8");
    return JSON.parse(raw) as PersonRecord;
  });
const issues = allPeople.flatMap(auditPerson);
const approvedFactsCount = allPeople.flatMap((person) =>
  person.facts.filter((fact) => fact.editorialStatus === "facts-mode-approved"),
).length;

if (approvedFactsCount === 0) {
  issues.push("Facts Mode needs at least one approved fact");
}

if (issues.length > 0) {
  console.error(`Person Fact audit found ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 200)) {
    console.error(`- ${issue}`);
  }
  if (issues.length > 200) {
    console.error(`...and ${issues.length - 200} more.`);
  }
  process.exit(1);
}

console.log("Person Fact audit passed.");
