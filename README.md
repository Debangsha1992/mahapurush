# Mahapurush

MindSpark: Think Like the Greats is a responsive web app inspired by Mahapurusher Mohakotha. It helps curious people across life stages discover great thinkers through short, interactive, gamified lessons that inform, educate, and provoke independent thought.

The app is designed for modern learners who want practical ways to think about technology, work, relationships, civic life, and purpose. It should not feel like a textbook or a quote collection. The core product promise is:

> Learn how great minds questioned the world, then learn to question it yourself.

## Product Direction

MindSpark combines:

- Duolingo-style learning loops.
- Short lesson consumption inspired by modern feeds.
- Debate-club-style dilemmas.
- Private journaling.
- Game-based progress through XP, badges, streaks, and thinking skills.

The goal is not only to teach who Socrates, Buddha, Ambedkar, Tagore, Einstein, Curie, Mandela, or Simone de Beauvoir were. The goal is to help users ask:

> How would this person think about my world today?

## MVP Scope

The MVP is intentionally simple:

- English-only responsive web app.
- Deployed on Vercel.
- No login, signup, or authentication.
- No database required.
- Progress and journal entries stored locally in the browser.
- 20 thinkers.
- 5 lessons per thinker.
- Daily Spark habit loop.
- Thinker Library.
- Learning Paths.
- Mind Journal.
- XP, streaks, badges, and skill growth.
- Quote cards with context.

Post-MVP ideas such as AI coaching, social debate rooms, optional accounts, and multilingual content are documented but intentionally out of scope for the first release.

## Current Alpha Build

The app scaffold is live with:

- 5 thinkers: Socrates, Buddha, Ambedkar, Einstein, Tagore
- 1 lesson per thinker with full card flow
- Daily Spark, onboarding quiz, library, paths, journal, and progress pages
- Local browser storage for XP, streaks, badges, skills, and journal entries
- Content validation in CI and before production builds

## Thinker images

Gallery assets live under `public/assets/thinkers/{slug}/`:

- `desktop/` — landscape WebP (~65–130KB each) for tablet and desktop
- `mobile/` — 9:16 portrait WebP (~35–70KB each) for phones

The app automatically serves mobile images below 768px width. Regenerate native portrait art with OpenAI:

```bash
OPENAI_API_KEY=your_key pnpm run content:generate-images:mobile
```

Re-optimize after adding source PNGs:

```bash
pnpm run content:optimize-images -- --remove-png
```

## Local Development

```bash
pnpm install
pnpm run dev
```

Other commands:

```bash
pnpm run content:validate
pnpm run test
pnpm run typecheck
pnpm run build
```

Open [http://localhost:3000](http://localhost:3000) after starting the dev server.

## Documentation

Start here:

- [Product Requirements Document](docs/PRD.md): product vision, MVP requirements, acceptance criteria, success metrics, and roadmap.
- [Production Development Guidelines](docs/DEVELOPMENT.md): recommended stack, engineering standards, testing, CI/CD, and Vercel deployment guidance.
- [Content Guide](docs/CONTENT_GUIDE.md): lesson template, tone rules, quality gates, and editorial review checklist.
- [Architecture](docs/ARCHITECTURE.md): static-first architecture, local progress model, route map, content shape, and extension points.

## Recommended Stack

The app uses:

- Next.js App Router
- TypeScript in strict mode
- Tailwind CSS with CSS variables
- Zod for content and progress validation
- Zustand plus localStorage for no-auth progress persistence
- Vitest for unit tests
- Vercel for hosting and preview deployments

No authentication is included in the MVP.

## Deployment Plan

The production app should be deployed on Vercel:

- Connect repository: `https://github.com/Debangsha1992/mahapurush`.
- Use the Next.js framework preset.
- Use Node 20 or later.
- Deploy previews for pull requests.
- Deploy production from `main`.
- Enable Vercel Analytics or another privacy-friendly analytics provider if needed.

No environment variables are expected for the MVP unless analytics tooling requires a public project identifier.

## Product North Star

MindSpark should not simply teach users about great thinkers.

It should help them practice thinking like great thinkers.
