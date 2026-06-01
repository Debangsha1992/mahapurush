export const CATEGORIES = [
  "identity-self",
  "justice-society",
  "science-curiosity",
  "creativity-art",
  "logic-reason",
  "courage-leadership",
] as const;

export type CategoryId = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  "identity-self": "Identity & Self",
  "justice-society": "Justice & Society",
  "science-curiosity": "Science & Curiosity",
  "creativity-art": "Creativity & Art",
  "logic-reason": "Logic & Reason",
  "courage-leadership": "Courage & Leadership",
};
