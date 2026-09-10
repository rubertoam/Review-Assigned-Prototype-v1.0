import { useState, type Dispatch, type SetStateAction } from "react";
import {
  getScreeningRowsForCase,
  getSeedDocumentsRequiredCount,
  type ScreeningResultRow,
} from "../components/ScreeningResultsTable";
import { casesData } from "./reviewCaseData";

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
  return initial;
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
