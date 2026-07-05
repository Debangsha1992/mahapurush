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
  type QuoteCard,
  type Thinker,
  type WeeklyChallenge,
} from "@/lib/content/schemas";

const contentRoot = path.join(process.cwd(), "content");

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
  const thinkersDir = path.join(contentRoot, "thinkers");
  if (!fs.existsSync(thinkersDir)) {
    return [];
  }

  return fs
    .readdirSync(thinkersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const metaPath = path.join(thinkersDir, entry.name, "meta.json");
      const raw = fs.readFileSync(metaPath, "utf8");
      return thinkerSchema.parse(JSON.parse(raw));
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getThinkerBySlug(slug: string): Thinker | undefined {
  return getAllThinkers().find((thinker) => thinker.slug === slug);
}

export function getAllPeople(): NotablePerson[] {
  return readJsonFiles(
    path.join(contentRoot, "people"),
    notablePersonSchema,
  ).sort((a, b) => a.name.localeCompare(b.name));
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

  const factIds = new Set<string>();
  for (const person of people) {
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
