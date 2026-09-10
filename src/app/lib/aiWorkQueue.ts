import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import {
  LEVEL1_AI_ESCALATE_STATUS,
  LEVEL1_AI_SUSPECTED_SAFE_STATUS,
  type Level1AiWorkbenchStatus,
} from "./reviewDecisionConfig";

export type AiCaseListItem = {
  name: string;
  results: number;
  selected: boolean;
  isEntity?: boolean;
};

export type AiWorkQueue = {
  cases: AiCaseListItem[];
  screeningRowsByCase: Record<number, ScreeningResultRow[]>;
};

/** Fixed demo clients for AI Workbench (10). */
const AI_CLIENT_SEEDS = [
  { name: "Amira Solanki", isEntity: false },
  { name: "Bennett Holloway", isEntity: false },
  { name: "Catalina Ruiz", isEntity: false },
  { name: "Darius Okeke", isEntity: false },
  { name: "Evelyn Hartman", isEntity: false },
  { name: "Farid Nazari", isEntity: false },
  { name: "Greta Lindholm", isEntity: false },
  { name: "Helios Logistics GmbH", isEntity: true },
  { name: "Imani Boateng", isEntity: false },
  { name: "Juniper Trade Partners", isEntity: true },
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

/** Deterministic int in [min, max] from a seed (stable across reloads). */
function seededInt(seed: number, min: number, max: number): number {
  let x = (seed * 1_103_515_245 + 12_345) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  const span = max - min + 1;
  return min + (x % span);
}

function matchNameVariants(caseName: string, count: number, caseIndex: number): string[] {
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
    `${first} ${last} Jr.`,
  ];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const offset = seededInt(caseIndex * 97 + i * 13, 0, variants.length - 1);
    out.push(variants[(i + offset) % variants.length]!);
  }
  return out;
}

function dobFor(caseIndex: number, rowIndex: number): string {
  const seed = (caseIndex + 7) * 883 + (rowIndex + 3) * 4211;
  const year = 1945 + (seed % 55);
  const month = 1 + (seed % 12);
  const day = 1 + ((seed >> 3) % 28);
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
}

function statusForAiCase(caseIndex: number, caseName: string): Level1AiWorkbenchStatus {
  // One status per client — never mix Suspected Safe and Escalate in the same case.
  if (caseName === "Evelyn Hartman") return LEVEL1_AI_SUSPECTED_SAFE_STATUS;
  return seededInt(caseIndex * 4_177 + 91, 0, 99) < 35
    ? LEVEL1_AI_ESCALATE_STATUS
    : LEVEL1_AI_SUSPECTED_SAFE_STATUS;
}

function alertCountForCase(caseIndex: number): number {
  // Keep each AI Workbench client in a small, reviewable range.
  return seededInt(caseIndex * 4_871 + 203, 10, 25);
}

function buildAiRows(caseIndex: number, caseName: string, matchCount: number): ScreeningResultRow[] {
  const names = matchNameVariants(caseName, matchCount, caseIndex);
  const status = statusForAiCase(caseIndex, caseName);
  return names.map((name, i) => ({
    id: `ai-c${caseIndex}-${i + 1}`,
    name,
    dob: dobFor(caseIndex, i),
    matchAgeLabel: AGE_LABELS[i % AGE_LABELS.length]!,
    matchAgeTone: TONE_ROTATION[i % TONE_ROTATION.length]!,
    matchScore: Math.max(24, 96 - i * (5 + (caseIndex % 4)) - (caseIndex % 3) * 2),
    matchTiles: [...TILE_ROTATIONS[i % TILE_ROTATIONS.length]!],
    status,
  }));
}

export function buildAiWorkQueue(): AiWorkQueue {
  const cases: AiCaseListItem[] = [];
  const screeningRowsByCase: Record<number, ScreeningResultRow[]> = {};

  AI_CLIENT_SEEDS.forEach((seed, caseIndex) => {
    const matchCount = alertCountForCase(caseIndex);
    cases.push({
      name: seed.name,
      results: matchCount,
      selected: caseIndex === 0,
      ...(seed.isEntity ? { isEntity: true as const } : {}),
    });
    screeningRowsByCase[caseIndex] = buildAiRows(caseIndex, seed.name, matchCount);
  });

  return { cases, screeningRowsByCase };
}

/** Bump when AI seed logic changes so Level 1 state can refresh after HMR. */
export const AI_QUEUE_REVISION = 4;

/** Shared across Level 1 until refresh rebuilds the app. */
export const INITIAL_AI_WORK_QUEUE: AiWorkQueue = buildAiWorkQueue();

export function getInitialAiCaseCount(): number {
  return INITIAL_AI_WORK_QUEUE.cases.length;
}
