import { casesData } from "./reviewCaseData";

/**
 * Screening-rule counts shown under “My Assigned Work” on Review Assigned (Level 1).
 * Sanction Matches is dynamic (open cases); the rest are static prototype values.
 */
export const LEVEL1_STATIC_SCREENING_RULE_COUNTS = {
  pep: 53,
  "new-clients": 27,
  financial: 19,
} as const;

/** Sum of static screening-rule counts (excludes Sanction Matches). */
export const LEVEL1_STATIC_SCREENING_RULE_TOTAL = Object.values(
  LEVEL1_STATIC_SCREENING_RULE_COUNTS,
).reduce((sum, n) => sum + n, 0);

/**
 * Badge total for Assigned Cases on the Watchlist landing page:
 * open Sanction Matches cases + all other screening-rule counts.
 */
export function getAssignedCasesBadgeCount(openSanctionCaseCount: number): number {
  return openSanctionCaseCount + LEVEL1_STATIC_SCREENING_RULE_TOTAL;
}

/** Initial open Sanction Matches count before any review decisions (all cases open). */
export function getInitialOpenSanctionCaseCount(): number {
  return casesData.length;
}
