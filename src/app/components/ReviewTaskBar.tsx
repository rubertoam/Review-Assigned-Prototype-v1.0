import { AceButton } from "@ace-ds/components/atoms/AceButton";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { TaskBarQuickClear } from "./TaskBarQuickClear";
import { cn } from "./ui/utils";
import type { ScreeningResultRow, ScreeningRowStatus } from "./ScreeningResultsTable";

interface ReviewTaskBarProps {
  flowVariant: "level-1" | "level-2";
  onShowReview: () => void;
  isReviewOpen: boolean;
  screeningSelectionCount: number;
  selectedRows: readonly ScreeningResultRow[];
  onDeselectAllScreening: () => void;
  onBulkQuickClear: (status: ScreeningRowStatus) => void;
  /** Three-dot drilldown is open — enable Show Review without requiring a checkbox selection. */
  hasDrilldownContext?: boolean;
}

export function ReviewTaskBar({
  flowVariant,
  onShowReview,
  isReviewOpen,
  screeningSelectionCount,
  selectedRows,
  onDeselectAllScreening,
  onBulkQuickClear,
  hasDrilldownContext = false,
}: ReviewTaskBarProps) {
  const isSelectionEmpty = screeningSelectionCount === 0;
  const isShowReviewDisabled = !isReviewOpen && isSelectionEmpty && !hasDrilldownContext;

  const showReviewButton = (
    <AceButton
      type="button"
      variant="primary"
      actionTone="primary"
      size="md"
      disabled={isShowReviewDisabled}
      onClick={onShowReview}
    >
      {isReviewOpen ? "Hide Review" : "Show Review"}
    </AceButton>
  );

  return (
    <div
      data-coach-target="task-bar"
      className={cn(
        "box-border flex h-[60px] shrink-0 items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-0",
        aceDropShadowXsClass,
      )}
    >
      <button
        type="button"
        className={cn(
          "inline-flex min-w-0 shrink items-center gap-2 rounded-[var(--radius-sm)] border-0 bg-transparent px-1 py-1 text-left",
          "text-[var(--color-text-brand)] transition-colors",
          "hover:bg-[var(--ace-sidebar-item-selected-bg)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
          "focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
        )}
      >
        <MaterialSymbol
          name="help"
          size="lg"
          className="shrink-0 text-current"
        />
        <span
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "truncate text-[var(--color-text-brand)]",
          )}
        >
          Online Help
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-3">
        {screeningSelectionCount > 0 ? (
          <>
            <span
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "whitespace-nowrap tabular-nums text-[var(--screening-text-secondary)]",
              )}
            >
              {screeningSelectionCount} selected
            </span>
            <AceButton
              type="button"
              variant="tertiary"
              size="md"
              onClick={onDeselectAllScreening}
            >
              Deselect all
            </AceButton>
          </>
        ) : null}
        <TaskBarQuickClear
          disabled={isSelectionEmpty}
          flowVariant={flowVariant}
          selectedRows={selectedRows}
          onSelect={onBulkQuickClear}
        />
        {isShowReviewDisabled ? (
          <AceTooltip>
            <AceTooltipTrigger asChild>
              <span className="inline-flex shrink-0">{showReviewButton}</span>
            </AceTooltipTrigger>
            <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
              Select one or more matches
            </AceTooltipContent>
          </AceTooltip>
        ) : (
          showReviewButton
        )}
      </div>
    </div>
  );
}
