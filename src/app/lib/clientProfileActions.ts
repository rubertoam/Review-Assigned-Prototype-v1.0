/** Overflow menu + drawer section switcher labels (client profile three-dot). */
export const CLIENT_PROFILE_ACTIONS = [
  { id: "notes", label: "Notes" },
  { id: "documents", label: "Documents" },
  { id: "history", label: "History" },
  { id: "risk-rating", label: "Risk Rating" },
  { id: "networks", label: "Networks" },
  { id: "reports", label: "Reports" },
] as const;

export type ClientProfileActionId = (typeof CLIENT_PROFILE_ACTIONS)[number]["id"];

export function clientProfileActionLabel(id: ClientProfileActionId): string {
  return CLIENT_PROFILE_ACTIONS.find((action) => action.id === id)?.label ?? "";
}
