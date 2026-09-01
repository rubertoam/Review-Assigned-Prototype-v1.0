/**
 * User flow registry.
 *
 * Development rules:
 * - Global changes → shared code under `src/app/components/`, `src/app/context/`, DS shims, etc.
 * - Flow-specific changes → edit only the target flow under `src/app/flows/<flow-id>/`.
 */

export const USER_FLOW_IDS = ["level-1", "level-2"] as const;

export type UserFlowId = (typeof USER_FLOW_IDS)[number];

export type UserFlowDefinition = {
  id: UserFlowId;
  label: string;
  description: string;
};

export const USER_FLOWS: readonly UserFlowDefinition[] = [
  {
    id: "level-1",
    label: "Level 1",
    description: "Workbench — primary UX concept flow",
  },
  {
    id: "level-2",
    label: "Level 2",
    description: "Workbench — Level 2 flow (cloned from Level 1)",
  },
];

export const DEFAULT_USER_FLOW_ID: UserFlowId = "level-1";

const FLOW_STORAGE_KEY = "review-user-flow";

export function isUserFlowId(value: string): value is UserFlowId {
  return (USER_FLOW_IDS as readonly string[]).includes(value);
}

export function readStoredUserFlowId(): UserFlowId {
  if (typeof window === "undefined") return DEFAULT_USER_FLOW_ID;
  const stored = localStorage.getItem(FLOW_STORAGE_KEY);
  return stored && isUserFlowId(stored) ? stored : DEFAULT_USER_FLOW_ID;
}

export function writeStoredUserFlowId(flowId: UserFlowId) {
  localStorage.setItem(FLOW_STORAGE_KEY, flowId);
}

export function getUserFlowDefinition(flowId: UserFlowId): UserFlowDefinition {
  return USER_FLOWS.find((flow) => flow.id === flowId) ?? USER_FLOWS[0];
}
