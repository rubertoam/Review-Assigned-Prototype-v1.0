import { formatNoteCreatedAt } from "./clientNotesData";

/** Janet persona — always the Work Log reviewer in this prototype. */
export const WORK_LOG_REVIEWER = "Janet Analyst";

export type WorkLogEntry = {
  id: string;
  timestamp: string;
  /** Screening rule or workflow the match was cleared from. */
  origin: string;
  clientName: string;
  clientId: string;
  /** Match name — one log row per submitted match (no rollup). */
  matchName: string;
  /** Decision status the match was moved to (e.g. Escalate to Team Lead). */
  status: string;
  reviewer: string;
  /** Row id for this match — used to remove the entry on Undo. */
  sourceRowIds: string[];
  caseIndex: number;
};

export type WorkLogFilterDimension =
  | "origin"
  | "client"
  | "clientId"
  | "match"
  | "status"
  | "timestamp";

/** Past-tense / log-friendly label for the destination status. */
export function workLogStatusLabel(status: string): string {
  if (status === "Escalate to Team Lead") return "Escalated to Team Lead";
  if (status === "Safe") return "Safe";
  if (status === "Documents Uploaded") return "Documents Uploaded";
  return status;
}

export function createWorkLogEntriesForMatches({
  caseIndex,
  origin,
  clientName,
  clientId,
  status,
  matches,
}: {
  caseIndex: number;
  origin: string;
  clientName: string;
  clientId: string;
  status: string;
  matches: readonly { id: string; name: string }[];
}): WorkLogEntry[] {
  if (matches.length === 0) return [];
  const destinationStatus = status.trim();
  if (!destinationStatus) return [];
  const resolvedOrigin = origin.trim() || "—";
  const resolvedClientName = clientName.trim();
  const resolvedClientId = clientId.trim();
  const timestamp = formatNoteCreatedAt();
  const batch = Math.random().toString(36).slice(2, 8);
  return matches.map((match, index) => ({
    id: `work-log-${Date.now()}-${batch}-${index}`,
    timestamp,
    origin: resolvedOrigin,
    clientName: resolvedClientName || "—",
    clientId: resolvedClientId || "—",
    matchName: match.name.trim() || "—",
    status: destinationStatus,
    reviewer: WORK_LOG_REVIEWER,
    sourceRowIds: [match.id],
    caseIndex,
  }));
}

export function removeWorkLogEntriesForRowIds(
  entries: readonly WorkLogEntry[],
  rowIds: readonly string[],
): WorkLogEntry[] {
  if (rowIds.length === 0) return [...entries];
  const idSet = new Set(rowIds);
  return entries.filter((entry) => !entry.sourceRowIds.some((id) => idSet.has(id)));
}

export function uniqueWorkLogFilterValues(
  entries: readonly WorkLogEntry[],
  dimension: WorkLogFilterDimension,
): string[] {
  const values = new Set<string>();
  for (const entry of entries) {
    if (dimension === "origin" && entry.origin) values.add(entry.origin);
    if (dimension === "client" && entry.clientName) values.add(entry.clientName);
    if (dimension === "clientId" && entry.clientId) values.add(entry.clientId);
    if (dimension === "match" && entry.matchName) values.add(entry.matchName);
    if (dimension === "status" && entry.status) values.add(entry.status);
    if (dimension === "timestamp" && entry.timestamp) values.add(entry.timestamp);
  }
  return [...values].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function filterWorkLogEntries(
  entries: readonly WorkLogEntry[],
  selected: Readonly<Record<WorkLogFilterDimension, ReadonlySet<string>>>,
  searchQuery: string,
): WorkLogEntry[] {
  const query = searchQuery.trim().toLowerCase();
  return entries.filter((entry) => {
    if (selected.origin.size > 0 && !selected.origin.has(entry.origin)) return false;
    if (selected.client.size > 0 && !selected.client.has(entry.clientName)) return false;
    if (selected.clientId.size > 0 && !selected.clientId.has(entry.clientId)) return false;
    if (selected.match.size > 0 && !selected.match.has(entry.matchName)) return false;
    if (selected.status.size > 0 && !selected.status.has(entry.status)) return false;
    if (selected.timestamp.size > 0 && !selected.timestamp.has(entry.timestamp)) return false;
    if (!query) return true;
    const haystack = [
      entry.origin,
      entry.clientName,
      entry.clientId,
      entry.matchName,
      workLogStatusLabel(entry.status),
      entry.status,
      entry.reviewer,
      entry.timestamp,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
