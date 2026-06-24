import { useMemo } from "react";
import { AceDropdownMenu } from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import {
  REVIEW_PANEL_VERSION_LABELS,
  type ReviewPanelVersion,
} from "../lib/reviewPanelVersions";

export function ReviewPanelVersionSelect({
  value,
  onChange,
}: {
  value: ReviewPanelVersion;
  onChange: (value: ReviewPanelVersion) => void;
}) {
  const items = useMemo(
    () =>
      (["a", "b"] as const).map((version) => ({
        type: "item" as const,
        label: REVIEW_PANEL_VERSION_LABELS[version],
        selected: value === version,
        onSelect: () => onChange(version),
      })),
    [onChange, value],
  );

  return (
    <AceDropdownMenu
      triggerLabel={REVIEW_PANEL_VERSION_LABELS[value]}
      triggerMode="field"
      size="sm"
      align="end"
      showChevron
      className="shrink-0 font-['Noto_Sans:Regular',sans-serif] font-normal"
      items={items}
    />
  );
}
