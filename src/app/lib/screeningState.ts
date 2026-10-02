import { useState, type Dispatch, type SetStateAction } from "react";
import {
  getScreeningRowsForCase,
  getSeedDocumentsRequiredCount,
  type ScreeningResultRow,
} from "../components/ScreeningResultsTable";
import { casesData } from "./reviewCaseData";
import {
  applyCaseStatusAssignments,
  expandStatusCaseAssignments,
  sidebarDemoCount,
} from "./reviewSidebarGroups";

/**
 * Varied demo case counts per disposition step (not all 1s).
 * Starts at case index 4 so early My Work / scroll-test cases stay New.
 */
const LEVEL1_DEMO_DISPOSITION_ASSIGNMENTS = expandStatusCaseAssignments(
  [
    { status: "Escalate to Team Lead", count: sidebarDemoCount(11, 3, 7) },
    { status: "Safe", count: sidebarDemoCount(22, 2, 6) },
    { status: "False Positive", count: sidebarDemoCount(33, 3, 8) },
    { status: "Flag for EDD", count: sidebarDemoCount(44, 2, 5) },
    { status: "Documents Uploaded", count: sidebarDemoCount(55, 2, 4) },
    { status: "Remediate", count: sidebarDemoCount(66, 2, 4) },
  ],
  4,
);

/**
 * Seed only open My Work / Compliance cases eagerly. Other cases resolve via
 * `screeningRowsByCase[index] ?? getScreeningRowsForCase(index)` so a large
 * Sanction queue does not freeze first paint.
 */
export function buildInitialScreeningRowsByCase(): Record<number, ScreeningResultRow[]> {
  const initial: Record<number, ScreeningResultRow[]> = {
    0: getScreeningRowsForCase(0),
  };
  for (let index = 0; index < casesData.length; index++) {
    if (initial[index]) continue;
    if (getSeedDocumentsRequiredCount(index) > 0) {
      initial[index] = getScreeningRowsForCase(index);
    }
  }
  for (const { caseIndex } of LEVEL1_DEMO_DISPOSITION_ASSIGNMENTS) {
    if (caseIndex < 0 || caseIndex >= casesData.length) continue;
    if (!initial[caseIndex]) {
      initial[caseIndex] = getScreeningRowsForCase(caseIndex);
    }
  }
  return applyCaseStatusAssignments(initial, LEVEL1_DEMO_DISPOSITION_ASSIGNMENTS);
}

/** Always starts from seed data — refresh resets the prototype. */
export function readScreeningRowsByCase(): Record<number, ScreeningResultRow[]> {
  return buildInitialScreeningRowsByCase();
}

export function useScreeningRowsByCase(): [
  Record<number, ScreeningResultRow[]>,
  Dispatch<SetStateAction<Record<number, ScreeningResultRow[]>>>,
] {
  return useState(buildInitialScreeningRowsByCase);
}

/** Materialize a case's rows into state the first time it is opened. */
export function ensureScreeningRowsForCase(
  prev: Record<number, ScreeningResultRow[]>,
  caseIndex: number,
): Record<number, ScreeningResultRow[]> {
  if (prev[caseIndex]) return prev;
  return {
    ...prev,
    [caseIndex]: getScreeningRowsForCase(caseIndex),
  };
}
