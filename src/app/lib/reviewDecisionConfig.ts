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

/** Open statuses that still need a Level 1 action (My Work or Documents Required workflow). */
export const LEVEL1_OPEN_QUEUE_STATUSES = ["New", "Documents Required"] as const;

export type Level1OpenQueueStatus = (typeof LEVEL1_OPEN_QUEUE_STATUSES)[number];

export const LEVEL1_DECISION_STATUSES = [
  ...LEVEL1_CONFIRMED_STATUSES,
  ...LEVEL1_IN_PROCESS_STATUSES,
] as const;

export type Level1DecisionStatus = (typeof LEVEL1_DECISION_STATUSES)[number];

export type Level1ScreeningStatus = Level1OpenQueueStatus | Level1DecisionStatus;

/** Workflow group for matches awaiting document upload. */
export const LEVEL1_DOCUMENTS_REQUIRED_WORKFLOW = {
  id: "documents-required",
  label: "Documents Required",
} as const;

/** Destination workbench when a match is moved into a Level 1 decision status. */
export const LEVEL1_STATUS_WORKFLOW: Record<
  Level1DecisionStatus,
  { id: string; label: string }
> = {
  Safe: {
    id: "operator-level-1-workbench",
    label: "Operator Level 1 Workbench",
  },
  "Escalate to Team Lead": {
    id: "operator-level-2-workbench",
    label: "Operator Level 2 Workbench",
  },
  "Documents Uploaded": {
    id: "compliance-workbench",
    label: "Compliance Workbench",
  },
};

/** Stable sidebar order for Level 1 workflow groups. */
export const LEVEL1_WORKFLOW_ORDER: readonly { id: string; label: string }[] = [
  LEVEL1_DOCUMENTS_REQUIRED_WORKFLOW,
  LEVEL1_STATUS_WORKFLOW.Safe,
  LEVEL1_STATUS_WORKFLOW["Escalate to Team Lead"],
  LEVEL1_STATUS_WORKFLOW["Documents Uploaded"],
];

export const LEVEL2_DECISION_STATUSES = ["Safe", "False Positive", "Remediate"] as const;

export type Level2DecisionStatus = (typeof LEVEL2_DECISION_STATUSES)[number];

/** L2 "Remediate" sends a match back to Level 1 and reopens it for re-review. */
export const LEVEL2_REMEDIATE_STATUS = "Remediate" as const;

export const LEVEL1_STATUS_REASONS: Record<Level1DecisionStatus, readonly string[]> = {
  Safe: ["Safe"],
  "Escalate to Team Lead": ["Escalate to Team Lead"],
  "Documents Uploaded": ["Documents Uploaded"],
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

export function isLevel1DecisionStatus(status: string): status is Level1DecisionStatus {
  return (LEVEL1_DECISION_STATUSES as readonly string[]).includes(status);
}

export function isDocumentsRequiredWorkflowId(workflowId: string | null | undefined): boolean {
  return workflowId === LEVEL1_DOCUMENTS_REQUIRED_WORKFLOW.id;
}

/**
 * Level 1 decision options for the given rows.
 * - New → Safe, Escalate to Team Lead
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
  return [];
}

export function getReasonsForDecisionStatus(
  flowVariant: "level-1" | "level-2",
  status: string | null,
): readonly string[] {
  if (!status) return [];
  if (flowVariant === "level-1") {
    return LEVEL1_STATUS_REASONS[status as Level1DecisionStatus] ?? [];
  }
  return LEVEL2_STATUS_REASONS[status as Level2DecisionStatus] ?? [];
}

export function getWorkflowForLevel1Status(status: string): { id: string; label: string } | null {
  if (status === "Documents Required") return LEVEL1_DOCUMENTS_REQUIRED_WORKFLOW;
  if (!isLevel1DecisionStatus(status)) return null;
  return LEVEL1_STATUS_WORKFLOW[status];
}

/** Statuses that belong in a given Level 1 workflow group. */
export function getLevel1StatusesForWorkflowId(workflowId: string): Level1ScreeningStatus[] {
  if (workflowId === LEVEL1_DOCUMENTS_REQUIRED_WORKFLOW.id) {
    return ["Documents Required"];
  }
  return LEVEL1_DECISION_STATUSES.filter(
    (status) => LEVEL1_STATUS_WORKFLOW[status].id === workflowId,
  );
}

export function getWorkflowLabelById(workflowId: string): string | null {
  const match = LEVEL1_WORKFLOW_ORDER.find((workflow) => workflow.id === workflowId);
  return match?.label ?? null;
}
