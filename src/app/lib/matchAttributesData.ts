import type { ScreeningResultRow } from "../components/ScreeningResultsTable";

/** Match-string codes used on screening tiles / Match Summary. */
export type MatchAttributeCode = "E" | "B" | "N" | "C1" | "C2";

export const MATCH_ATTRIBUTE_CODE_LABELS: Record<MatchAttributeCode, string> = {
  E: "Equal",
  B: "Blank",
  N: "Not Equal",
  C1: "Close",
  C2: "Very Close",
};

/** Standard individual match-string attributes for the Match Summary table. */
export const MATCH_SUMMARY_ATTRIBUTES = [
  "First Name",
  "Last Name",
  "Middle Name",
  "Alias",
  "DOB",
  "Country",
  "ID",
] as const;

export type MatchSummaryAttribute = (typeof MATCH_SUMMARY_ATTRIBUTES)[number];

export type MatchAttributeRow = {
  id: string;
  attribute: string;
  code: MatchAttributeCode;
  value: string;
};

const CODE_CYCLE: readonly MatchAttributeCode[] = ["E", "B", "N", "C1", "C2"];

function isMatchAttributeCode(value: string): value is MatchAttributeCode {
  return value === "E" || value === "B" || value === "N" || value === "C1" || value === "C2";
}

/** Build attribute rows for a screening alert — prefers the row’s match tiles when present. */
export function matchAttributesForRow(row: ScreeningResultRow): MatchAttributeRow[] {
  const tiles = row.matchTiles ?? [];
  return MATCH_SUMMARY_ATTRIBUTES.map((attribute, index) => {
    const fromTile = tiles[index];
    const code =
      fromTile && isMatchAttributeCode(fromTile.toUpperCase())
        ? (fromTile.toUpperCase() as MatchAttributeCode)
        : CODE_CYCLE[(index + row.matchTiles.length) % CODE_CYCLE.length]!;
    return {
      id: `${row.id}-attr-${index}`,
      attribute,
      code,
      value: MATCH_ATTRIBUTE_CODE_LABELS[code],
    };
  });
}

/** Rank type shown on Match Summary (prototype constant). */
export const MATCH_SUMMARY_RANK_TYPE = "Review";

/** Name type matched for an alert — Parent or Alias. */
export function nameTypeMatchedForRow(row: ScreeningResultRow): "Parent" | "Alias" {
  let hash = 0;
  for (let i = 0; i < row.id.length; i += 1) {
    hash = (hash * 31 + row.id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? "Parent" : "Alias";
}
