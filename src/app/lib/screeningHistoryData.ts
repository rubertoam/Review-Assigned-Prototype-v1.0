import type { AceTimelineVariant } from "@ace-ds/components/organisms/AceTimeline/AceTimeline";
import type { ScreeningResultRow } from "../components/ScreeningResultsTable";

export type ScreeningHistoryDetail = {
  reason: string;
  comment: string;
  listVersion: string;
  timeViewed: string;
  daysOpen: string;
};

export type ScreeningHistoryEventSource = {
  id: string;
  variant: AceTimelineVariant;
  label: string;
  timestamp: string;
  user: string;
  details: ScreeningHistoryDetail;
};

function variantForStatus(status: string): AceTimelineVariant {
  if (status === "New") return "system-action";
  if (status === "Confirmed Safe" || status === "Safe") return "safe";
  if (status === "Escalate") return "escalation";
  if (status === "False Positive") return "blocked";
  return "pending";
}

/** Mock screening history entries for a match row (prototype content). */
export function getScreeningHistoryEventsForRow(row: ScreeningResultRow): ScreeningHistoryEventSource[] {
  const events: ScreeningHistoryEventSource[] = [
    {
      id: `${row.id}-created`,
      variant: "system-action",
      label: "New",
      timestamp: "14 Apr 2026 13:34:40",
      user: "loaduser",
      details: {
        reason: "New",
        comment: "Pair was added",
        listVersion: "20120612",
        timeViewed: "--",
        daysOpen: "< 1 Day",
      },
    },
  ];

  if (row.status !== "New") {
    const reviewer = row.decisionReviewer ?? row.level1Reviewer ?? "Laura";
    const reason = row.decisionReason ?? row.level1Reason ?? row.status;

    events.push({
      id: `${row.id}-review`,
      variant: variantForStatus(row.status),
      label: row.status === "Safe" ? "Confirmed Safe" : row.status,
      timestamp: "15 Apr 2026 09:12:08",
      user: reviewer.toLowerCase(),
      details: {
        reason,
        comment: "--",
        listVersion: "20120612",
        timeViewed: "15 Apr 2026 09:12:08",
        daysOpen: "1 Day",
      },
    });
  }

  return events;
}
