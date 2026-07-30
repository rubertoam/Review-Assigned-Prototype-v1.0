import { casesData } from "./reviewCaseData";
import { getInitialPepCaseCount } from "./pepWorkQueue";

/**
 * Badge total for Assigned Cases on the Watchlist landing page:
 * open Sanction Matches cases + initial PEP Screening case count.
 */
export function getAssignedCasesBadgeCount(openSanctionCaseCount: number): number {
  return openSanctionCaseCount + getInitialPepCaseCount();
}

/** Initial open Sanction Matches count before any review decisions (all cases open). */
export function getInitialOpenSanctionCaseCount(): number {
  return casesData.length;
}
