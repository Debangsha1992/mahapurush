export const PERSON_DOMAIN_IDS = [
  "science-math-technology",
  "philosophy-ethics-religion",
  "justice-governance-leadership",
  "literature-arts-culture",
  "environment-exploration-human-achievement",
] as const;

export const PERSON_DOMAINS = [
  {
    id: PERSON_DOMAIN_IDS[0],
    label: "Science, Math & Technology",
  },
  {
    id: PERSON_DOMAIN_IDS[1],
    label: "Philosophy, Ethics & Religion",
  },
  {
    id: PERSON_DOMAIN_IDS[2],
    label: "Justice, Governance & Leadership",
  },
  {
    id: PERSON_DOMAIN_IDS[3],
    label: "Literature, Arts & Culture",
  },
  {
    id: PERSON_DOMAIN_IDS[4],
    label: "Environment, Exploration & Human Achievement",
  },
] as const;

export type PersonDomainId = (typeof PERSON_DOMAIN_IDS)[number];

export const PERSON_DOMAIN_LABELS: Record<PersonDomainId, string> =
  Object.fromEntries(
    PERSON_DOMAINS.map((domain) => [domain.id, domain.label]),
  ) as Record<PersonDomainId, string>;
