import type { ScreeningResultRow } from "../components/ScreeningResultsTable";

export type ReviewSidebarStepDef = {
  id: string;
  label: string;
  /** Match statuses that contribute to this step’s case count. */
  statuses: readonly string[];
};

export type ReviewSidebarGroupDef = {
  id: string;
  label: string;
  steps: readonly ReviewSidebarStepDef[];
};

export type ReviewSidebarStepCount = {
  id: string;
  label: string;
  count: number;
  statuses: readonly string[];
};

export type ReviewSidebarGroupCount = {
  id: string;
  label: string;
  count: number;
  steps: readonly ReviewSidebarStepCount[];
};

const BADGE = "text-[#523eb9]";

export const REVIEW_SIDEBAR_BADGE_CLASS = BADGE;

/** Level 1 Workbench — workflow groups with disposition / queue steps. */
export const LEVEL1_SIDEBAR_GROUP_DEFS: readonly ReviewSidebarGroupDef[] = [
  {
    id: "sanction",
    label: "Sanction Matches",
    steps: [
      { id: "new", label: "New", statuses: ["New"] },
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
      { id: "true-hit", label: "True Hit", statuses: ["Safe"] },
      { id: "false-positive", label: "False Positive", statuses: ["False Positive"] },
      { id: "edd", label: "EDD", statuses: ["Flag for EDD", "Research (Internal)", "Research (External)"] },
    ],
  },
  {
    id: "pep",
    label: "PEP Screening",
    steps: [
      { id: "new", label: "New", statuses: ["New"] },
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
      { id: "true-hit", label: "True Hit", statuses: ["Safe"] },
      { id: "false-positive", label: "False Positive", statuses: ["False Positive"] },
    ],
  },
  {
    id: "compliance-workbench",
    label: "Compliance Workbench",
    steps: [
      { id: "documents-required", label: "Documents Required", statuses: ["Documents Required"] },
      { id: "documents-uploaded", label: "Documents Uploaded", statuses: ["Documents Uploaded"] },
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
    ],
  },
  {
    id: "ai-workbench",
    label: "AI Workbench",
    steps: [
      { id: "ai-escalate", label: "AI-Escalate", statuses: ["AI-Escalate"] },
      { id: "ai-suspected-safe", label: "AI-Suspected Safe", statuses: ["AI-Suspected Safe"] },
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
      { id: "true-hit", label: "True Hit", statuses: ["Safe"] },
    ],
  },
] as const;

/** Level 2 Workbench — escalated queues as groups. */
export const LEVEL2_SIDEBAR_GROUP_DEFS: readonly ReviewSidebarGroupDef[] = [
  {
    id: "sanction",
    label: "Sanction Matches",
    steps: [
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
      { id: "true-hit", label: "True Hit", statuses: ["Safe"] },
      { id: "false-positive", label: "False Positive", statuses: ["False Positive"] },
      { id: "remediate", label: "Remediate", statuses: ["Remediate"] },
    ],
  },
  {
    id: "pep",
    label: "PEP Screening",
    steps: [
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
      { id: "true-hit", label: "True Hit", statuses: ["Safe"] },
      { id: "false-positive", label: "False Positive", statuses: ["False Positive"] },
    ],
  },
  {
    id: "compliance-workbench",
    label: "Compliance Workbench",
    steps: [
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
      { id: "documents-required", label: "Documents Required", statuses: ["Documents Required"] },
      { id: "documents-uploaded", label: "Documents Uploaded", statuses: ["Documents Uploaded"] },
      { id: "true-hit", label: "True Hit", statuses: ["Safe"] },
    ],
  },
  {
    id: "ai-workbench",
    label: "AI Workbench",
    steps: [
      { id: "ai-escalate", label: "AI-Escalate", statuses: ["AI-Escalate"] },
      { id: "ai-suspected-safe", label: "AI-Suspected Safe", statuses: ["AI-Suspected Safe"] },
      { id: "escalate-to-lead", label: "Escalate to Lead", statuses: ["Escalate to Team Lead"] },
      { id: "true-hit", label: "True Hit", statuses: ["Safe"] },
    ],
  },
] as const;

function caseHasStatus(
  rows: readonly ScreeningResultRow[] | undefined,
  statuses: readonly string[],
): boolean {
  if (!rows || rows.length === 0) return false;
  const set = new Set(statuses);
  return rows.some((row) => set.has(row.status));
}

/** Cases that have at least one match in any of the given statuses. */
export function countCasesForStatuses(
  screeningRowsByCase: Record<number, ScreeningResultRow[]>,
  statuses: readonly string[],
  caseIndexes?: readonly number[],
  /** When a case has no stored rows, return whether it should count for these statuses. */
  seedCaseMatches?: (caseIndex: number, statuses: readonly string[]) => boolean,
): number {
  const indexes =
    caseIndexes ??
    Object.keys(screeningRowsByCase).map((key) => Number.parseInt(key, 10));
  let count = 0;
  for (const index of indexes) {
    const rows = screeningRowsByCase[index];
    if (rows) {
      if (caseHasStatus(rows, statuses)) count += 1;
    } else if (seedCaseMatches?.(index, statuses)) {
      count += 1;
    }
  }
  return count;
}

export type ReviewSidebarQueueSources = {
  sanction: Record<number, ScreeningResultRow[]>;
  pep: Record<number, ScreeningResultRow[]>;
  compliance: Record<number, ScreeningResultRow[]>;
  ai: Record<number, ScreeningResultRow[]>;
};

export type ReviewSidebarGroupCountOptions = {
  /** Case indexes to scan per group id (defaults to Object.keys of that queue). */
  caseIndexesByGroup?: Partial<Record<string, readonly number[]>>;
  /** Seed matcher when a case has no materialized screening rows. */
  seedCaseMatches?: (caseIndex: number, statuses: readonly string[]) => boolean;
};

function queueForGroup(
  groupId: string,
  sources: ReviewSidebarQueueSources,
): Record<number, ScreeningResultRow[]> {
  if (groupId === "pep") return sources.pep;
  if (groupId === "ai-workbench") return sources.ai;
  if (groupId === "compliance-workbench") return sources.compliance;
  return sources.sanction;
}

export function deriveReviewSidebarGroups(
  defs: readonly ReviewSidebarGroupDef[],
  sources: ReviewSidebarQueueSources,
  options?: ReviewSidebarGroupCountOptions,
): ReviewSidebarGroupCount[] {
  return defs.map((group) => {
    const rowsByCase = queueForGroup(group.id, sources);
    const caseIndexes = options?.caseIndexesByGroup?.[group.id];
    const steps = group.steps
      .map((step) => ({
        id: step.id,
        label: step.label,
        statuses: step.statuses,
        count: countCasesForStatuses(
          rowsByCase,
          step.statuses,
          caseIndexes,
          options?.seedCaseMatches,
        ),
      }))
      // Steps are dynamic — only list ones that currently have alerts.
      .filter((step) => step.count > 0);
    return {
      id: group.id,
      label: group.label,
      count: steps.reduce((sum, step) => sum + step.count, 0),
      steps,
    };
  });
}

export function findSidebarStep(
  defs: readonly ReviewSidebarGroupDef[],
  groupId: string,
  stepId: string,
): ReviewSidebarStepDef | null {
  const group = defs.find((item) => item.id === groupId);
  return group?.steps.find((step) => step.id === stepId) ?? null;
}

export function defaultSidebarStepSelection(
  groups: readonly ReviewSidebarGroupCount[],
): { groupId: string; stepId: string } {
  for (const group of groups) {
    const withWork = group.steps.find((step) => step.count > 0);
    if (withWork) return { groupId: group.id, stepId: withWork.id };
  }
  const first = groups[0];
  const firstStep = first?.steps[0];
  return {
    groupId: first?.id ?? "sanction",
    stepId: firstStep?.id ?? "new",
  };
}

/** True when the current step is still listed (has alerts) in the derived groups. */
export function isSidebarStepVisible(
  groups: readonly ReviewSidebarGroupCount[],
  groupId: string,
  stepId: string,
): boolean {
  return groups.some(
    (group) =>
      group.id === groupId && group.steps.some((step) => step.id === stepId),
  );
}

/**
 * Assign whole cases to disposition statuses so sidebar steps show demo alerts.
 * Leaves unlisted cases unchanged.
 */
export function applyCaseStatusAssignments(
  screeningRowsByCase: Record<number, ScreeningResultRow[]>,
  assignments: readonly { caseIndex: number; status: string }[],
): Record<number, ScreeningResultRow[]> {
  const next = { ...screeningRowsByCase };
  for (const { caseIndex, status } of assignments) {
    const rows = next[caseIndex];
    if (!rows?.length) continue;
    next[caseIndex] = rows.map((row) => ({ ...row, status: status as ScreeningResultRow["status"] }));
  }
  return next;
}

/** Deterministic pseudo-random int in [min, max] (stable across reloads). */
export function sidebarDemoCount(seed: number, min: number, max: number): number {
  let x = (seed * 1_103_515_245 + 12_345) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return min + (x % (max - min + 1));
}

/**
 * Expand status specs into consecutive case assignments with varied counts.
 * Example: `{ status: "Safe", count: 4 }` → four cases with Safe.
 */
export function expandStatusCaseAssignments(
  specs: readonly { status: string; count: number }[],
  startCaseIndex: number,
): { caseIndex: number; status: string }[] {
  const assignments: { caseIndex: number; status: string }[] = [];
  let cursor = startCaseIndex;
  for (const spec of specs) {
    for (let i = 0; i < spec.count; i += 1) {
      assignments.push({ caseIndex: cursor, status: spec.status });
      cursor += 1;
    }
  }
  return assignments;
}
