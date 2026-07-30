import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { TaskBarQuickClear } from "./TaskBarQuickClear";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
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
  /** Opens the Work History modal — Level 1 A/B with the sidebar history control. */
  onOpenWorkLog?: () => void;
}

export function ReviewTaskBar({
  flowVariant,
  onShowReview,
  isReviewOpen,
  screeningSelectionCount,
  selectedRows,
  onDeselectAllScreening,
  onBulkQuickClear,
  onOpenWorkLog,
}: ReviewTaskBarProps) {
  const isSelectionEmpty = screeningSelectionCount === 0;
  const isShowReviewDisabled = !isReviewOpen && isSelectionEmpty;

  const showReviewButton = (
    <button
      type="button"
      disabled={isShowReviewDisabled}
      onClick={onShowReview}
      className={cn(
        "shrink-0 rounded-[4px] px-4 py-2 transition-colors",
        isShowReviewDisabled
          ? "cursor-not-allowed bg-[#3d2e8a] opacity-50"
          : "cursor-pointer bg-[#3d2e8a] hover:bg-[#523eb9]",
      )}
    >
      <p
        className="font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[14px] text-white"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
      >
        {isReviewOpen ? "Hide Review" : "Show Review"}
      </p>
    </button>
  );

  const workHistoryButton =
    onOpenWorkLog != null ? (
      <div className="inline-flex size-8 shrink-0 items-center justify-center leading-none">
        <AceTooltip>
          <AceTooltipTrigger asChild>
            <button
              type="button"
              aria-label="Work History"
              className={cn(screeningToolbarIconButtonClass, "leading-none")}
              onClick={onOpenWorkLog}
            >
              <MaterialSymbol name="history" size="md" weight={300} className="text-current" />
            </button>
          </AceTooltipTrigger>
          <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
            Work History
          </AceTooltipContent>
        </AceTooltip>
      </div>
    ) : null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-4 rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-4",
        workHistoryButton != null ? "justify-between" : "justify-end",
        aceDropShadowXsClass,
      )}
    >
      {workHistoryButton}
      <div className="flex shrink-0 items-center gap-3">
        {screeningSelectionCount > 0 ? (
          <>
            <span
              className="whitespace-nowrap font-['Noto_Sans:Regular',sans-serif] text-[13px] tabular-nums text-[var(--screening-text-secondary)]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              {screeningSelectionCount} selected
            </span>
            <button
              type="button"
              onClick={onDeselectAllScreening}
              className="rounded-[4px] px-2 py-1.5 font-['Noto_Sans:SemiBold',sans-serif] text-[13px] text-[var(--screening-primary)] transition-colors hover:bg-[var(--screening-primary-soft-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              Deselect all
            </button>
          </>
        ) : null}
        <TaskBarQuickClear
          disabled={isSelectionEmpty}
          flowVariant={flowVariant}
          selectedRows={selectedRows}
          onSelect={onBulkQuickClear}
        />
        {isShowReviewDisabled ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex shrink-0">{showReviewButton}</span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              hideArrow
              className={cn(
                aceTypography(ACE_TYPE.captionSemiBold),
                "border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-[var(--ace-drop-shadow-xs)]",
              )}
            >
              Select one or more matches
            </TooltipContent>
          </Tooltip>
        ) : (
          showReviewButton
        )}
      </div>
    </div>
  );
}
