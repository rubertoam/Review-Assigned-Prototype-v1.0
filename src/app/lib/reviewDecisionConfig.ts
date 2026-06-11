export const LEVEL1_DECISION_STATUSES = [
  "Escalate",
  "Flag for EDD",
  "Research (Internal)",
  "Research (External)",
  "Route to Supervisor",
] as const;

export type Level1DecisionStatus = (typeof LEVEL1_DECISION_STATUSES)[number];

export type Level1ScreeningStatus = "New" | Level1DecisionStatus;

export const LEVEL2_DECISION_STATUSES = [
  "Confirmed Hit",
  "Safe",
  "False Positive",
] as const;

export type Level2DecisionStatus = (typeof LEVEL2_DECISION_STATUSES)[number];

export const LEVEL1_STATUS_REASONS: Record<Level1DecisionStatus, readonly string[]> = {
  Escalate: ["Escalate"],
  "Flag for EDD": [
    "See Comment Field",
    "Information is Required",
    "None",
    "Suspected Hit",
    "Suspected Safe",
  ],
  "Research (External)": [
    "See Comment Field",
    "None",
    "Received from External Entity",
    "Sent to External Entity",
  ],
  "Research (Internal)": [
    "See Comment Field",
    "Information is Required",
    "None",
    "Suspected Hit",
    "Suspected Safe",
  ],
  "Route to Supervisor": [
    "See Comment Field",
    "Information is Required",
    "None",
    "Suspected Hit",
    "Suspected Safe",
  ],
};

export const LEVEL2_STATUS_REASONS: Record<Level2DecisionStatus, readonly string[]> = {
  "Confirmed Hit": [
    "Audit Confirmed",
    "Audit Rejected",
    "See Comment Field",
    "Confirmed Hit",
    "None",
    "Prior Hit",
  ],
  Safe: [
    "Audit Confirmed",
    "Audit Rejected",
    "See Comment Field",
    "Confirmed Hit",
    "None",
    "Prior Hit",
  ],
  "False Positive": ["None"],
};

export const LEVEL1_STATUS_DISPLAY_ORDER: Level1ScreeningStatus[] = [
  "New",
  ...LEVEL1_DECISION_STATUSES,
];

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
