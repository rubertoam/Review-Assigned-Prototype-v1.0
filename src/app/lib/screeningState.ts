import { useState, type Dispatch, type SetStateAction } from "react";
import {
  getScreeningRowsForCase,
  type ScreeningResultRow,
} from "../components/ScreeningResultsTable";

/**
 * Seed only the first open case eagerly. Other cases resolve via
 * `screeningRowsByCase[index] ?? getScreeningRowsForCase(index)` so a large
 * Sanction queue does not freeze first paint.
 */
export function buildInitialScreeningRowsByCase(): Record<number, ScreeningResultRow[]> {
  return {
    0: getScreeningRowsForCase(0),
  };
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
