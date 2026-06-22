import type { AceTimelineItemData } from "@ace-ds/components/organisms/AceTimeline/AceTimeline";
import { ScreeningHistoryEventBody } from "../components/ScreeningHistoryEventBody";
import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import { getScreeningHistoryEventsForRow } from "./screeningHistoryData";

export function getScreeningHistoryTimelineItems(row: ScreeningResultRow): AceTimelineItemData[] {
  return getScreeningHistoryEventsForRow(row).map((event) => ({
    id: event.id,
    variant: event.variant,
    label: event.label,
    timestamp: event.timestamp,
    processName: `By ${event.user}`,
    body: <ScreeningHistoryEventBody details={event.details} />,
  }));
}
