import { useState, type Dispatch, type SetStateAction } from "react";
import {
  getScreeningRowsForCase,
  type ScreeningResultRow,
} from "../components/ScreeningResultsTable";

export function buildInitialScreeningRowsByCase(): Record<number, ScreeningResultRow[]> {
  const out: Record<number, ScreeningResultRow[]> = {};
  for (let index = 0; index < 6; index++) {
    out[index] = getScreeningRowsForCase(index);
  }
  return out;
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
