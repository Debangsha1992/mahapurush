const GENERATED_SUMMARY_PHRASES = [
  " is a notable ",
  " connected with ",
  "recorded life dates",
  "profile connects",
  "grouped with",
];

export function isGeneratedPersonSummary(summary: string): boolean {
  const normalized = summary.toLowerCase();
  return GENERATED_SUMMARY_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function getPublicPersonSummary(summary: string): string | undefined {
  return isGeneratedPersonSummary(summary) ? undefined : summary;
}
