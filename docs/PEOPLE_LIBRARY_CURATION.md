# People Library Curation

The People Library is a static, reviewed content set of 1000 NotablePerson records. It uses the existing hand-reviewed `content/people` records as seed content, then fills the library from the Pantheon 2025 person dataset, which ranks globally documented biographies by language coverage and Historical Popularity Index.

## Workflow

Run `pnpm run content:generate-people-library` to rebuild:

- `content/people/*.json`
- `content/people-manifest.json`

The generator preserves curated non-Pantheon seed records, de-duplicates by slug and normalized name, then writes exactly 1000 published people. The first 500 records receive `featured: true` and a unique `featuredRank`.

## Review States

The current launch set is generated as `reviewStatus: "published"` because every record has at least one source-backed Fact and profile source. Future editorial review can move candidates through these states before publication:

- `candidate`
- `drafted`
- `source-verified`
- `featured-approved`
- `published`

## Source Standard

Every published person must have:

- A stable `id` and `slug`.
- A controlled `primaryDomain` and `regionId`.
- A summary and known-for list.
- At least one verified Fact.
- At least one source reference.

Pantheon-derived records use Pantheon as the source-backed starting point. They are suitable for scalable discovery, but sensitive, religious, political, and conflict-related profiles should receive human editorial review before being promoted into full Thinker journeys.
