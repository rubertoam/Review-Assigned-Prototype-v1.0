import { useMemo } from "react";
import { AceInlineDrawer } from "@ace-ds/components/organisms/AceInlineDrawer/AceInlineDrawer";

export interface InsightsInlineDrawerProps {
  open: boolean;
  onClose: () => void;
}

function insightsDrawerWidths() {
  if (typeof window === "undefined") {
    return { defaultWidth: 480, minWidth: 280, maxWidth: 960 };
  }
  const viewport = window.innerWidth;
  return {
    defaultWidth: Math.round(viewport * 0.25),
    minWidth: Math.min(280, Math.round(viewport * 0.2)),
    maxWidth: Math.round(viewport * 0.6),
  };
}

/** Level 2 Insights panel — empty shell for now. Opens at 25% of the viewport. */
export function InsightsInlineDrawer({ open, onClose }: InsightsInlineDrawerProps) {
  const { defaultWidth, minWidth, maxWidth } = useMemo(() => insightsDrawerWidths(), []);

  return (
    <AceInlineDrawer
      open={open}
      onClose={onClose}
      title="Insights"
      widthStorageKey="review-assigned-insights-drawer-width-v25"
      defaultWidth={defaultWidth}
      minWidth={minWidth}
      maxWidth={maxWidth}
      footer={null}
    />
  );
}
