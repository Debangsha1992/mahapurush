import fs from "fs";
import path from "path";
import {
  dailySparkSchema,
  lifeStorySchema,
  lessonSchema,
  notablePersonSchema,
  pathSchema,
  quoteCardSchema,
  thinkerSchema,
  weeklyChallengeSchema,
  type DailySpark,
  type FactWithPerson,
  type LearningPath,
  type Lesson,
  type LifeStory,
  type NotablePerson,
  type PeoplePageResult,
  type PersonSummary,
  type QuoteCard,
  type Thinker,
  type WeeklyChallenge,
} from "@/lib/content/schemas";
import {
  PERSON_DOMAIN_IDS,
  type PersonDomainId,
} from "@/lib/constants/person-domains";
import {
  PERSON_REGION_IDS,
  type PersonRegionId,
} from "@/lib/constants/person-regions";

const contentRoot = path.join(process.cwd(), "content");
const PEOPLE_PAGE_SIZE = 24;
const MAX_PEOPLE_PAGE_SIZE = 48;
const FACT_BATCH_SIZE = 20;
const MIN_PEOPLE_COUNT = 1000;
const MIN_FEATURED_PEOPLE_COUNT = 500;

let thinkersCache: Thinker[] | undefined;
let peopleCache: NotablePerson[] | undefined;

function readJsonFiles<T>(
  directory: string,
  schema: { parse: (data: unknown) => T },
): T[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(directory, file), "utf8");
      return schema.parse(JSON.parse(raw));
    });
}

export function getAllThinkers(): Thinker[] {
  if (thinkersCache) {
    return thinkersCache;
  }

  const thinkersDir = path.join(contentRoot, "thinkers");
  if (!fs.existsSync(thinkersDir)) {
    return [];
  }

  thinkersCache = fs
    .readdirSync(thinkersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const metaPath = path.join(thinkersDir, entry.name, "meta.json");
      const raw = fs.readFileSync(metaPath, "utf8");
      return thinkerSchema.parse(JSON.parse(raw));
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return thinkersCache;
}

export function getThinkerBySlug(slug: string): Thinker | undefined {
  return getAllThinkers().find((thinker) => thinker.slug === slug);
}

export function getAllPeople(): NotablePerson[] {
  if (peopleCache) {
    return peopleCache;
  }

  peopleCache = readJsonFiles(
    path.join(contentRoot, "people"),
    notablePersonSchema,
  ).sort((a, b) => a.name.localeCompare(b.name));

  return peopleCache;
}

export function getPersonBySlug(slug: string): NotablePerson | undefined {
  return getAllPeople().find((person) => person.slug === slug);
}

export function getAllFacts(): FactWithPerson[] {
  const thinkerSlugById = new Map(
    getAllThinkers().map((thinker) => [thinker.id, thinker.slug]),
  );

  return getAllPeople().flatMap((person) => {
    const { facts, ...personSummary } = person;
    return facts.map((fact) => ({
      ...fact,
      person: personSummary,
      thinkerSlug: person.thinkerId
        ? thinkerSlugById.get(person.thinkerId)
        : undefined,
    }));
  });
}

function toPersonSummary(person: NotablePerson): PersonSummary {
  return {
    id: person.id,
    slug: person.slug,
    name: person.name,
    shortName: person.shortName,
    era: person.era,
    region: person.region,
    regionId: person.regionId,
    primaryDomain: person.primaryDomain,
    summary: person.summary,
    knownFor: person.knownFor,
    featured: person.featured,
    featuredRank: person.featuredRank,
    portrait: person.portrait,
    imageAlt: person.imageAlt,
  };
}

export function getAllPersonSummaries(): PersonSummary[] {
  return getAllPeople().map(toPersonSummary);
}

export function getFeaturedPeople(limit?: number): PersonSummary[] {
  const featured = getAllPersonSummaries()
    .filter((person) => person.featured && person.featuredRank)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));

  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

function normalizePageNumber(value: number | undefined): number {
  if (!value || !Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function normalizePageSize(value: number | undefined): number {
  if (!value || !Number.isFinite(value) || value < 1) {
    return PEOPLE_PAGE_SIZE;
  }

  return Math.min(Math.floor(value), MAX_PEOPLE_PAGE_SIZE);
}

function matchesSearch(person: PersonSummary, query: string): boolean {
  const haystack = [
    person.name,
    person.shortName,
    person.era,
    person.region,
    person.summary,
    ...person.knownFor,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function getPeoplePage({
  query = "",
  primaryDomain,
  regionId,
  page,
  pageSize,
}: {
  query?: string;
  primaryDomain?: PersonDomainId;
  regionId?: PersonRegionId;
  page?: number;
  pageSize?: number;
} = {}): PeoplePageResult {
  const normalizedQuery = query.trim();
  const normalizedPage = normalizePageNumber(page);
  const normalizedPageSize = normalizePageSize(pageSize);
  const filtered = getAllPersonSummaries()
    .filter((person) =>
      primaryDomain ? person.primaryDomain === primaryDomain : true,
    )
    .filter((person) => (regionId ? person.regionId === regionId : true))
    .filter((person) =>
      normalizedQuery ? matchesSearch(person, normalizedQuery) : true,
    )
    .sort((a, b) => {
      if (a.featuredRank && b.featuredRank) {
        return a.featuredRank - b.featuredRank;
      }
      if (a.featuredRank) {
        return -1;
      }
      if (b.featuredRank) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize));
  const safePage = Math.min(normalizedPage, totalPages);
  const start = (safePage - 1) * normalizedPageSize;

  return {
    people: filtered.slice(start, start + normalizedPageSize),
    page: safePage,
    pageSize: normalizedPageSize,
    total,
    totalPages,
  };
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getFactBatch({
  seed = new Date().toISOString().slice(0, 10),
  limit = FACT_BATCH_SIZE,
  excludeIds = [],
}: {
  seed?: string;
  limit?: number;
  excludeIds?: string[];
} = {}): FactWithPerson[] {
  const batchSize = Math.min(Math.max(1, Math.floor(limit)), FACT_BATCH_SIZE);
  const excluded = new Set(excludeIds);
  const facts = getAllFacts().filter(
    (fact) => fact.verified && !excluded.has(fact.id),
  );

  return facts
    .map((fact) => ({
      fact,
      score: hashSeed(`${seed}:${fact.id}`),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, batchSize)
    .map((entry) => entry.fact);
}

export function getRandomFact(seed?: string): FactWithPerson {
  const fact = getFactBatch({ seed, limit: 1 })[0];
  if (!fact) {
    throw new Error("No verified facts configured");
  }

  return fact;
}

export function getFactForDate(date = new Date()): FactWithPerson {
  const facts = getAllFacts().filter((fact) => fact.verified);
  if (facts.length === 0) {
    throw new Error("No verified facts configured");
  }

  const dayIndex = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000,
  );

  return facts[dayIndex % facts.length];
}

export function getLessonsForThinker(thinkerId: string): Lesson[] {
  const lessonsDir = path.join(contentRoot, "thinkers", thinkerId, "lessons");
  if (!fs.existsSync(lessonsDir)) {
    return [];
  }

  return fs
    .readdirSync(lessonsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(lessonsDir, file), "utf8");
      return lessonSchema.parse(JSON.parse(raw));
    })
    .sort((a, b) => a.order - b.order);
}

export function getLifeStoryForThinker(thinkerId: string): LifeStory | undefined {
  const lifeStoryPath = path.join(
    contentRoot,
    "thinkers",
    thinkerId,
    "life-story.json",
  );

  if (!fs.existsSync(lifeStoryPath)) {
    return undefined;
  }

  const raw = fs.readFileSync(lifeStoryPath, "utf8");
  return lifeStorySchema.parse(JSON.parse(raw));
}

export function getLessonById(lessonId: string): Lesson | undefined {
  for (const thinker of getAllThinkers()) {
    const lesson = getLessonsForThinker(thinker.id).find(
      (item) => item.id === lessonId,
    );
    if (lesson) {
      return lesson;
    }
  }

  return undefined;
}

export function getAllPaths(): LearningPath[] {
  return readJsonFiles(path.join(contentRoot, "paths"), pathSchema).sort(
    (a, b) => a.title.localeCompare(b.title),
  );
}

export function getPathBySlug(slug: string): LearningPath | undefined {
  return getAllPaths().find((item) => item.slug === slug);
}

export function getAllDailySparks(): DailySpark[] {
  return readJsonFiles(
    path.join(contentRoot, "daily-sparks"),
    dailySparkSchema,
  );
}

export function getDailySparkForDate(date = new Date()): DailySpark {
  const sparks = getAllDailySparks();
  if (sparks.length === 0) {
    throw new Error("No daily sparks configured");
  }

  const dayIndex = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000,
  );

  return sparks[dayIndex % sparks.length];
}

export function getAllQuoteCards(): QuoteCard[] {
  return readJsonFiles(
    path.join(contentRoot, "quote-cards"),
    quoteCardSchema,
  );
}

export function getQuoteCardById(id: string): QuoteCard | undefined {
  return getAllQuoteCards().find((quote) => quote.id === id);
}

export function getAllWeeklyChallenges(): WeeklyChallenge[] {
  return readJsonFiles(
    path.join(contentRoot, "weekly-challenges"),
    weeklyChallengeSchema,
  );
}

function ensureUnique(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function ensureDateLike(value: string, label: string): void {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} is not a valid date: ${value}`);
  }
}

export function validateAllContent(): void {
  const thinkers = getAllThinkers();
  const thinkerIds = new Set(thinkers.map((thinker) => thinker.id));

  for (const thinker of thinkers) {
    getLessonsForThinker(thinker.id);
    const lifeStory = getLifeStoryForThinker(thinker.id);
    if (!lifeStory) {
      throw new Error(`Thinker ${thinker.id} is missing life-story.json`);
    }
    if (lifeStory.thinkerId !== thinker.id) {
      throw new Error(
        `Life story for ${thinker.id} references ${lifeStory.thinkerId}`,
      );
    }
  }

  for (const learningPath of getAllPaths()) {
    for (const thinkerId of learningPath.thinkerIds) {
      if (!thinkerIds.has(thinkerId)) {
        throw new Error(
          `Path ${learningPath.id} references unknown thinker ${thinkerId}`,
        );
      }
    }
  }

  for (const spark of getAllDailySparks()) {
    if (!thinkerIds.has(spark.thinkerId)) {
      throw new Error(`Daily spark ${spark.id} references unknown thinker`);
    }
    if (!getLessonById(spark.lessonId)) {
      throw new Error(`Daily spark ${spark.id} references unknown lesson`);
    }
  }

  for (const quote of getAllQuoteCards()) {
    if (!thinkerIds.has(quote.thinkerId)) {
      throw new Error(`Quote ${quote.id} references unknown thinker`);
    }
  }

  const people = getAllPeople();
  if (people.length < MIN_PEOPLE_COUNT) {
    throw new Error(
      `People Library needs at least ${MIN_PEOPLE_COUNT} people; found ${people.length}`,
    );
  }

  ensureUnique(
    people.map((person) => person.id),
    "person id",
  );
  ensureUnique(
    people.map((person) => person.slug),
    "person slug",
  );
  ensureUnique(
    people.map((person) => person.name.toLowerCase()),
    "person name",
  );

  const domainIds = new Set<string>(PERSON_DOMAIN_IDS);
  const regionIds = new Set<string>(PERSON_REGION_IDS);
  const featuredPeople = people.filter((person) => person.featured);
  if (featuredPeople.length < MIN_FEATURED_PEOPLE_COUNT) {
    throw new Error(
      `People Library needs at least ${MIN_FEATURED_PEOPLE_COUNT} featured people; found ${featuredPeople.length}`,
    );
  }
  ensureUnique(
    featuredPeople.map((person) => String(person.featuredRank)),
    "featured rank",
  );

  const factIds = new Set<string>();
  for (const person of people) {
    if (person.reviewStatus !== "published") {
      throw new Error(`Person ${person.id} is not published`);
    }
    if (!domainIds.has(person.primaryDomain)) {
      throw new Error(`Person ${person.id} has unknown domain ${person.primaryDomain}`);
    }
    if (!regionIds.has(person.regionId)) {
      throw new Error(`Person ${person.id} has unknown region ${person.regionId}`);
    }
    if (person.featured && !person.featuredRank) {
      throw new Error(`Featured person ${person.id} is missing featuredRank`);
    }
    if (!person.featured && person.featuredRank) {
      throw new Error(`Unfeatured person ${person.id} has featuredRank`);
    }
    if (!person.facts.some((fact) => fact.verified)) {
      throw new Error(`Person ${person.id} needs at least one verified fact`);
    }
    for (const source of person.sourceRefs) {
      ensureDateLike(source.accessedAt, `Person ${person.id} source accessedAt`);
    }

    if (person.thinkerId && !thinkerIds.has(person.thinkerId)) {
      throw new Error(
        `Person ${person.id} references unknown thinker ${person.thinkerId}`,
      );
    }

    for (const fact of person.facts) {
      if (factIds.has(fact.id)) {
        throw new Error(`Duplicate fact id: ${fact.id}`);
      }
      factIds.add(fact.id);

      if (fact.verified) {
        if (!fact.sourceTitle || !fact.sourceUrl || !fact.sourceAccessedAt) {
          throw new Error(`Verified fact ${fact.id} is missing source metadata`);
        }
      }

      ensureDateLike(fact.sourceAccessedAt, `Fact ${fact.id} sourceAccessedAt`);
      if (fact.sourceDate) {
        ensureDateLike(fact.sourceDate, `Fact ${fact.id} sourceDate`);
      }
      if (fact.currentAsOf) {
        ensureDateLike(fact.currentAsOf, `Fact ${fact.id} currentAsOf`);
      }

      const changingClaimTags = new Set(["current", "first"]);
      if (
        fact.tags.some((tag) => changingClaimTags.has(tag)) &&
        !fact.currentAsOf
      ) {
        throw new Error(`Fact ${fact.id} needs currentAsOf for changing claims`);
      }
    }
  }
}
