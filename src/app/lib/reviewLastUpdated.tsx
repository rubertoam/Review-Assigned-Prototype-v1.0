import type { ReactNode } from "react";
import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import { getScreeningHistoryEventsForRow } from "./screeningHistoryData";

export const REVIEW_EMPTY_FIELD = "--";
export const REVIEW_EMPTY_FIELD_CLASS = "text-[#949baa] dark:text-[#6a7285]";
export const REVIEW_MULTIPLE_MESSAGE =
  "Multiple Matches selected. Open Screening History to review.";

export type ReviewLastUpdatedFields = {
  user: string;
  comment: string;
  modifiedDate: string;
  matchStatusText: string;
  matchStatusFrom?: string;
  matchStatusTo?: string;
};

function formatHistoryUserDisplay(user: string): string {
  if (user === "loaduser") return "System";
  const normalized = user.trim().toLowerCase();
  if (normalized === "laura") return "Laura Leader";
  return user
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function displayComment(comment: string): string {
  const trimmed = comment.trim();
  if (!trimmed || trimmed === "--") return REVIEW_EMPTY_FIELD;
  return comment;
}

export function getReviewLastUpdatedForRow(row: ScreeningResultRow): ReviewLastUpdatedFields {
  const events = getScreeningHistoryEventsForRow(row);
  const latest = events[events.length - 1];
  const previous = events.length > 1 ? events[events.length - 2] : null;

  return {
    user: formatHistoryUserDisplay(latest.user),
    comment: displayComment(latest.details.comment),
    modifiedDate: latest.timestamp,
    matchStatusText: previous ? `${previous.label} → ${latest.label}` : latest.label,
    matchStatusFrom: previous?.label,
    matchStatusTo: latest.label,
  };
}

export function isEmptyFieldValue(value: string): boolean {
  return value === REVIEW_EMPTY_FIELD;
}

export function resolveReviewLastUpdatedFields(
  selectedRows: readonly ScreeningResultRow[],
): ReviewLastUpdatedFields | null {
  if (selectedRows.length !== 1) return null;
  return getReviewLastUpdatedForRow(selectedRows[0]);
}

export function renderFieldValue(value: string): ReactNode {
  if (isEmptyFieldValue(value)) {
    return <span className={REVIEW_EMPTY_FIELD_CLASS}>{value}</span>;
  }
  return value;
}

export function matchStatusLabelClass(label: string): string {
  if (label === "New") return "font-bold text-[var(--screening-pill-new-label)]";
  if (label === "Confirmed Safe" || label === "Safe") return "font-bold text-[#87b531]";
  if (label === "Escalate") return "font-bold text-[#92278f]";
  if (label === "False Positive") return "font-bold text-[#9e2a2a]";
  return "font-bold";
}

export function renderMatchStatusValue(fields: ReviewLastUpdatedFields): ReactNode {
  if (isEmptyFieldValue(fields.matchStatusText)) {
    return renderFieldValue(fields.matchStatusText);
  }
  if (fields.matchStatusFrom && fields.matchStatusTo) {
    return (
      <>
        <span className={matchStatusLabelClass(fields.matchStatusFrom)}>
          {fields.matchStatusFrom}
        </span>
        <span aria-hidden> → </span>
        <span className={matchStatusLabelClass(fields.matchStatusTo)}>{fields.matchStatusTo}</span>
      </>
    );
  }
  return (
    <span className={matchStatusLabelClass(fields.matchStatusTo ?? fields.matchStatusText)}>
      {fields.matchStatusText}
    </span>
  );
}
