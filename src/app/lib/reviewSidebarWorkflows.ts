import { type ScreeningResultRow } from "../components/ScreeningResultsTable";
import {
  LEVEL1_WORKFLOW_ORDER,
  getWorkflowForLevel1Status,
  isLevel1DecisionStatus,
} from "./reviewDecisionConfig";

export type ReviewSidebarWorkflowItem = {
  id: string;
  label: string;
  count: number;
  badgeLabelClass: string;
};

const WORKFLOW_BADGE = "text-[#523eb9]";

function bumpCaseCount(
  counts: Map<string, { label: string; count: number }>,
  id: string,
  label: string,
): void {
  const current = counts.get(id) ?? { label, count: 0 };
  current.count += 1;
  counts.set(id, current);
}

/**
 * Persona-visible workflow destinations with open work
 * (Compliance Workbench only for Level 1). Counts are cases in each workflow’s case list.
 */
export function deriveReviewSidebarWorkflows(
  screeningRowsByCase: Record<number, ScreeningResultRow[]>,
  flowVariant: "level-1" | "level-2",
): ReviewSidebarWorkflowItem[] {
  const counts = new Map<string, { label: string; count: number }>();

  if (flowVariant === "level-1") {
    for (const rows of Object.values(screeningRowsByCase)) {
      const workflowsForCase = new Set<string>();
      for (const row of rows) {
        const workflow = getWorkflowForLevel1Status(row.status);
        if (!workflow || workflowsForCase.has(workflow.id)) continue;
        workflowsForCase.add(workflow.id);
        bumpCaseCount(counts, workflow.id, workflow.label);
      }
    }

    return LEVEL1_WORKFLOW_ORDER.filter((workflow) => counts.has(workflow.id)).map(
      (workflow) => ({
        id: workflow.id,
        label: workflow.label,
        count: counts.get(workflow.id)!.count,
        badgeLabelClass: WORKFLOW_BADGE,
      }),
    );
  }

  for (const rows of Object.values(screeningRowsByCase)) {
    let hasRemediate = false;
    let hasFalsePositive = false;
    let hasSafe = false;
    for (const row of rows) {
      if (row.status === "Remediate") hasRemediate = true;
      else if (row.status === "False Positive") hasFalsePositive = true;
      else if (row.status === "Safe" && row.decisionReviewer) hasSafe = true;
    }
    if (hasRemediate) bumpCaseCount(counts, "level-1-remediation", "Level 1 Remediation");
    if (hasFalsePositive) bumpCaseCount(counts, "false-positive", "False Positive");
    if (hasSafe) bumpCaseCount(counts, "safe", "Safe");
  }

  return [...counts.entries()].map(([id, { label, count }]) => ({
    id,
    label,
    count,
    badgeLabelClass: WORKFLOW_BADGE,
  }));
}

export function hasLevel1ClearedWork(
  screeningRowsByCase: Record<number, ScreeningResultRow[]>,
): boolean {
  return Object.values(screeningRowsByCase).some((rows) =>
    rows.some((row) => isLevel1DecisionStatus(row.status)),
  );
}
