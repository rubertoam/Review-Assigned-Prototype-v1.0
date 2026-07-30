import type { ScreeningResultRow } from "../components/ScreeningResultsTable";

export type PepCaseListItem = {
  name: string;
  results: number;
  selected: boolean;
  isEntity?: boolean;
};

export type PepWorkQueue = {
  cases: PepCaseListItem[];
  screeningRowsByCase: Record<number, ScreeningResultRow[]>;
};

const INDIVIDUAL_FIRST = [
  "Elena",
  "Omar",
  "Priya",
  "Marcus",
  "Sofia",
  "Hiro",
  "Amara",
  "Leo",
  "Nadia",
  "Viktor",
  "Camille",
  "Diego",
] as const;

const INDIVIDUAL_LAST = [
  "Vargas",
  "Hassan",
  "Nair",
  "Whitfield",
  "Almeida",
  "Tanaka",
  "Okonkwo",
  "Petrov",
  "Dubois",
  "Reyes",
  "Kowalski",
  "Bergstrom",
] as const;

const ENTITY_NAMES = [
  "Northbridge Capital Ltd",
  "Horizon Trust Group",
  "Cascade Holdings PLC",
  "Summit Advisory Partners",
  "Atlas Maritime Corp",
] as const;

const AGE_LABELS = ["4h", "9h", "12h", "18h", "22h", "1d", "2d", "3d"] as const;
const TONE_ROTATION: ScreeningResultRow["matchAgeTone"][] = [
  "fresh",
  "fresh",
  "warn",
  "warn",
  "stale",
  "stale",
  "stale",
  "fresh",
];
const TILE_ROTATIONS = [
  ["E", "B", "N", "C1", "E", "N", "B"],
  ["E", "N", "C2", "B", "E", "N", "N"],
  ["N", "B", "C1", "E", "N", "B", "E"],
  ["E", "E", "N", "C2", "B", "N", "N"],
  ["N", "C1", "B", "E", "N", "B", "B"],
] as const;

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickOne<T>(items: readonly T[]): T {
  return items[randInt(0, items.length - 1)]!;
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

function uniqueIndividualName(used: Set<string>): string {
  for (let attempt = 0; attempt < 40; attempt++) {
    const name = `${pickOne(INDIVIDUAL_FIRST)} ${pickOne(INDIVIDUAL_LAST)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const fallback = `${pickOne(INDIVIDUAL_FIRST)} ${pickOne(INDIVIDUAL_LAST)} ${randInt(1, 99)}`;
  used.add(fallback);
  return fallback;
}

function uniqueEntityName(used: Set<string>): string {
  const remaining = ENTITY_NAMES.filter((name) => !used.has(name));
  const name = remaining.length > 0 ? pickOne(remaining) : `${pickOne(ENTITY_NAMES)} ${randInt(1, 99)}`;
  used.add(name);
  return name;
}

function matchNameVariants(caseName: string, count: number): string[] {
  const parts = caseName.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? caseName;
  const last = parts.length > 1 ? parts[parts.length - 1]! : caseName;
  const middle = parts.length > 2 ? parts[1]!.charAt(0) : first.charAt(0);
  const variants = [
    caseName,
    `${first} ${last}`,
    `${first.charAt(0)}. ${last}`,
    `${last}, ${first}`,
    `${first} ${middle}. ${last}`,
    `${first.toUpperCase()} ${last.toUpperCase()}`,
    `${last.toUpperCase()}, ${first}`,
    `${first} ${last.charAt(0)}.`,
    `${first}-${last}`,
  ];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(variants[i % variants.length]!);
  }
  return shuffleInPlace(out);
}

function dobFor(caseIndex: number, rowIndex: number): string {
  const seed = (caseIndex + 11) * 883 + (rowIndex + 3) * 4211 + randInt(0, 50);
  const year = 1945 + (seed % 55);
  const month = 1 + (seed % 12);
  const day = 1 + ((seed >> 3) % 28);
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
}

function buildPepRows(caseIndex: number, caseName: string, matchCount: number): ScreeningResultRow[] {
  const names = matchNameVariants(caseName, matchCount);
  return names.map((name, i) => ({
    id: `pep-c${caseIndex}-${i + 1}`,
    name,
    dob: dobFor(caseIndex, i),
    matchAgeLabel: AGE_LABELS[i % AGE_LABELS.length]!,
    matchAgeTone: TONE_ROTATION[i % TONE_ROTATION.length]!,
    matchScore: Math.max(24, 96 - i * randInt(5, 9) - (caseIndex % 4) * 2),
    matchTiles: [...TILE_ROTATIONS[i % TILE_ROTATIONS.length]!],
    status: "New",
  }));
}

/** Builds a fresh randomized PEP Screening queue (cases + matches). */
export function buildRandomPepWorkQueue(): PepWorkQueue {
  const caseCount = randInt(4, 6);
  const usedNames = new Set<string>();
  const cases: PepCaseListItem[] = [];
  const screeningRowsByCase: Record<number, ScreeningResultRow[]> = {};

  for (let i = 0; i < caseCount; i++) {
    const isEntity = Math.random() < 0.22;
    const name = isEntity ? uniqueEntityName(usedNames) : uniqueIndividualName(usedNames);
    const matchCount = randInt(2, 8);
    cases.push({
      name,
      results: matchCount,
      selected: i === 0,
      ...(isEntity ? { isEntity: true } : {}),
    });
    screeningRowsByCase[i] = buildPepRows(i, name, matchCount);
  }

  return { cases, screeningRowsByCase };
}

/** Shared across landing badge + Level 1 until refresh rebuilds the app. */
export const INITIAL_PEP_WORK_QUEUE: PepWorkQueue = buildRandomPepWorkQueue();

export function getInitialPepCaseCount(): number {
  return INITIAL_PEP_WORK_QUEUE.cases.length;
}
