import type { AceTimelineVariant } from "@ace-ds/components/organisms/AceTimeline/AceTimeline";
import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import { isLevel1OpenQueueStatus } from "./reviewDecisionConfig";

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
  if (status === "Documents Required") return "pending";
  if (status === "Confirmed Safe" || status === "Safe") return "safe";
  if (status === "Escalate" || status === "Escalate to Team Lead") return "escalation";
  if (status === "Documents Uploaded") return "blocked";
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

  if (row.reopenedFromConfirmedSafe) {
    const reviewer = (row.level1Reviewer ?? "Laura").toLowerCase();
    events.push({
      id: `${row.id}-confirmed-safe`,
      variant: "safe",
      label: "Confirmed Safe",
      timestamp: "15 Apr 2026 09:12:08",
      user: reviewer,
      details: {
        reason: row.level1Reason ?? "Confirmed Safe",
        comment: "--",
        listVersion: "20120612",
        timeViewed: "15 Apr 2026 09:12:08",
        daysOpen: "1 Day",
      },
    });
    events.push({
      id: `${row.id}-reopened`,
      variant: "system-action",
      label: "New",
      timestamp: "05 Oct 2025 17:33:23",
      user: reviewer,
      details: {
        reason: "New",
        comment: "Last user comment goes here",
        listVersion: "20120612",
        timeViewed: "05 Oct 2025 17:33:23",
        daysOpen: "2 Days",
      },
    });
    return events;
  }

  if (row.status === "Documents Required") {
    events.push({
      id: `${row.id}-documents-required`,
      variant: "pending",
      label: "Documents Required",
      timestamp: "14 Apr 2026 16:02:11",
      user: "loaduser",
      details: {
        reason: "Documents Required",
        comment: "Supporting documents requested before disposition",
        listVersion: "20120612",
        timeViewed: "--",
        daysOpen: "< 1 Day",
      },
    });
    return events;
  }

  if (!isLevel1OpenQueueStatus(row.status)) {
    const reviewer = row.decisionReviewer ?? row.level1Reviewer ?? "Laura";
    const reason = row.decisionReason ?? row.level1Reason ?? row.status;

    events.push({
      id: `${row.id}-review`,
      variant: variantForStatus(row.status),
      label:
        row.status === "Safe" && row.decisionReviewer ? "Confirmed Safe" : row.status,
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
