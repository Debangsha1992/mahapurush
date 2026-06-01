export const SKILLS = [
  "questioning",
  "logic",
  "empathy",
  "imagination",
  "courage",
  "discipline",
  "justice",
  "creativity",
  "self-awareness",
  "systems-thinking",
] as const;

export type SkillId = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<SkillId, string> = {
  questioning: "Questioning",
  logic: "Logic",
  empathy: "Empathy",
  imagination: "Imagination",
  courage: "Courage",
  discipline: "Discipline",
  justice: "Justice",
  creativity: "Creativity",
  "self-awareness": "Self-awareness",
  "systems-thinking": "Systems thinking",
};
