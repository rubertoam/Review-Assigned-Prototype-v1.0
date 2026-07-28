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

/**
 * Workflow destinations that have received cleared / routed work
 * (including Documents Required).
 */
export function deriveReviewSidebarWorkflows(
  screeningRowsByCase: Record<number, ScreeningResultRow[]>,
  flowVariant: "level-1" | "level-2",
): ReviewSidebarWorkflowItem[] {
  const counts = new Map<string, { label: string; count: number }>();

  if (flowVariant === "level-1") {
    for (const rows of Object.values(screeningRowsByCase)) {
      for (const row of rows) {
        const workflow = getWorkflowForLevel1Status(row.status);
        if (!workflow) continue;
        const current = counts.get(workflow.id) ?? { label: workflow.label, count: 0 };
        current.count += 1;
        counts.set(workflow.id, current);
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
    for (const row of rows) {
      if (row.status === "Remediate") {
        const current = counts.get("level-1-remediation") ?? {
          label: "Level 1 Remediation",
          count: 0,
        };
        current.count += 1;
        counts.set("level-1-remediation", current);
      } else if (row.status === "False Positive") {
        const current = counts.get("false-positive") ?? {
          label: "False Positive",
          count: 0,
        };
        current.count += 1;
        counts.set("false-positive", current);
      } else if (row.status === "Safe" && row.decisionReviewer) {
        const current = counts.get("safe") ?? { label: "Safe", count: 0 };
        current.count += 1;
        counts.set("safe", current);
      }
    }
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
