import { formatDocumentModifyDate, type ClientDocumentItem } from "./clientDocumentsData";

/** Same shape as client documents; kept as an alias for match-scoped usage. */
export type MatchDocumentItem = ClientDocumentItem;

const MATCH_DOC_TITLES = [
  "match-evidence.pdf",
  "list-profile-excerpt.pdf",
  "adverse-media-clip.png",
  "sanctions-hit-notes.txt",
  "research-summary.docx",
] as const;

const MATCH_CATEGORIES = [
  "Evidence",
  "List Profile",
  "Adverse Media",
  "Research",
  "Unknown",
] as const;

const MATCH_USERS = ["antonio", "janet", "rebecca", "sam"] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function unit(seed: number, salt: number): number {
  const x = Math.sin((seed + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(list: readonly T[], seed: number, salt: number): T {
  return list[Math.floor(unit(seed, salt) * list.length)]!;
}

/** Seeded match documents — different from client-profile documents. */
export function initialDocumentsForMatch(rowId: string): MatchDocumentItem[] {
  const seed = hashString(rowId);
  const count = Math.floor(unit(seed, 1) * 3); // 0–2 docs for most matches
  if (count === 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const title = pick(MATCH_DOC_TITLES, seed, 10 + index);
    const category = pick(MATCH_CATEGORIES, seed, 20 + index);
    const modifyUser = pick(MATCH_USERS, seed, 30 + index);
    const dayOffset = Math.floor(unit(seed, 40 + index) * 40);
    const date = new Date(Date.UTC(2026, 5, 15 - dayOffset, 14, 20 + index, 8));
    return {
      id: `match-doc-${rowId}-${index}`,
      title,
      category,
      description:
        unit(seed, 50 + index) > 0.55
          ? `Supporting file for match ${rowId}`
          : "",
      path: title,
      isUrl: false,
      modifyDate: formatDocumentModifyDate(date),
      modifyUser,
    };
  });
}

export { formatDocumentModifyDate };
