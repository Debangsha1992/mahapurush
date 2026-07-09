export const PERSON_REGION_IDS = [
  "africa",
  "east-asia",
  "south-asia",
  "southeast-asia-oceania",
  "middle-east-north-africa",
  "europe",
  "north-america",
  "latin-america-caribbean",
  "global-diaspora",
] as const;

export const PERSON_REGIONS = [
  {
    id: PERSON_REGION_IDS[0],
    label: "Africa",
  },
  {
    id: PERSON_REGION_IDS[1],
    label: "East Asia",
  },
  {
    id: PERSON_REGION_IDS[2],
    label: "South Asia",
  },
  {
    id: PERSON_REGION_IDS[3],
    label: "Southeast Asia & Oceania",
  },
  {
    id: PERSON_REGION_IDS[4],
    label: "Middle East & North Africa",
  },
  {
    id: PERSON_REGION_IDS[5],
    label: "Europe",
  },
  {
    id: PERSON_REGION_IDS[6],
    label: "North America",
  },
  {
    id: PERSON_REGION_IDS[7],
    label: "Latin America & Caribbean",
  },
  {
    id: PERSON_REGION_IDS[8],
    label: "Global & Diaspora",
  },
] as const;

export type PersonRegionId = (typeof PERSON_REGION_IDS)[number];

export const PERSON_REGION_LABELS: Record<PersonRegionId, string> =
  Object.fromEntries(
    PERSON_REGIONS.map((region) => [region.id, region.label]),
  ) as Record<PersonRegionId, string>;
