import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  getScreeningRowsForCase,
  type ScreeningResultRow,
} from "../components/ScreeningResultsTable";

const STORAGE_KEY = "review-assigned-screening-rows-by-case-v5";

export function buildInitialScreeningRowsByCase(): Record<number, ScreeningResultRow[]> {
  const out: Record<number, ScreeningResultRow[]> = {};
  for (let index = 0; index < 6; index++) {
    out[index] = getScreeningRowsForCase(index);
  }
  return out;
}

export function loadScreeningRowsByCase(): Record<number, ScreeningResultRow[]> | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<number, ScreeningResultRow[]>;
  } catch {
    return null;
  }
}

export function saveScreeningRowsByCase(data: Record<number, ScreeningResultRow[]>): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota / private mode errors in prototype.
  }
}

export function readScreeningRowsByCase(): Record<number, ScreeningResultRow[]> {
  return loadScreeningRowsByCase() ?? buildInitialScreeningRowsByCase();
}

export function useScreeningRowsByCase(): [
  Record<number, ScreeningResultRow[]>,
  Dispatch<SetStateAction<Record<number, ScreeningResultRow[]>>>,
] {
  const [screeningRowsByCase, setState] = useState(readScreeningRowsByCase);
  const setScreeningRowsByCase = useCallback(
    (action: SetStateAction<Record<number, ScreeningResultRow[]>>) => {
      setState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        saveScreeningRowsByCase(next);
        return next;
      });
    },
    [],
  );
  return [screeningRowsByCase, setScreeningRowsByCase];
}
