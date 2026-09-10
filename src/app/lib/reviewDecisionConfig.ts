import { buildAiDecisionCommentForRows } from "./aiReviewComments";

export const LEVEL1_CONFIRMED_STATUSES = ["Safe"] as const;

export type Level1ConfirmedStatus = (typeof LEVEL1_CONFIRMED_STATUSES)[number];

export const LEVEL1_IN_PROCESS_STATUSES = [
  "Escalate to Team Lead",
  "Documents Uploaded",
] as const;

export type Level1InProcessStatus = (typeof LEVEL1_IN_PROCESS_STATUSES)[number];

/** Statuses that land in the Level 2 analyst queue (Operator Level 2 Workbench). */
export const LEVEL1_LEVEL2_QUEUE_STATUSES = ["Escalate to Team Lead"] as const;

export type Level1Level2QueueStatus = (typeof LEVEL1_LEVEL2_QUEUE_STATUSES)[number];

/** Matches still in My Work (Sanction Matches). */
export const LEVEL1_MY_WORK_STATUSES = ["New"] as const;

export type Level1MyWorkStatus = (typeof LEVEL1_MY_WORK_STATUSES)[number];

/** AI Workbench open alert statuses (not shown in My Work). */
export const LEVEL1_AI_ESCALATE_STATUS = "AI-Escalate" as const;
export const LEVEL1_AI_SUSPECTED_SAFE_STATUS = "AI-Suspected Safe" as const;

export const LEVEL1_AI_WORKBENCH_STATUSES = [
  LEVEL1_AI_ESCALATE_STATUS,
  LEVEL1_AI_SUSPECTED_SAFE_STATUS,
] as const;

export type Level1AiWorkbenchStatus = (typeof LEVEL1_AI_WORKBENCH_STATUSES)[number];

/** Open statuses that still need a Level 1 action (My Work, Compliance, or AI Workbench). */
export const LEVEL1_OPEN_QUEUE_STATUSES = [
  "New",
  "Documents Required",
  ...LEVEL1_AI_WORKBENCH_STATUSES,
] as const;

export type Level1OpenQueueStatus = (typeof LEVEL1_OPEN_QUEUE_STATUSES)[number];

export const LEVEL1_DECISION_STATUSES = [
  ...LEVEL1_CONFIRMED_STATUSES,
  ...LEVEL1_IN_PROCESS_STATUSES,
] as const;

export type Level1StandardDecisionStatus = (typeof LEVEL1_DECISION_STATUSES)[number];

/** Extra Level 1 decision used when confirming an AI-Escalate recommendation. */
export const LEVEL1_ESCALATE_TO_LEVEL1_DECISION = "Escalate to Level 1" as const;

export const LEVEL1_AI_DECISION_STATUSES = [LEVEL1_ESCALATE_TO_LEVEL1_DECISION] as const;

export type Level1AiDecisionStatus = (typeof LEVEL1_AI_DECISION_STATUSES)[number];

export type Level1DecisionStatus = Level1StandardDecisionStatus | Level1AiDecisionStatus;

export type Level1ScreeningStatus = Level1OpenQueueStatus | Level1DecisionStatus;

/** Compliance Workbench — open Documents Required matches only (uploaded leave for Work Log). */
export const LEVEL1_COMPLIANCE_WORKBENCH = {
  id: "compliance-workbench",
  label: "Compliance Workbench",
} as const;

/** Alias — Documents Required status is the open queue for this workbench. */
export const LEVEL1_DOCUMENTS_REQUIRED_WORKFLOW = LEVEL1_COMPLIANCE_WORKBENCH;

/** AI Workbench — AI-scored alerts awaiting analyst review. */
export const LEVEL1_AI_WORKBENCH = {
  id: "ai-workbench",
  label: "AI Workbench",
} as const;

/**
 * Submitted Level 1 decisions leave the persona’s queues and are audited in Work Log.
 * (Operator L1/L2 workbenches are out of this user’s workflow.)
 */
export const LEVEL1_WORK_LOG_DESTINATION = {
  id: "work-log",
  label: "Work History",
} as const;

/** Stable sidebar order for Level 1 workflow groups (persona-visible only). */
export const LEVEL1_WORKFLOW_ORDER: readonly { id: string; label: string }[] = [
  LEVEL1_COMPLIANCE_WORKBENCH,
  LEVEL1_AI_WORKBENCH,
];

export const LEVEL2_DECISION_STATUSES = ["Safe", "False Positive", "Remediate"] as const;

export type Level2DecisionStatus = (typeof LEVEL2_DECISION_STATUSES)[number];

/** L2 "Remediate" sends a match back to Level 1 and reopens it for re-review. */
export const LEVEL2_REMEDIATE_STATUS = "Remediate" as const;

export const LEVEL1_STATUS_REASONS: Record<Level1DecisionStatus, readonly string[]> = {
  Safe: ["Safe"],
  "Escalate to Team Lead": ["Escalate to Team Lead"],
  "Documents Uploaded": ["Documents Uploaded"],
  "Escalate to Level 1": ["Suspected Safe"],
};

export const LEVEL2_STATUS_REASONS: Record<Level2DecisionStatus, readonly string[]> = {
  Safe: [
    "Audit Confirmed",
    "Audit Rejected",
    "See Comment Field",
    "None",
    "Prior Hit",
  ],
  "False Positive": ["None"],
  Remediate: ["Incorrect Disposition", "Wrong Status Applied"],
};

export const LEVEL1_STATUS_DISPLAY_ORDER: Level1ScreeningStatus[] = [
  ...LEVEL1_OPEN_QUEUE_STATUSES,
  ...LEVEL1_DECISION_STATUSES,
  ...LEVEL1_AI_DECISION_STATUSES,
];

export function isLevel1ConfirmedStatus(status: string): status is Level1ConfirmedStatus {
  return (LEVEL1_CONFIRMED_STATUSES as readonly string[]).includes(status);
}

export function isLevel1InProcessStatus(status: string): status is Level1InProcessStatus {
  return (LEVEL1_IN_PROCESS_STATUSES as readonly string[]).includes(status);
}

export function isLevel1Level2QueueStatus(status: string): status is Level1Level2QueueStatus {
  return (LEVEL1_LEVEL2_QUEUE_STATUSES as readonly string[]).includes(status);
}

export function isLevel1MyWorkStatus(status: string): status is Level1MyWorkStatus {
  return (LEVEL1_MY_WORK_STATUSES as readonly string[]).includes(status);
}

export function isLevel1OpenQueueStatus(status: string): status is Level1OpenQueueStatus {
  return (LEVEL1_OPEN_QUEUE_STATUSES as readonly string[]).includes(status);
}

export function isLevel1AiDecisionStatus(status: string): status is Level1AiDecisionStatus {
  return (LEVEL1_AI_DECISION_STATUSES as readonly string[]).includes(status);
}

export function isLevel1DecisionStatus(status: string): status is Level1DecisionStatus {
  return (
    (LEVEL1_DECISION_STATUSES as readonly string[]).includes(status) ||
    isLevel1AiDecisionStatus(status)
  );
}

export function isDocumentsRequiredWorkflowId(workflowId: string | null | undefined): boolean {
  return workflowId === LEVEL1_COMPLIANCE_WORKBENCH.id;
}

export function isAiWorkbenchWorkflowId(workflowId: string | null | undefined): boolean {
  return workflowId === LEVEL1_AI_WORKBENCH.id;
}

export function isLevel1AiWorkbenchStatus(status: string): status is Level1AiWorkbenchStatus {
  return (LEVEL1_AI_WORKBENCH_STATUSES as readonly string[]).includes(status);
}

/** Workflows where Level 1 can still act on open matches (vs read-only destinations). */
export function isLevel1ActionableWorkflowId(workflowId: string | null | undefined): boolean {
  return isDocumentsRequiredWorkflowId(workflowId) || isAiWorkbenchWorkflowId(workflowId);
}

/**
 * Level 1 decision options for the given rows.
 * - New → Safe, Escalate to Team Lead
 * - AI-Suspected Safe → Safe (default), Escalate to Team Lead
 * - AI-Escalate → Escalate to Level 1 (default), Safe, Escalate to Team Lead
 * - Documents Required → Documents Uploaded only
 * - Mixed / empty → no options
 */
export function getLevel1DecisionStatusesForRows(
  rows: readonly { status: string }[],
): readonly Level1DecisionStatus[] {
  if (rows.length === 0) return [];
  const allDocumentsRequired = rows.every((row) => row.status === "Documents Required");
  if (allDocumentsRequired) return ["Documents Uploaded"];
  const allNew = rows.every((row) => row.status === "New");
  if (allNew) {
    return LEVEL1_DECISION_STATUSES.filter((status) => status !== "Documents Uploaded");
  }
  const allAiSuspectedSafe = rows.every((row) => row.status === LEVEL1_AI_SUSPECTED_SAFE_STATUS);
  if (allAiSuspectedSafe) {
    return ["Safe", "Escalate to Team Lead"];
  }
  const allAiEscalate = rows.every((row) => row.status === LEVEL1_AI_ESCALATE_STATUS);
  if (allAiEscalate) {
    return [LEVEL1_ESCALATE_TO_LEVEL1_DECISION, "Safe", "Escalate to Team Lead"];
  }
  return [];
}

/** Prefill Review panel Status / Reason / Comment from uniform AI Workbench selections. */
export function resolveAiReviewPrefill(
  rows: readonly { id: string; name: string; matchScore: number; status: string }[],
): { status: string | null; reason: string | null; comment: string } | null {
  if (rows.length === 0) return null;
  if (!rows.every((row) => isLevel1AiWorkbenchStatus(row.status))) return null;

  const comment = buildAiDecisionCommentForRows(rows);

  const allEscalate = rows.every((row) => row.status === LEVEL1_AI_ESCALATE_STATUS);
  if (allEscalate) {
    return {
      status: LEVEL1_ESCALATE_TO_LEVEL1_DECISION,
      reason: "Suspected Safe",
      comment,
    };
  }

  const allSuspectedSafe = rows.every((row) => row.status === LEVEL1_AI_SUSPECTED_SAFE_STATUS);
  if (allSuspectedSafe) {
    return {
      status: "Safe",
      reason: "See Comment Field",
      comment,
    };
  }

  // Mixed AI recommendations — leave fields empty for the analyst to choose.
  return { status: null, reason: null, comment: "" };
}

export function getReasonsForDecisionStatus(
  flowVariant: "level-1" | "level-2",
  status: string | null,
  selectedRows: readonly { status: string }[] = [],
): readonly string[] {
  if (!status) return [];
  if (flowVariant === "level-1") {
    if (
      status === "Safe" &&
      selectedRows.length > 0 &&
      selectedRows.every((row) => row.status === LEVEL1_AI_SUSPECTED_SAFE_STATUS)
    ) {
      return ["See Comment Field"];
    }
    return LEVEL1_STATUS_REASONS[status as Level1DecisionStatus] ?? [];
  }
  return LEVEL2_STATUS_REASONS[status as Level2DecisionStatus] ?? [];
}

export function getWorkflowForLevel1Status(status: string): { id: string; label: string } | null {
  if (status === "Documents Required") return LEVEL1_COMPLIANCE_WORKBENCH;
  if (isLevel1AiWorkbenchStatus(status)) return LEVEL1_AI_WORKBENCH;
  if (isLevel1DecisionStatus(status)) return LEVEL1_WORK_LOG_DESTINATION;
  return null;
}

/** Statuses that belong in a given Level 1 workflow group. */
export function getLevel1StatusesForWorkflowId(workflowId: string): Level1ScreeningStatus[] {
  if (workflowId === LEVEL1_COMPLIANCE_WORKBENCH.id) {
    return ["Documents Required"];
  }
  if (workflowId === LEVEL1_AI_WORKBENCH.id) {
    return [...LEVEL1_AI_WORKBENCH_STATUSES];
  }
  return [];
}

export function getWorkflowLabelById(workflowId: string): string | null {
  const match = LEVEL1_WORKFLOW_ORDER.find((workflow) => workflow.id === workflowId);
  return match?.label ?? null;
}
