import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import type { PepCaseListItem, PepWorkQueue } from "./pepWorkQueue";
import { expandStatusCaseAssignments, sidebarDemoCount } from "./reviewSidebarGroups";

export type EscalatedWorkQueue = PepWorkQueue;

const PEP_CASES = [
  { name: "Amira Haddad", matchCount: 4 },
  { name: "Kenji Nakamura", matchCount: 3 },
  { name: "Sofia Reyes", matchCount: 5 },
  { name: "Daniel Okonkwo", matchCount: 2 },
  { name: "Ingrid Bergstrom", matchCount: 3 },
  { name: "Horizon Trust Group", matchCount: 4, isEntity: true },
  { name: "Priya Nair", matchCount: 2 },
  { name: "Marcus Whitfield", matchCount: 3 },
] as const;

const FINANCIAL_CASES = [
  { name: "Cascade Holdings PLC", matchCount: 3, isEntity: true },
  { name: "Leo Petrov", matchCount: 4 },
  { name: "Camille Dubois", matchCount: 2 },
  { name: "Atlas Maritime Corp", matchCount: 5, isEntity: true },
  { name: "Nadia Vargas", matchCount: 3 },
  { name: "Omar Hassan", matchCount: 2 },
] as const;

const AGE_LABELS = ["4h", "9h", "12h", "18h", "1d", "2d"] as const;
const TONE_ROTATION: ScreeningResultRow["matchAgeTone"][] = [
  "fresh",
  "warn",
  "warn",
  "stale",
  "stale",
  "fresh",
];
const TILE_ROTATIONS = [
  ["E", "B", "N", "C1", "E", "N", "B"],
  ["E", "N", "C2", "B", "E", "N", "N"],
  ["N", "B", "C1", "E", "N", "B", "E"],
] as const;

function dobFor(caseIndex: number, rowIndex: number): string {
  const seed = (caseIndex + 17) * 641 + (rowIndex + 5) * 2333;
  const year = 1950 + (seed % 50);
  const month = 1 + (seed % 12);
  const day = 1 + ((seed >> 2) % 28);
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
}

function matchNameVariants(caseName: string, count: number): string[] {
  const parts = caseName.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? caseName;
  const last = parts.length > 1 ? parts[parts.length - 1]! : caseName;
  const variants = [
    caseName,
    `${first} ${last}`,
    `${first.charAt(0)}. ${last}`,
    `${last}, ${first}`,
    `${first.toUpperCase()} ${last.toUpperCase()}`,
  ];
  return Array.from({ length: count }, (_, i) => variants[i % variants.length]!);
}

function buildEscalatedRows(
  idPrefix: string,
  caseIndex: number,
  caseName: string,
  matchCount: number,
): ScreeningResultRow[] {
  const names = matchNameVariants(caseName, matchCount);
  return names.map((name, i) => ({
    id: `${idPrefix}-c${caseIndex}-${i + 1}`,
    name,
    dob: dobFor(caseIndex, i),
    matchAgeLabel: AGE_LABELS[i % AGE_LABELS.length]!,
    matchAgeTone: TONE_ROTATION[i % TONE_ROTATION.length]!,
    matchScore: Math.max(28, 94 - i * 6 - (caseIndex % 3) * 2),
    matchTiles: [...TILE_ROTATIONS[i % TILE_ROTATIONS.length]!],
    /** Level 2 My Work queue status. */
    status: "Escalate to Team Lead",
    level1Reviewer: "Janet",
    level1Reason: "Escalate to Team Lead",
  }));
}

function buildEscalatedQueue(
  idPrefix: string,
  seeds: readonly { name: string; matchCount: number; isEntity?: boolean }[],
  dispositionAssignments: readonly { caseIndex: number; status: string }[] = [],
): EscalatedWorkQueue {
  const cases: PepCaseListItem[] = seeds.map((seed, index) => ({
    name: seed.name,
    results: seed.matchCount,
    selected: index === 0,
    ...(seed.isEntity ? { isEntity: true } : {}),
  }));
  const screeningRowsByCase: Record<number, ScreeningResultRow[]> = {};
  seeds.forEach((seed, index) => {
    screeningRowsByCase[index] = buildEscalatedRows(
      idPrefix,
      index,
      seed.name,
      seed.matchCount,
    );
  });
  for (const { caseIndex, status } of dispositionAssignments) {
    const rows = screeningRowsByCase[caseIndex];
    if (!rows?.length) continue;
    screeningRowsByCase[caseIndex] = rows.map((row) => ({
      ...row,
      status: status as ScreeningResultRow["status"],
      ...(status === "Escalate to Team Lead"
        ? {}
        : { decisionReviewer: "Morgan", decisionReason: status }),
    }));
  }
  return { cases, screeningRowsByCase };
}

/** Level 2 — Escalated PEPs My Work queue. */
const L2_PEP_SAFE_COUNT = sidebarDemoCount(91, 2, 4);
const L2_PEP_FP_COUNT = sidebarDemoCount(92, 2, 3);
export const INITIAL_ESCALATED_PEP_QUEUE: EscalatedWorkQueue = buildEscalatedQueue(
  "l2-pep",
  PEP_CASES,
  expandStatusCaseAssignments(
    [
      { status: "Safe", count: L2_PEP_SAFE_COUNT },
      { status: "False Positive", count: L2_PEP_FP_COUNT },
    ],
    Math.max(0, PEP_CASES.length - L2_PEP_SAFE_COUNT - L2_PEP_FP_COUNT),
  ),
);

/** Level 2 — Escalated Financial Crime My Work queue. */
const L2_FIN_SAFE_COUNT = sidebarDemoCount(93, 2, 3);
const L2_FIN_DOCS_COUNT = sidebarDemoCount(94, 1, 3);
export const INITIAL_ESCALATED_FINANCIAL_QUEUE: EscalatedWorkQueue = buildEscalatedQueue(
  "l2-fin",
  FINANCIAL_CASES,
  expandStatusCaseAssignments(
    [
      { status: "Safe", count: L2_FIN_SAFE_COUNT },
      { status: "Documents Uploaded", count: L2_FIN_DOCS_COUNT },
    ],
    Math.max(0, FINANCIAL_CASES.length - L2_FIN_SAFE_COUNT - L2_FIN_DOCS_COUNT),
  ),
);

export function countEscalatedQueuePendingCases(queue: EscalatedWorkQueue): number {
  return queue.cases.reduce((count, _, index) => {
    const rows = queue.screeningRowsByCase[index] ?? [];
    return rows.some((row) => row.status === "Escalate to Team Lead") ? count + 1 : count;
  }, 0);
}
