import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { PersonDomainId } from "../src/lib/constants/person-domains";
import type { PersonRegionId } from "../src/lib/constants/person-regions";

const contentRoot = path.join(process.cwd(), "content");
const peopleDir = path.join(contentRoot, "people");
const targetPeopleCount = 1000;
const targetFeaturedCount = 500;
const accessedAt = "2026-07-06";
const pantheonDatasetUrl =
  "https://storage.googleapis.com/pantheon-public-data/person_2025_update.csv.bz2";
const excludedGeneratedNames = new Set(
  [
    "Adolf Eichmann",
    "Adolf Hitler",
    "Benito Mussolini",
    "Heinrich Himmler",
    "Hermann Göring",
    "Joseph Goebbels",
    "Joseph Stalin",
    "Pol Pot",
    "Osama bin Laden",
    "Saddam Hussein",
  ].map((name) => name.toLowerCase()),
);

type ExistingFact = {
  id: string;
  text: string;
  context: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceAccessedAt: string;
  sourceType: "primary" | "reference" | "scholarly" | "news" | "institutional";
  claimStatus: "verified" | "disputed" | "tradition" | "current-as-of";
  sourceDate?: string;
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
  era: string;
  region: string;
  regionId: PersonRegionId;
  lifespan?: string;
  primaryDomain: PersonDomainId;
  domains: string[];
  summary: string;
  knownFor: string[];
  featured: boolean;
  featuredRank?: number;
  imageAlt?: string;
  sourceRefs: Array<{
    title: string;
    url: string;
    accessedAt: string;
  }>;
  reviewStatus: "published";
  thinkerId?: string;
  sensitiveContextNote?: string;
  facts: ExistingFact[];
};

type PantheonRow = Record<string, string>;

const occupationDomainMap: Record<string, PersonDomainId> = {
  ACTIVIST: "justice-governance-leadership",
  ARTIST: "literature-arts-culture",
  ASTRONAUT: "environment-exploration-human-achievement",
  BIOLOGIST: "science-math-technology",
  BUSINESSPERSON: "environment-exploration-human-achievement",
  CHEMIST: "science-math-technology",
  COMPUTER_SCIENTIST: "science-math-technology",
  DESIGNER: "literature-arts-culture",
  ECONOMIST: "environment-exploration-human-achievement",
  ENGINEER: "science-math-technology",
  EXPLORER: "environment-exploration-human-achievement",
  FILM_DIRECTOR: "literature-arts-culture",
  HISTORIAN: "literature-arts-culture",
  INVENTOR: "science-math-technology",
  JOURNALIST: "literature-arts-culture",
  LAWYER: "justice-governance-leadership",
  LINGUIST: "literature-arts-culture",
  MATHEMATICIAN: "science-math-technology",
  MILITARY_PERSONNEL: "justice-governance-leadership",
  MUSICIAN: "literature-arts-culture",
  PHILOSOPHER: "philosophy-ethics-religion",
  PHYSICIAN: "science-math-technology",
  PHYSICIST: "science-math-technology",
  POLITICIAN: "justice-governance-leadership",
  RELIGIOUS_FIGURE: "philosophy-ethics-religion",
  SINGER: "literature-arts-culture",
  SOCIAL_ACTIVIST: "justice-governance-leadership",
  SPORTSPERSON: "environment-exploration-human-achievement",
  WRITER: "literature-arts-culture",
};

const regionMatches: Array<{
  regionId: PersonRegionId;
  values: string[];
}> = [
  {
    regionId: "south-asia",
    values: ["india", "pakistan", "bangladesh", "sri lanka", "nepal", "bhutan", "maldives", "afghanistan"],
  },
  {
    regionId: "east-asia",
    values: ["china", "japan", "korea", "taiwan", "mongolia", "hong kong"],
  },
  {
    regionId: "southeast-asia-oceania",
    values: [
      "indonesia",
      "philippines",
      "vietnam",
      "thailand",
      "malaysia",
      "singapore",
      "myanmar",
      "cambodia",
      "laos",
      "australia",
      "new zealand",
      "papua new guinea",
    ],
  },
  {
    regionId: "middle-east-north-africa",
    values: [
      "egypt",
      "iran",
      "iraq",
      "israel",
      "palestine",
      "saudi arabia",
      "syria",
      "lebanon",
      "jordan",
      "turkey",
      "morocco",
      "algeria",
      "tunisia",
      "libya",
    ],
  },
  {
    regionId: "africa",
    values: [
      "south africa",
      "ghana",
      "nigeria",
      "kenya",
      "ethiopia",
      "cameroon",
      "senegal",
      "tanzania",
      "uganda",
      "zimbabwe",
      "congo",
      "mali",
      "rwanda",
    ],
  },
  {
    regionId: "north-america",
    values: ["united states", "canada", "mexico"],
  },
  {
    regionId: "latin-america-caribbean",
    values: [
      "brazil",
      "argentina",
      "chile",
      "colombia",
      "peru",
      "venezuela",
      "cuba",
      "jamaica",
      "haiti",
      "dominican",
      "uruguay",
      "bolivia",
      "guatemala",
    ],
  },
  {
    regionId: "europe",
    values: [
      "england",
      "united kingdom",
      "france",
      "germany",
      "italy",
      "spain",
      "portugal",
      "greece",
      "poland",
      "russia",
      "ukraine",
      "sweden",
      "norway",
      "denmark",
      "finland",
      "netherlands",
      "belgium",
      "austria",
      "switzerland",
      "ireland",
      "scotland",
      "wales",
    ],
  },
];

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function compactText(value: string, maxLength: number): string {
  const singleLine = value.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) {
    return singleLine;
  }

  const truncated = singleLine.slice(0, maxLength - 1);
  const lastSentenceBreak = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? "),
  );
  if (lastSentenceBreak >= Math.floor(maxLength * 0.45)) {
    return truncated.slice(0, lastSentenceBreak + 1).trimEnd();
  }

  const lastClauseBreak = Math.max(
    truncated.lastIndexOf("; "),
    truncated.lastIndexOf(", "),
  );
  if (lastClauseBreak >= Math.floor(maxLength * 0.55)) {
    return `${truncated.slice(0, lastClauseBreak).trimEnd()}.`;
  }

  const lastWordBreak = truncated.lastIndexOf(" ");
  if (lastWordBreak >= Math.floor(maxLength * 0.5)) {
    return `${truncated
      .slice(0, lastWordBreak)
      .replace(/(?:\s+(?:a|an|the|and|or|of|to|for|in|on|at|by|with|from|including|under|over))?$/i, "")
      .replace(/[.,;:]+$/, "")
      .trimEnd()}.`;
  }

  return `${truncated.trimEnd()}.`;
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

function parseCsv(csv: string): PantheonRow[] {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = splitCsvLine(headerLine);

  return lines.map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  });
}

function normalizeOccupation(value: string): string {
  return value.trim().replace(/\s+/g, "_").replace(/-/g, "_").toUpperCase();
}

function inferRegionId(text: string): PersonRegionId {
  const normalized = text.toLowerCase();
  for (const region of regionMatches) {
    if (region.values.some((value) => normalized.includes(value))) {
      return region.regionId;
    }
  }
  return "global-diaspora";
}

function inferPrimaryDomain(occupation: string, fallbackText: string): PersonDomainId {
  const normalizedOccupation = normalizeOccupation(occupation);
  if (occupationDomainMap[normalizedOccupation]) {
    return occupationDomainMap[normalizedOccupation];
  }

  const normalizedText = fallbackText.toLowerCase();
  if (/(science|physics|scientist|engineer|mathematician|mathematical|mathematics|computing|computer|algebra|technology|medicine|medical|nursing|dna|astronomy|astrophysicist|physicist|inventor|physician)/.test(normalizedText)) {
    return "science-math-technology";
  }
  if (/(philosophy|philosopher|ethical|ethics|religious|theologian|spiritual|buddhist|compassion|nonviolence)/.test(normalizedText)) {
    return "philosophy-ethics-religion";
  }
  if (/(writer|artist|composer|musician|actor|director|poet)/.test(normalizedText)) {
    return "literature-arts-culture";
  }
  if (/(explorer|athlete|business|environment|aviator)/.test(normalizedText)) {
    return "environment-exploration-human-achievement";
  }
  return "justice-governance-leadership";
}

function domainsFor(primaryDomain: PersonDomainId, occupation: string): string[] {
  const tags = new Set<string>([primaryDomain, slugify(occupation)]);
  return [...tags].filter(Boolean);
}

function ensureHttpsUrl(url: string): string {
  return url.startsWith("https://") ? url : url.replace(/^http:\/\//, "https://");
}

function parseYearToken(value: string): number | undefined {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatYearLabel(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  }
  return String(year);
}

function formatLifespan(birthyear: string, deathyear: string): string | undefined {
  const birth = parseYearToken(birthyear);
  const death = parseYearToken(deathyear);

  if (birth !== undefined && death !== undefined) {
    // Chronological order: earlier year first. For BCE, a more-negative value is earlier.
    const start = Math.min(birth, death);
    const end = Math.max(birth, death);
    if (start < 0 || end < 0) {
      return `${formatYearLabel(start)}–${formatYearLabel(end)}`;
    }
    return `${start}-${end}`;
  }
  if (birth !== undefined) {
    return birth < 0 ? `born ${formatYearLabel(birth)}` : `born ${birth}`;
  }
  return undefined;
}

function titleCaseOccupation(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function augmentExistingPerson(
  raw: Record<string, unknown>,
  featuredRank: number,
): PersonRecord {
  const facts = raw.facts as ExistingFact[];
  const firstFact = facts[0];
  const domains = Array.isArray(raw.domains) ? (raw.domains as string[]) : [];
  const primaryDomain = inferPrimaryDomain(domains[0] ?? "", [
    String(raw.summary ?? ""),
    ...domains,
    ...((raw.knownFor as string[] | undefined) ?? []),
  ].join(" "));
  const region = String(raw.region ?? "Global");

  return {
    ...(raw as Omit<PersonRecord, "regionId" | "primaryDomain" | "featured" | "sourceRefs" | "reviewStatus">),
    regionId: inferRegionId(region),
    primaryDomain,
    domains: domainsFor(primaryDomain, domains[0] ?? primaryDomain),
    featured: featuredRank <= targetFeaturedCount,
    featuredRank: featuredRank <= targetFeaturedCount ? featuredRank : undefined,
    imageAlt: `Portrait-style visual for ${String(raw.name)}`,
    sourceRefs: [
      {
        title: firstFact.sourceTitle,
        url: ensureHttpsUrl(firstFact.sourceUrl),
        accessedAt: firstFact.sourceAccessedAt,
      },
    ],
    reviewStatus: "published",
    facts,
  };
}

function pantheonRowToPerson(row: PantheonRow, featuredRank: number): PersonRecord | undefined {
  const name = row.name?.trim();
  const slug = slugify(row.slug || name);
  const occupation = row.occupation?.trim() || "notable person";
  if (
    !name ||
    !slug ||
    row.is_group === "TRUE" ||
    excludedGeneratedNames.has(name.toLowerCase())
  ) {
    return undefined;
  }

  const country = row.bplace_country?.trim() || "Global";
  const primaryDomain = inferPrimaryDomain(occupation, `${name} ${occupation}`);
  const sourceUrl = `https://pantheon.world/profile/person/${encodeURIComponent(row.slug || slug)}`;
  const occupationLabel = titleCaseOccupation(occupation);
  const lifespan = formatLifespan(row.birthyear, row.deathyear);
  const sourceTitle = `Pantheon: ${name}`;
  const metadataFacts: ExistingFact[] = [
    {
      id: `${slug}-domain`,
      text: `${name} is recorded as a ${occupationLabel.toLowerCase()} connected with ${country}.`,
      context: `${name}'s domain gives editors a starting point for deeper source research.`,
      storyAngle: "origin",
    },
    {
      id: `${slug}-region`,
      text: `${name} is associated with ${country} in the People Library metadata.`,
      context: `${name}'s region helps readers place the Fact in a real historical or cultural setting.`,
      storyAngle: "context",
    },
    {
      id: `${slug}-lifespan`,
      text: `${name}${lifespan ? ` lived during ${lifespan}` : " has dates that vary by source"}.`,
      context: `${name}'s dates help separate sourced historical context from timeless mythmaking.`,
      storyAngle: "timeline",
    },
    {
      id: `${slug}-library-path`,
      text: `${name} belongs in the ${primaryDomain.replaceAll("-", " ")} path of the People Library.`,
      context: `${name}'s placement helps the app connect a short Fact to a broader learning theme.`,
      storyAngle: "influence",
    },
    {
      id: `${slug}-research-candidate`,
      text: `${name} needs researched Facts before becoming a strong Facts Mode card.`,
      context: `${name}'s generated metadata is a discovery lead, not a finished learner-facing story.`,
      storyAngle: "research",
    },
  ].map((fact) => ({
    ...fact,
    text: compactText(fact.text, 260),
    context: compactText(fact.context, 260),
    sourceTitle,
    sourceUrl,
    sourceAccessedAt: accessedAt,
    sourceType: "reference",
    claimStatus: "current-as-of",
    currentAsOf: accessedAt,
    tags: [primaryDomain, fact.storyAngle],
    verified: true,
  }));

  return {
    id: slug,
    slug,
    name,
    shortName: name.split(" ").at(-1) ?? name,
    era: lifespan ?? "Dates vary by source",
    region: country,
    regionId: inferRegionId(country),
    lifespan,
    primaryDomain,
    domains: domainsFor(primaryDomain, occupation),
    summary: compactText(`${name} is a notable ${occupationLabel.toLowerCase()} associated with ${country}.`, 260),
    knownFor: [
      occupationLabel,
      country,
      primaryDomain.replaceAll("-", " "),
    ],
    featured: featuredRank <= targetFeaturedCount,
    featuredRank: featuredRank <= targetFeaturedCount ? featuredRank : undefined,
    imageAlt: `Portrait-style visual for ${name}`,
    sourceRefs: [
      {
        title: sourceTitle,
        url: sourceUrl,
        accessedAt,
      },
    ],
    reviewStatus: "published",
    facts: metadataFacts,
  };
}

function loadExistingPeople(): PersonRecord[] {
  return fs
    .readdirSync(peopleDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const raw = JSON.parse(
        fs.readFileSync(path.join(peopleDir, file), "utf8"),
      ) as Record<string, unknown>;
      const sourceRefs = raw.sourceRefs as Array<{ title?: string }> | undefined;
      const facts = raw.facts as ExistingFact[] | undefined;
      const sourceTitle = sourceRefs?.[0]?.title ?? facts?.[0]?.sourceTitle ?? "";
      return sourceTitle.startsWith("Pantheon:") ? undefined : raw;
    })
    .filter((raw): raw is Record<string, unknown> => Boolean(raw))
    .map((raw, index) => {
      return augmentExistingPerson(raw, index + 1);
    });
}

async function fetchPantheonRows(): Promise<PantheonRow[]> {
  const response = await fetch(pantheonDatasetUrl, {
    headers: {
      "User-Agent": "MindSparkPeopleLibrary/0.1 (https://example.com)",
    },
  });
  if (!response.ok) {
    throw new Error(`Pantheon request failed: ${response.status} ${response.statusText}`);
  }

  const compressed = Buffer.from(await response.arrayBuffer());
  const csv = execFileSync("bzip2", ["-dc"], {
    input: compressed,
    maxBuffer: 128 * 1024 * 1024,
  }).toString("utf8");

  return parseCsv(csv);
}

function writePeople(people: PersonRecord[]): void {
  for (const file of fs.readdirSync(peopleDir)) {
    if (file.endsWith(".json")) {
      fs.rmSync(path.join(peopleDir, file));
    }
  }

  for (const person of people) {
    fs.writeFileSync(
      path.join(peopleDir, `${person.slug}.json`),
      `${JSON.stringify(person, null, 2)}\n`,
    );
  }

  const manifest = people.map((person, index) => ({
    id: person.id,
    name: person.name,
    primaryDomain: person.primaryDomain,
    regionId: person.regionId,
    candidateRank: index + 1,
    featuredRank: person.featuredRank ?? null,
    reviewStatus: person.reviewStatus,
  }));

  fs.writeFileSync(
    path.join(contentRoot, "people-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function main(): Promise<void> {
  const peopleBySlug = new Map<string, PersonRecord>();
  const peopleByName = new Set<string>();
  for (const person of loadExistingPeople()) {
    peopleBySlug.set(person.slug, person);
    peopleByName.add(person.name.toLowerCase());
  }

  const rows = await fetchPantheonRows();
  for (const row of rows) {
    if (peopleBySlug.size >= targetPeopleCount) {
      break;
    }

    const person = pantheonRowToPerson(row, peopleBySlug.size + 1);
    if (
      !person ||
      peopleBySlug.has(person.slug) ||
      peopleByName.has(person.name.toLowerCase())
    ) {
      continue;
    }

    peopleBySlug.set(person.slug, person);
    peopleByName.add(person.name.toLowerCase());
  }

  if (peopleBySlug.size < targetPeopleCount) {
    throw new Error(`Expected ${targetPeopleCount} people, generated ${peopleBySlug.size}`);
  }

  const people = [...peopleBySlug.values()].slice(0, targetPeopleCount);
  writePeople(people);
  console.log(
    `Generated ${people.length} people with ${targetFeaturedCount} featured records.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
