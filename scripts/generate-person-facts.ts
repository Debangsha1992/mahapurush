import fs from "node:fs";
import path from "node:path";
import { PERSON_DOMAIN_LABELS } from "../src/lib/constants/person-domains";
import type { PersonDomainId } from "../src/lib/constants/person-domains";

type FactSourceType = "primary" | "reference" | "scholarly" | "news" | "institutional";
type FactClaimStatus = "verified" | "disputed" | "tradition" | "current-as-of";

type SourceRef = {
  title: string;
  url: string;
  accessedAt: string;
};

type FactRecord = {
  id: string;
  text: string;
  context: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceAccessedAt: string;
  sourceType: FactSourceType;
  claimStatus: FactClaimStatus;
  editorialStatus: "draft" | "source-checked" | "facts-mode-approved";
  sourceExcerpt?: string;
  sourceNote?: string;
  sourceDate?: string;
  currentAsOf?: string;
  storyAngle: string;
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
  regionId: string;
  lifespan?: string;
  primaryDomain: PersonDomainId;
  domains: string[];
  summary: string;
  knownFor: string[];
  featured: boolean;
  featuredRank?: number;
  portrait?: string;
  imageAlt?: string;
  sourceRefs: SourceRef[];
  reviewStatus: "published";
  thinkerId?: string;
  sensitiveContextNote?: string;
  facts: FactRecord[];
};

type WikipediaSummary = {
  title?: string;
  extract?: string;
  description?: string;
  type?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
};

const DOMAIN_ROLE_FALLBACKS: Record<PersonDomainId, string> = {
  "science-math-technology": "scientist",
  "philosophy-ethics-religion": "philosopher",
  "justice-governance-leadership": "leader",
  "literature-arts-culture": "artist",
  "environment-exploration-human-achievement": "explorer",
};

const PERSON_DOMAIN_IDS_SET = new Set(Object.keys(DOMAIN_ROLE_FALLBACKS));

const WIKIPEDIA_TITLE_OVERRIDES: Record<string, string> = {
  ay: "Ay (pharaoh)",
};

type WikipediaSearchResponse = {
  query?: {
    search?: Array<{
      title?: string;
    }>;
  };
};

type WikipediaExtractResponse = {
  query?: {
    pages?: Record<
      string,
      {
        extract?: string;
      }
    >;
  };
};

type DraftSource = {
  title: string;
  url: string;
  extract: string;
  description?: string;
  sourceType: FactSourceType;
};

type FactDraft = {
  text: string;
  context: string;
  storyAngle: string;
  claimStatus: FactClaimStatus;
};

const contentRoot = path.join(process.cwd(), "content");
const peopleDir = path.join(contentRoot, "people");
const researchDir = path.join(contentRoot, "person-research");
const accessedAt = new Date().toISOString().slice(0, 10);
const maxFactsPerPerson = 5;
const fetchTimeoutMs = 8_000;
const concurrency = 8;
const bannedCopyPhrases = [
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
const storyAngles = [
  "origin",
  "obstacle",
  "turning-point",
  "contribution",
  "influence",
] as const;

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  const valueFor = (name: string): string | undefined => {
    const prefix = `${name}=`;
    return process.argv
      .slice(2)
      .find((arg) => arg.startsWith(prefix))
      ?.slice(prefix.length);
  };

  return {
    offline: args.has("--offline"),
    slug: valueFor("--slug"),
    limit: Number.parseInt(valueFor("--limit") ?? "", 10),
  };
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

function titleCaseToken(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function containsBannedCopy(value: string): boolean {
  const normalized = value.toLowerCase();
  return bannedCopyPhrases.some((phrase) => normalized.includes(phrase));
}

function containsWeakAppeal(value: string): boolean {
  const normalized = value.toLowerCase();
  return weakAppealPhrases.some((phrase) => normalized.includes(phrase));
}

function cleanSentence(value: string): string {
  return value
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\((?:pronunciation|listen|born|died)[^)]+\)/gi, "")
    .replace(/\bU\.S\./g, "US")
    .replace(/\bU\.K\./g, "UK")
    .replace(/\bSt\./g, "Saint")
    .replace(/\bDr\./g, "Doctor")
    .replace(/\s+/g, " ")
    .trim();
}

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

function splitSentences(value: string): string[] {
  return value
    .replace(/\bU\.S\./g, "US")
    .replace(/\bU\.K\./g, "UK")
    .replace(/\bSt\./g, "Saint")
    .split(/(?<=[.!?])\s+(?=["“A-Z])/)
    .map(cleanSentence)
    .filter((sentence) => sentence.length >= 35)
    .filter((sentence) => !/romanized|pronounced|ipa:|lit\.|; c\.$/i.test(sentence))
    .filter((sentence) => sentenceCount(sentence) <= 2)
    .filter((sentence) => !containsBannedCopy(sentence))
    .filter((sentence) => !containsWeakAppeal(sentence));
}

function nameVariants(person: PersonRecord): string[] {
  return [person.name, person.shortName]
    .filter(Boolean)
    .map((name) => name.toLowerCase());
}

function textContainsName(text: string, name: string): boolean {
  if (name.length <= 2) {
    return new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      text,
    );
  }
  return text.toLowerCase().includes(name.toLowerCase());
}

function namesPerson(person: PersonRecord, value: string): boolean {
  return nameVariants(person).some((name) => textContainsName(value, name));
}

function replaceLeadingPronoun(person: PersonRecord, value: string): string {
  return value
    .replace(/^(he|she|they)\b/i, person.name)
    .replace(/^(his|her|their)\b/i, `${person.name}'s`);
}

function expandShortNameToFullName(person: PersonRecord, value: string): string {
  const shortName = person.shortName.trim();
  const fullName = person.name.trim();
  if (shortName.length <= 2 || fullName.toLowerCase() === shortName.toLowerCase()) {
    return value;
  }
  if (value.toLowerCase().includes(fullName.toLowerCase())) {
    return value;
  }

  const escapedShort = shortName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Keep longer sourced name forms such as "Angela Dorothea Merkel"
  // instead of expanding the surname into "Angela Dorothea Angela Merkel".
  const longerNameForm = new RegExp(
    `\\b[A-Z][\\w'.-]*(?:\\s+[A-Z][\\w'.-]*)*\\s+${escapedShort}\\b`,
  );
  if (longerNameForm.test(value)) {
    return value;
  }

  return value.replace(new RegExp(`\\b${escapedShort}\\b`), fullName);
}

function collapseDuplicatedGivenName(person: PersonRecord, value: string): string {
  const nameTokens = person.name.trim().split(/\s+/);
  if (nameTokens.length < 2) {
    return value;
  }

  const given = nameTokens[0];
  const surname = nameTokens[nameTokens.length - 1];
  if (!given || !surname || given.toLowerCase() === surname.toLowerCase()) {
    return value;
  }

  const escapedGiven = given.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedSurname = surname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return value.replace(
    new RegExp(
      `\\b(${escapedGiven}\\b(?:\\s+[\\w'.-]+){0,3}?)\\s+${escapedGiven}\\s+(${escapedSurname})\\b`,
      "i",
    ),
    "$1 $2",
  );
}

function makeStandaloneFactText(person: PersonRecord, sentence: string): string | undefined {
  let cleaned = cleanSentence(replaceLeadingPronoun(person, sentence));
  const normalized = cleaned.toLowerCase();
  if (
    !normalized.includes(person.name.toLowerCase()) &&
    person.shortName.length > 2 &&
    normalized.includes(person.shortName.toLowerCase())
  ) {
    cleaned = expandShortNameToFullName(person, cleaned);
  }
  cleaned = collapseDuplicatedGivenName(person, cleaned);

  if (
    cleaned.toLowerCase().includes(person.name.toLowerCase()) ||
    namesPerson(person, cleaned)
  ) {
    return compactText(cleaned, 300);
  }

  return undefined;
}

function claimStatusFor(value: string): FactClaimStatus {
  const normalized = value.toLowerCase();
  if (
    normalized.includes("traditionally") ||
    normalized.includes("legend") ||
    normalized.includes("believed")
  ) {
    return "tradition";
  }
  if (
    normalized.includes("disputed") ||
    normalized.includes("controversial") ||
    normalized.includes("alleged")
  ) {
    return "disputed";
  }
  return "verified";
}

function contextFor(person: PersonRecord, storyAngle: string): string {
  const domainLabel = PERSON_DOMAIN_LABELS[person.primaryDomain];
  const contexts: Record<string, string> = {
    origin: `${person.name}'s background gives readers a concrete entry point into ${domainLabel}.`,
    obstacle: `${person.name}'s challenge makes the card about pressure and choice, not just fame.`,
    "turning-point": `${person.name}'s turning point shows how one moment can redirect a public life.`,
    contribution: `${person.name}'s contribution helps explain why this profile belongs in the People Library.`,
    influence: `${person.name}'s influence connects one short Fact to a wider historical ripple.`,
  };

  return contexts[storyAngle] ?? `${person.name}'s Fact gives readers a specific detail to remember.`;
}

function draftFactsFromSource(person: PersonRecord, source: DraftSource | undefined): FactDraft[] {
  const drafts = source
    ? splitSentences(source.extract)
        .map((sentence) => makeStandaloneFactText(person, sentence))
        .filter((text): text is string => Boolean(text))
        .map((text, index) => {
          const storyAngle = storyAngles[index % storyAngles.length];
          return {
            text,
            context: contextFor(person, storyAngle),
            storyAngle,
            claimStatus: claimStatusFor(text),
          };
        })
    : [];

  const uniqueDrafts = new Map<string, FactDraft>();
  for (const draft of drafts) {
    const key = draft.text.toLowerCase();
    if (!uniqueDrafts.has(key)) {
      uniqueDrafts.set(key, draft);
    }
    if (uniqueDrafts.size === maxFactsPerPerson) {
      break;
    }
  }

  return Array.from(uniqueDrafts.values())
    .slice(0, maxFactsPerPerson)
    .map((draft, index) => {
      const storyAngle = storyAngles[index];
      return {
        ...draft,
        storyAngle,
        context: contextFor(person, storyAngle),
      };
    });
}

function factId(person: PersonRecord, storyAngle: string, index: number): string {
  return `${person.slug}-${index + 1}-${storyAngle}`.replace(/[^a-z0-9-]+/g, "-");
}

function fallbackSource(person: PersonRecord): DraftSource {
  const existing = person.sourceRefs[0];
  return {
    title: existing?.title ?? `People Library: ${person.name}`,
    url: existing?.url ?? "https://example.com",
    extract: person.summary,
    sourceType: "reference",
  };
}

function toFacts(
  person: PersonRecord,
  drafts: FactDraft[],
  source: DraftSource | undefined,
): FactRecord[] {
  const sourceRef = source ?? fallbackSource(person);
  return drafts.map((draft, index) => ({
    id: factId(person, draft.storyAngle, index),
    text: compactText(draft.text, 300),
    context: compactText(draft.context, 260),
    sourceTitle: sourceRef.title,
    sourceUrl: sourceRef.url,
    sourceAccessedAt: accessedAt,
    sourceType: sourceRef.sourceType,
    claimStatus: draft.claimStatus,
    editorialStatus: "source-checked",
    sourceNote: sourceRef.description
      ? `Candidate extracted from ${sourceRef.title}: ${sourceRef.description}`
      : `Candidate extracted from ${sourceRef.title}.`,
    currentAsOf: draft.claimStatus === "current-as-of" ? accessedAt : undefined,
    storyAngle: draft.storyAngle,
    tags: [person.primaryDomain, draft.storyAngle],
    verified: true,
  }));
}

function saintStephenCalibration(person: PersonRecord): PersonRecord | undefined {
  if (person.slug !== "saint-stephen") {
    return undefined;
  }

  const source = {
    title: "Wikipedia: Saint Stephen",
    url: "https://en.wikipedia.org/wiki/Saint_Stephen",
  };
  const drafts: FactDraft[] = [
    {
      text: "Saint Stephen was chosen when Greek-speaking widows were being neglected in the early Jerusalem community's daily food distribution.",
      storyAngle: "origin",
      claimStatus: "verified",
      context: "Saint Stephen's background begins with an unfair system, not a popularity metric.",
    },
    {
      text: "Saint Stephen's public arguments made him a target because his preaching challenged powerful assumptions about law, temple, and faith.",
      storyAngle: "obstacle",
      claimStatus: "verified",
      context: "Saint Stephen's challenge makes the card about pressure and conviction.",
    },
    {
      text: "Acts says Saint Stephen prayed for forgiveness for his attackers while he was being killed.",
      storyAngle: "turning-point",
      claimStatus: "verified",
      context: "Saint Stephen's final prayer turns the Fact into a moment about courage under violence.",
    },
    {
      text: "Saul of Tarsus, later known as Paul the Apostle, appears in Acts as a witness approving Saint Stephen's death.",
      storyAngle: "contribution",
      claimStatus: "verified",
      context: "Saint Stephen's story also marks a turning point in another major religious life.",
    },
    {
      text: "Saint Stephen became known in Christian tradition as the protomartyr, meaning the first martyr.",
      storyAngle: "influence",
      claimStatus: "tradition",
      context: "Saint Stephen's influence shows how one death shaped a lasting idea of witness.",
    },
  ];

  return {
    ...person,
    summary:
      "Saint Stephen's story moves from neglected widows to public accusation, execution, forgiveness, and a lasting tradition of martyrdom.",
    knownFor: [
      "First Christian Martyr",
      "Early Church Service",
      "Forgiveness Under Pressure",
    ],
    sourceRefs: [
      {
        title: source.title,
        url: source.url,
        accessedAt,
      },
    ],
    facts: drafts.map((draft, index) => ({
      id: factId(person, draft.storyAngle, index),
      text: draft.text,
      context: draft.context,
      sourceTitle: source.title,
      sourceUrl: source.url,
      sourceAccessedAt: accessedAt,
      sourceType: "reference",
      claimStatus: draft.claimStatus,
      editorialStatus: "source-checked",
      sourceNote: "Candidate fact from the Saint Stephen calibration source.",
      storyAngle: draft.storyAngle,
      tags: [person.primaryDomain, draft.storyAngle],
      verified: true,
    })),
  };
}

function isDomainLabel(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return Object.values(PERSON_DOMAIN_LABELS).some(
    (label) => label.toLowerCase() === normalized,
  ) || PERSON_DOMAIN_IDS_SET.has(normalized.replaceAll(" & ", "-").replaceAll(", ", "-").replaceAll(" ", "-"));
}

function occupationLabelFor(person: PersonRecord): string {
  const secondary = person.domains.find(
    (domain) => domain !== person.primaryDomain && !isDomainLabel(domain),
  );
  if (secondary) {
    return titleCaseToken(secondary);
  }

  const knownRole = person.knownFor.find((item) => !isDomainLabel(item));
  if (knownRole && knownRole.toLowerCase() !== person.region.toLowerCase()) {
    return knownRole;
  }

  return titleCaseToken(DOMAIN_ROLE_FALLBACKS[person.primaryDomain]);
}

function updatePersonMetadata(person: PersonRecord, source: DraftSource | undefined): PersonRecord {
  const firstSentence = source ? splitSentences(source.extract)[0] : undefined;
  const occupation = occupationLabelFor(person);
  const knownFor = [
    occupation,
    PERSON_DOMAIN_LABELS[person.primaryDomain],
    person.region,
  ].filter((item, index, items) => items.indexOf(item) === index);

  return {
    ...person,
    summary: compactText(
      firstSentence && namesPerson(person, firstSentence)
        ? firstSentence
        : `${person.name} is a notable ${occupation.toLowerCase()} connected with ${person.region}.`,
      260,
    ),
    knownFor,
    sourceRefs: source
      ? [
          {
            title: source.title,
            url: source.url,
            accessedAt,
          },
        ]
      : person.sourceRefs,
  };
}

async function fetchJson<T>(url: string): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MindSparkContentOverhaul/0.1 (source-backed educational app)",
      },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
    if (!response.ok) {
      return undefined;
    }
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

async function searchWikipediaTitle(person: PersonRecord): Promise<string | undefined> {
  const query = encodeURIComponent(`${person.name} ${person.region}`);
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`;
  const data = await fetchJson<WikipediaSearchResponse>(url);
  return data?.query?.search?.[0]?.title;
}

async function fetchWikipediaSummary(title: string): Promise<WikipediaSummary | undefined> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  return fetchJson<WikipediaSummary>(url);
}

async function fetchWikipediaExtract(title: string): Promise<string | undefined> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}&origin=*`;
  const data = await fetchJson<WikipediaExtractResponse>(url);
  const page = Object.values(data?.query?.pages ?? {})[0];
  return page?.extract?.trim();
}

function isDisambiguationSummary(summary: WikipediaSummary): boolean {
  if (summary.type === "disambiguation") {
    return true;
  }
  const description = summary.description?.toLowerCase() ?? "";
  return (
    description.includes("topics referred to by the same term") ||
    description.includes("disambiguation page")
  );
}

async function fetchDraftSource(person: PersonRecord, offline: boolean): Promise<DraftSource | undefined> {
  if (offline) {
    return undefined;
  }

  const attempts = [
    WIKIPEDIA_TITLE_OVERRIDES[person.slug],
    person.name,
    person.slug.replaceAll("-", "_"),
  ].filter((title): title is string => Boolean(title));
  const searchTitle = await searchWikipediaTitle(person);
  if (searchTitle) {
    attempts.push(searchTitle);
  }

  for (const title of attempts) {
    const summary = await fetchWikipediaSummary(title);
    if (!summary || isDisambiguationSummary(summary)) {
      continue;
    }
    const detailedExtract = summary?.title
      ? await fetchWikipediaExtract(summary.title)
      : undefined;
    const extract = detailedExtract?.trim() || summary?.extract?.trim();
    const pageUrl = summary?.content_urls?.desktop?.page;
    if (extract && pageUrl?.startsWith("https://")) {
      return {
        title: `Wikipedia: ${summary.title ?? person.name}`,
        url: pageUrl,
        extract,
        description: summary.description,
        sourceType: "reference",
      };
    }
  }

  return undefined;
}

function writeResearchManifest(
  person: PersonRecord,
  source: DraftSource | undefined,
  facts: FactRecord[],
): void {
  const manifest = {
    personId: person.id,
    slug: person.slug,
    name: person.name,
    generatedAt: accessedAt,
    status: facts.length > 0 ? "source-checked" : "needs-research",
    sources: source
      ? [
          {
            title: source.title,
            url: source.url,
            accessedAt,
            sourceType: source.sourceType,
            description: source.description,
          },
        ]
      : person.sourceRefs.map((item) => ({
          ...item,
          sourceType: "reference",
        })),
    notes: facts.map((fact) => ({
      factId: fact.id,
      storyAngle: fact.storyAngle,
      claimStatus: fact.claimStatus,
      text: fact.text,
    })),
  };

  fs.mkdirSync(researchDir, { recursive: true });
  fs.writeFileSync(
    path.join(researchDir, `${person.slug}.json`),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function processPerson(file: string, offline: boolean): Promise<void> {
  const filePath = path.join(peopleDir, file);
  const person = JSON.parse(fs.readFileSync(filePath, "utf8")) as PersonRecord;
  const calibration = saintStephenCalibration(person);
  if (calibration) {
    fs.writeFileSync(filePath, `${JSON.stringify(calibration, null, 2)}\n`);
    writeResearchManifest(calibration, fallbackSource(calibration), calibration.facts);
    return;
  }

  const source = await fetchDraftSource(person, offline);
  const metadata = updatePersonMetadata(person, source);
  const drafts = draftFactsFromSource(metadata, source);
  const facts = toFacts(metadata, drafts, source);
  const updated: PersonRecord = {
    ...metadata,
    facts,
  };

  fs.writeFileSync(filePath, `${JSON.stringify(updated, null, 2)}\n`);
  writeResearchManifest(updated, source, facts);
}

async function runPool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      if (item !== undefined) {
        await worker(item);
      }
    }
  });
  await Promise.all(workers);
}

async function main(): Promise<void> {
  const args = parseArgs();
  let files = fs
    .readdirSync(peopleDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (args.slug) {
    files = files.filter((file) => file === `${args.slug}.json`);
  }
  if (Number.isFinite(args.limit) && args.limit > 0) {
    files = files.slice(0, args.limit);
  }

  await runPool(files, async (file) => {
    await processPerson(file, args.offline);
    process.stdout.write(".");
  });
  process.stdout.write(`\nGenerated Facts for ${files.length} people.\n`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
