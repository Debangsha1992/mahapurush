import { z } from "zod";
import { CATEGORIES } from "@/lib/constants/categories";
import { SKILLS } from "@/lib/constants/skills";
import { BADGES } from "@/lib/constants/badges";
import { PERSON_DOMAIN_IDS } from "@/lib/constants/person-domains";
import { PERSON_REGION_IDS } from "@/lib/constants/person-regions";

export const categorySchema = z.enum(CATEGORIES);
export const skillSchema = z.enum(SKILLS);
export const badgeSchema = z.enum(BADGES);
export const personDomainSchema = z.enum(PERSON_DOMAIN_IDS);
export const personRegionSchema = z.enum(PERSON_REGION_IDS);
export const personReviewStatusSchema = z.enum([
  "candidate",
  "drafted",
  "source-verified",
  "featured-approved",
  "published",
]);

const httpsUrlSchema = z
  .string()
  .url()
  .refine((url) => {
    try {
      return new URL(url).protocol === "https:";
    } catch {
      return false;
    }
  }, {
    message: "URL must use HTTPS",
  });

export const lessonLayerSchema = z.object({
  hook: z.string().min(1),
  story: z.string().min(1),
  bigIdea: z.object({
    title: z.string().min(1),
    explanation: z.string().min(1),
  }),
  thinkingTool: z.object({
    name: z.string().min(1),
    instruction: z.string().min(1),
  }),
  modernTest: z.object({
    scenario: z.string().min(1),
    question: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          explanation: z.string().min(1),
        }),
      )
      .min(2),
    discussionNotes: z.string().min(1),
  }),
  reflectionPrompt: z.string().min(1),
  thoughtTension: z.object({
    counterView: z.string().min(1),
    responsePrompt: z.string().min(1),
  }),
  rewards: z.object({
    xp: z.number().int().nonnegative(),
    badge: badgeSchema.optional(),
    skills: z
      .array(
        z.object({
          id: skillSchema,
          points: z.number().int().positive(),
        }),
      )
      .min(1),
  }),
});

export const lessonSchema = z.object({
  id: z.string().min(1),
  thinkerId: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  layers: z.object({
    quick: lessonLayerSchema,
    full: lessonLayerSchema,
    deep: lessonLayerSchema.optional(),
  }),
});

export const lifeStoryPageSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1200),
});

export const lifeStorySchema = z.object({
  thinkerId: z.string().min(1),
  pages: z.array(lifeStoryPageSchema).length(8),
});

export const thinkerSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  era: z.string().min(1),
  region: z.string().min(1),
  portrait: z.string().min(1),
  hook: z.string().min(1),
  categories: z.array(categorySchema).min(1),
  skills: z.array(skillSchema).min(1),
  summary: z.string().min(1),
});

export const factSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(20).max(280),
  context: z.string().min(40).max(600),
  sourceTitle: z.string().min(1),
  sourceUrl: httpsUrlSchema,
  sourceAccessedAt: z.string().min(1),
  sourceDate: z.string().min(1).optional(),
  currentAsOf: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).min(1),
  verified: z.boolean(),
});

export const sourceRefSchema = z.object({
  title: z.string().min(1),
  url: httpsUrlSchema,
  accessedAt: z.string().min(1),
});

export const notablePersonSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  era: z.string().min(1),
  region: z.string().min(1),
  regionId: personRegionSchema,
  lifespan: z.string().min(1).optional(),
  primaryDomain: personDomainSchema,
  domains: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
  knownFor: z.array(z.string().min(1)).min(1),
  featured: z.boolean(),
  featuredRank: z.number().int().positive().optional(),
  portrait: z.string().min(1).optional(),
  imageAlt: z.string().min(1).optional(),
  sourceRefs: z.array(sourceRefSchema).min(1),
  reviewStatus: personReviewStatusSchema,
  thinkerId: z.string().min(1).optional(),
  sensitiveContextNote: z.string().min(1).optional(),
  facts: z.array(factSchema).min(1),
});

export const pathSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  thinkerIds: z.array(z.string()).min(2),
});

export const dailySparkSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  thinkerId: z.string().min(1),
  lessonId: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
});

export const quoteCardSchema = z.object({
  id: z.string().min(1),
  thinkerId: z.string().min(1),
  quote: z.string().min(1),
  meaning: z.string().min(1),
  context: z.string().min(1),
  todayQuestion: z.string().min(1),
});

export const weeklyChallengeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  instructions: z.string().min(1),
  xp: z.number().int().positive(),
  badge: badgeSchema.optional(),
});

export const journalEntrySchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  thinkerId: z.string().min(1),
  lessonId: z.string().min(1),
  prompt: z.string().min(1),
  response: z.string().min(1),
  skillIds: z.array(skillSchema),
});

export const progressSchema = z.object({
  version: z.literal(1),
  onboardingComplete: z.boolean(),
  selectedPathId: z.string().nullable(),
  xp: z.number().int().nonnegative(),
  streak: z.object({
    current: z.number().int().nonnegative(),
    longest: z.number().int().nonnegative(),
    lastActiveDate: z.string().nullable(),
  }),
  completedLessons: z.array(z.string()),
  lessonSteps: z.record(z.string(), z.number().int().nonnegative()),
  skillLevels: z.record(skillSchema, z.number().int().nonnegative()),
  badges: z.array(badgeSchema),
  journalEntries: z.array(journalEntrySchema),
  savedQuotes: z.array(z.string()),
  completedWeeklyChallenges: z.array(z.string()),
});

export type LifeStoryPage = z.infer<typeof lifeStoryPageSchema>;
export type LifeStory = z.infer<typeof lifeStorySchema>;
export type Thinker = z.infer<typeof thinkerSchema>;
export type Fact = z.infer<typeof factSchema>;
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type NotablePerson = z.infer<typeof notablePersonSchema>;
export type FactWithPerson = Fact & {
  person: Omit<NotablePerson, "facts">;
  thinkerSlug?: string;
};
export type PersonSummary = Pick<
  NotablePerson,
  | "id"
  | "slug"
  | "name"
  | "shortName"
  | "era"
  | "region"
  | "regionId"
  | "primaryDomain"
  | "summary"
  | "knownFor"
  | "featured"
  | "featuredRank"
  | "portrait"
  | "imageAlt"
>;
export type PeoplePageResult = {
  people: PersonSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const LIFE_STORY_PAGE_COUNT = 8;
export type Lesson = z.infer<typeof lessonSchema>;
export type LessonLayer = z.infer<typeof lessonLayerSchema>;
export type LearningPath = z.infer<typeof pathSchema>;
export type DailySpark = z.infer<typeof dailySparkSchema>;
export type QuoteCard = z.infer<typeof quoteCardSchema>;
export type WeeklyChallenge = z.infer<typeof weeklyChallengeSchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type Progress = z.infer<typeof progressSchema>;

export type LessonStepId =
  | "hook"
  | "story"
  | "bigIdea"
  | "thinkingTool"
  | "modernTest"
  | "reflection"
  | "thoughtTension"
  | "reward";

export const LESSON_STEPS: LessonStepId[] = [
  "hook",
  "story",
  "bigIdea",
  "thinkingTool",
  "modernTest",
  "reflection",
  "thoughtTension",
  "reward",
];

export const LESSON_STEP_LABELS: Record<LessonStepId, string> = {
  hook: "Hook",
  story: "Story",
  bigIdea: "Big Idea",
  thinkingTool: "Thinking Tool",
  modernTest: "Modern Test",
  reflection: "Reflection",
  thoughtTension: "Thought Tension",
  reward: "Reward",
};
