import { useMemo } from "react";
import { AceTimeline } from "@ace-ds/components/organisms/AceTimeline/AceTimeline";
import { getScreeningHistoryTimelineItems } from "../lib/screeningHistoryTimeline";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

export function ScreeningHistoryTimelineView({ row }: { row: ScreeningResultRow }) {
  const timelineItems = useMemo(() => getScreeningHistoryTimelineItems(row), [row]);
  return <AceTimeline items={timelineItems} />;
}
