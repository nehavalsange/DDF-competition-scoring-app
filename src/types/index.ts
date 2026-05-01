export type TeamCategory = "JR_KIDS" | "SR_KIDS" | "ADULT" | "SINGING";
export type ScoreStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type CompetitionStatus = "DRAFT" | "PUBLISHED" | "COMPLETED";
export type Role = "ADMIN" | "JUDGE";

export const JR_SR_CATEGORIES = [
  "Choreography",
  "Creativity",
  "Stage Presence",
  "Energy & Engagement",
  "Overall Impact",
] as const;

export const ADULT_CATEGORIES = [
  "Stage Presence",
  "Precision",
  "Connect",
  "Choreo",
  "Creativity",
  "Expression",
  "Theme",
  "Technique",
  "Props",
] as const;

export function getScoringCategories(category: TeamCategory): readonly string[] {
  if (category === "ADULT") return ADULT_CATEGORIES;
  if (category === "SINGING") return [];
  return JR_SR_CATEGORIES;
}

export function getCategoryLabel(category: TeamCategory): string {
  switch (category) {
    case "JR_KIDS": return "Jr Kids";
    case "SR_KIDS": return "Sr Kids";
    case "ADULT": return "Adult";
    case "SINGING": return "Singing";
  }
}
