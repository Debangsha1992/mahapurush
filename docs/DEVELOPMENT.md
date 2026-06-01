# Production Development Guidelines

## 1. Engineering Principles

MindSpark is a content-led learning product. Technology should support the learning loop without distracting from it.

Core principles:

- Build the smallest reliable version of each feature.
- Do not add login, signup, authentication, or cloud sync in the MVP.
- Treat content as product data with validation, review, and tests.
- Keep user reflections private and local to the browser.
- Prefer static content, fast pages, and simple client state.
- Design the codebase so auth, sync, AI, and localization can be added later without rewriting the core app.

## 2. Recommended Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Framework | Next.js 15 App Router | Strong Vercel support, static generation, flexible routing |
| Language | TypeScript in strict mode | Safer content schemas and refactors |
| Styling | Tailwind CSS plus CSS variables | Fast UI development and design tokens |
| UI primitives | Radix UI or shadcn/ui | Accessible dialogs, tabs, controls, and cards |
| Content | JSON and optional MDX in repository | Git-reviewed, versioned content for MVP |
| Validation | Zod | Runtime validation for content and local progress |
| Client state | Zustand or React context | Lightweight progress and UI state |
| Persistence | localStorage | No account or database required |
| Testing | Vitest and Playwright | Unit tests plus browser flow tests |
| Analytics | Vercel Analytics or Plausible | Privacy-friendly product metrics |
| Deployment | Vercel | Fast preview and production deployment |
| CI | GitHub Actions | Lint, typecheck, tests, content validation |

No database is required for the MVP.

Optional later:

- Vercel KV or Supabase for authenticated sync.
- Supabase or Clerk for optional accounts.
- AI provider API for Socratic Coach.
- next-intl for multilingual content.

## 3. Repository Structure

Use this structure when the app is scaffolded:

```text
mahapurush/
├── docs/
│   ├── PRD.md
│   ├── DEVELOPMENT.md
│   ├── CONTENT_GUIDE.md
│   └── ARCHITECTURE.md
├── content/
│   ├── thinkers/
│   │   └── socrates/
│   │       ├── meta.json
│   │       └── lessons/
│   │           └── 01-questions-are-dangerous.json
│   ├── paths/
│   ├── daily-sparks/
│   ├── quote-cards/
│   └── weekly-challenges/
├── public/
│   └── assets/
│       └── thinkers/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── lesson/
│   │   ├── journal/
│   │   ├── progress/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── content/
│   │   ├── gamification/
│   │   ├── progress/
│   │   └── analytics/
│   └── types/
├── tests/
│   ├── e2e/
│   └── fixtures/
└── vercel.json
```

## 4. Application Routes

| Route | Purpose | Rendering |
| --- | --- | --- |
| `/` | Home and Daily Spark | Static shell plus client progress |
| `/onboarding` | Quiz and path recommendation | Client component |
| `/explore` | Thinker library | Static |
| `/thinkers/[slug]` | Thinker profile | Static generation |
| `/thinkers/[slug]/lessons/[lessonId]` | Interactive lesson flow | Static content plus client state |
| `/paths` | Learning paths index | Static |
| `/paths/[slug]` | Path detail | Static generation |
| `/journal` | Private journal | Client only |
| `/you` | Skills, badges, streaks | Client only |
| `/quotes/[id]` | Shareable quote card | Static generation |

Static content routes should use `generateStaticParams` where practical. Interactive progress should remain client-side.

## 5. Content Data Model

Use Zod schemas for every content type. Content validation should run in CI and before production builds.

### Thinker Meta

```ts
export const thinkerSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string(),
  era: z.string(),
  region: z.string(),
  portrait: z.string(),
  hook: z.string(),
  categories: z.array(categorySchema).min(1),
  skills: z.array(skillSchema).min(1),
  summary: z.string(),
});
```

### Lesson

```ts
export const lessonSchema = z.object({
  id: z.string(),
  thinkerId: z.string(),
  order: z.number().int().positive(),
  title: z.string(),
  estimatedMinutes: z.number().int().positive(),
  layers: z.object({
    quick: lessonLayerSchema,
    full: lessonLayerSchema,
    deep: lessonLayerSchema.optional(),
  }),
});
```

### Lesson Layer

```ts
export const lessonLayerSchema = z.object({
  hook: z.string(),
  story: z.string(),
  bigIdea: z.object({
    title: z.string(),
    explanation: z.string(),
  }),
  thinkingTool: z.object({
    name: z.string(),
    instruction: z.string(),
  }),
  modernTest: z.object({
    scenario: z.string(),
    question: z.string(),
    options: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        explanation: z.string(),
      }),
    ).min(2),
    discussionNotes: z.string(),
  }),
  reflectionPrompt: z.string(),
  thoughtTension: z.object({
    counterView: z.string(),
    responsePrompt: z.string(),
  }),
  rewards: z.object({
    xp: z.number().int().nonnegative(),
    badge: z.string().optional(),
    skills: z.array(
      z.object({
        id: skillSchema,
        points: z.number().int().positive(),
      }),
    ),
  }),
});
```

### Local User Progress

```ts
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
  badges: z.array(z.string()),
  journalEntries: z.array(journalEntrySchema),
  savedQuotes: z.array(z.string()),
});
```

Version the progress schema from day one. If the shape changes, add a migration rather than clearing user data.

## 6. Local Persistence

Storage key:

```text
mindspark_progress_v1
```

Rules:

- Store only non-sensitive app progress and user journal entries.
- Do not send journal content to a backend in the MVP.
- Validate localStorage data with Zod before using it.
- If validation fails, keep a recoverable backup key before resetting.
- Save progress after each lesson step.
- Debounce writes when the user is typing in journal fields.
- Provide export for journal entries.
- Explain clearly that progress is saved only on the current browser and device.

Progress copy:

> Your progress and journal are saved only on this device. You can export your journal anytime.

## 7. Gamification Engine

Gamification logic should be pure and deterministic. Keep it outside React components.

Recommended functions:

```ts
export function calculateLessonXp(input: {
  baseXp: number;
  reflectionSubmitted: boolean;
  thoughtTensionSubmitted: boolean;
}): number;

export function updateSkillLevels(
  current: SkillLevels,
  lessonRewards: LessonSkillReward[],
): SkillLevels;

export function updateStreak(
  streak: StreakState,
  activityDate: LocalDateString,
): StreakState;

export function checkEarnedBadges(progress: Progress): Badge[];
```

Rules:

- Reward completion and reflection effort.
- Do not score users by moral agreement.
- Avoid public ranking.
- Keep streak calculation based on the user's local calendar day.
- Unit test date boundaries and missed days.

## 8. Component Guidelines

### Lesson Components

Recommended components:

- `LessonShell`
- `LessonProgressDots`
- `LessonCard`
- `HookCard`
- `StoryCard`
- `BigIdeaCard`
- `ThinkingToolCard`
- `ModernTestCard`
- `ReflectionCard`
- `ThoughtTensionCard`
- `RewardCard`

Guidelines:

- The card stack should support tap/click navigation and keyboard navigation.
- Mobile swipe can be added, but buttons must remain available.
- Each card should focus on one mental action.
- Keep layout stable to avoid distracting shifts.

### Journal Components

Recommended components:

- `JournalList`
- `JournalEntryCard`
- `JournalFilters`
- `JournalExportButton`
- `ThinkingTimeline`

Journal output must render plain text safely. Do not render user-entered Markdown or HTML unless sanitized.

### Progress Components

Recommended components:

- `SkillMap`
- `SkillMeter`
- `BadgeGrid`
- `StreakSummary`
- `XpSummary`

Skill growth should feel meaningful and calm, not like a casino reward.

## 9. Styling and Design Tokens

Use CSS variables for product tokens.

Example tokens:

```css
:root {
  --color-bg: #101014;
  --color-surface: #181820;
  --color-surface-raised: #222230;
  --color-text: #f4efe7;
  --color-muted: #a7a094;
  --color-accent: #d99a2b;
  --color-accent-soft: #f3d69a;
  --color-danger: #ef6461;
  --radius-card: 1.25rem;
  --shadow-card: 0 18px 60px rgba(0, 0, 0, 0.28);
}
```

Accessibility rules:

- Maintain WCAG 2.1 AA contrast.
- Provide visible focus rings.
- Respect `prefers-reduced-motion`.
- Do not rely on color alone to communicate progress.
- Use readable font sizes on 375px mobile screens.

## 10. Analytics

MVP analytics should measure product behavior without collecting personal content.

Allowed events:

- `onboarding_completed`
- `daily_spark_started`
- `lesson_started`
- `lesson_completed`
- `reflection_submitted`
- `journal_exported`
- `badge_earned`
- `path_started`
- `path_completed`

Do not send:

- Journal response text.
- Free-form reflection text.
- Personal identifiers.
- School or class identifiers.

## 11. Testing Strategy

### Unit Tests

Required for:

- Zod schemas.
- Content loaders.
- Progress migrations.
- Gamification functions.
- Streak logic.
- Journal export formatting.

### Content Validation

Create a script:

```text
pnpm content:validate
```

The script should fail if:

- Any required content field is missing.
- A lesson is missing one of the 8 card blocks.
- A lesson does not map to an existing thinker.
- A reward references an unknown skill or badge.
- A path references an unknown thinker.
- A quote card lacks context or a modern question.

### End-to-End Tests

Use Playwright for:

1. First visit -> onboarding -> path recommendation -> Home.
2. Home -> Daily Spark -> complete lesson -> reward.
3. Reflection -> journal entry appears.
4. Complete lesson -> XP and skill update.
5. Refresh -> progress persists.

## 12. CI/CD

GitHub Actions should run on every pull request:

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm content:validate
pnpm build
```

Vercel should create preview deployments for pull requests and production deployments from `main`.

No environment variables are required for MVP unless analytics tooling needs a public project ID.

## 13. Deployment Guidelines

Vercel setup:

- Connect repository: `https://github.com/Debangsha1992/mahapurush`.
- Framework preset: Next.js.
- Node version: 20 or later.
- Production branch: `main`.
- Enable preview deployments.
- Enable Vercel Analytics if selected.

Pre-launch checklist:

- Lighthouse check on mobile and desktop.
- Home, lesson, journal, library, and quote routes reviewed.
- No auth or login UI appears.
- localStorage progress survives refresh.
- Journal export works.
- Content validation passes.
- Sensitive lessons have editorial review.

## 14. Security and Privacy

Even without accounts, privacy matters because students may write personal reflections.

Rules:

- Never log reflection text.
- Never send journal entries to analytics.
- Do not render raw user HTML.
- Avoid third-party scripts unless essential.
- Keep dependencies current.
- Add a Content Security Policy when the app is scaffolded.
- Do not store secrets in the repo or client bundle.

Recommended privacy copy:

> MindSpark does not require an account. Your journal is saved in your browser on this device. If you clear browser data or switch devices, it may not be available unless you export it.

## 15. Codex and AI-Assisted Development Workflow

Use Codex or Cursor feature by feature. Do not ask AI to generate the full app in one pass.

Recommended sequence:

1. Define content schemas and sample content.
2. Build content loader and validation script.
3. Build static routes for Home, Explore, Thinker Profile, and Paths.
4. Build the lesson card flow.
5. Add local progress persistence.
6. Add journal capture and export.
7. Add gamification engine.
8. Add quote cards and weekly challenges.
9. Add tests and deployment hardening.

Every AI implementation prompt should include:

- The relevant PRD section.
- Acceptance criteria.
- Exact file paths.
- Existing code conventions.
- "Do not add authentication."
- "Do not send journal content to a server."

## 16. Definition of Done

For each feature:

- Types are strict and exported where needed.
- Content is validated with Zod.
- Tests cover core behavior.
- UI works at 375px and 1280px widths.
- Keyboard navigation is usable.
- No lint or type errors.
- No auth, account, or database dependency is introduced.
- Feature has preview deployment screenshot or recording.

## 17. Future Extension Points

Design now, build later:

- `ProgressStore` interface so localStorage can be replaced with an API-backed store.
- `deep` lesson layer reserved but optional.
- Locale-independent content IDs for future Bengali and Hindi versions.
- `CoachProvider` abstraction for future AI Socratic Coach.
- `AnalyticsProvider` abstraction to swap analytics tools.
- Journal export/import to support future optional account migration.

Do not implement these future features until the MVP learning loop is working and tested.
