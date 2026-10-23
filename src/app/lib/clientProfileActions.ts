import { initialDocumentsForCase } from "./clientDocumentsData";
import { initialHistoryVersionsForCase } from "./clientHistoryData";
import { initialNetworksForCase } from "./clientNetworksData";

/** Overflow menu + drawer section switcher labels (client profile three-dot). */
export const CLIENT_PROFILE_ACTIONS = [
  { id: "notes", label: "Notes" },
  { id: "documents", label: "Documents" },
  { id: "history", label: "Client History" },
  { id: "risk-rating", label: "Risk Rating" },
  { id: "networks", label: "Networks" },
  { id: "reports", label: "Reports" },
] as const;

export type ClientProfileActionId = (typeof CLIENT_PROFILE_ACTIONS)[number]["id"];

export type ClientProfileActionCounts = {
  documents: number;
  history: number;
  networks: number;
};

export function clientProfileActionLabel(id: ClientProfileActionId): string {
  return CLIENT_PROFILE_ACTIONS.find((action) => action.id === id)?.label ?? "";
}

/** Seeded item counts for Documents / History / Networks for a case. */
export function clientProfileActionCounts(caseIndex: number): ClientProfileActionCounts {
  return {
    documents: initialDocumentsForCase(caseIndex).length,
    history: initialHistoryVersionsForCase(caseIndex).length,
    networks: initialNetworksForCase(caseIndex).length,
  };
}

/** Menu label with live count for Documents, History, and Networks (matches drilldown tab style). */
export function clientProfileActionMenuLabel(
  id: ClientProfileActionId,
  counts: ClientProfileActionCounts,
): string {
  const base = clientProfileActionLabel(id);
  if (id === "documents") return `${base} (${counts.documents})`;
  if (id === "history") return `${base} (${counts.history})`;
  if (id === "networks") return `${base} (${counts.networks})`;
  return base;
}
