import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** Looping how-to demo — cursor hovers the page-header Work History (history) icon. */
function WorkLogOpenDemo() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-md)] border border-solid",
        "border-[var(--screening-border-strong)] bg-[var(--screening-surface-muted)]",
        "aspect-[16/10] w-full",
      )}
      role="img"
      aria-label="Animation showing the mouse cursor hovering over the Work History icon next to Last updated in the page header"
    >
      {/* Page-header strip — mirrors Level 1 PageHeader (title left, Last updated + history right). */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex items-center justify-between",
          "border-b border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)]",
          "px-3 py-2.5 sm:px-4",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={cn(
              aceTypography(ACE_TYPE.h6Bold),
              "m-0 truncate leading-[1.65] text-[var(--screening-text-primary)]",
            )}
            style={notoVar}
          >
            Review Assigned
          </p>
          <span
            className={cn(
              "shrink-0 rounded-[4px] bg-[var(--screening-surface-muted)] px-1.5 py-0.5",
              aceTypography(ACE_TYPE.footerRegular),
              "text-[var(--screening-text-secondary)]",
            )}
            style={notoVar}
          >
            Level 1
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="size-2 shrink-0 rounded-full bg-[#87b531]" />
          <p
            className={cn(
              aceTypography(ACE_TYPE.footerRegular),
              "m-0 hidden truncate text-[var(--screening-text-primary)] sm:block",
            )}
            style={notoVar}
          >
            Last updated 30 seconds ago
          </p>
          <div className="relative shrink-0">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className={cn(
                screeningToolbarIconButtonClass,
                "work-log-intro-icon relative z-[1] leading-none",
              )}
            >
              <MaterialSymbol name="history" size="md" weight={300} className="text-current" />
            </button>
            <div
              className={cn(
                "work-log-intro-tooltip pointer-events-none absolute right-0 top-[calc(100%+0.35rem)] z-[3]",
                "rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)]",
                "bg-[var(--screening-surface)] px-2 py-1 shadow-[var(--ace-drop-shadow-xs)]",
              )}
            >
              <p
                className={cn(
                  aceTypography(ACE_TYPE.footerRegular),
                  "m-0 whitespace-nowrap text-[var(--screening-text-primary)]",
                )}
                style={notoVar}
              >
                Work History
              </p>
            </div>
            {/* Cursor tip targets the history icon (same Material Symbol as the page header). */}
            <div
              className="work-log-intro-cursor pointer-events-none absolute z-[4]"
              aria-hidden
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
              >
                <path
                  fill="var(--screening-text-primary)"
                  stroke="#ffffff"
                  strokeWidth="1"
                  d="M5.5 3.2 18 12.1l-5.2 1.2 2.6 6.4-2.1.9-2.6-6.3-4.3 3.6z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Work History table — skeleton row blockouts (no real data/copy). */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 top-[3.25rem] flex flex-col gap-1.5",
          "bg-[var(--screening-surface)] px-3 py-2.5 sm:px-4",
        )}
        aria-hidden
      >
        <div className="flex items-center gap-2 border-b border-solid border-[var(--screening-border)] pb-1.5">
          <div className="h-1.5 w-[18%] rounded-sm bg-[var(--screening-border-strong)] opacity-50" />
          <div className="h-1.5 w-[22%] rounded-sm bg-[var(--screening-border-strong)] opacity-50" />
          <div className="h-1.5 w-[14%] rounded-sm bg-[var(--screening-border-strong)] opacity-50" />
          <div className="ml-auto h-1.5 w-[12%] rounded-sm bg-[var(--screening-border-strong)] opacity-50" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-[var(--radius-sm)] border border-solid",
              "border-[var(--screening-border)] bg-[var(--screening-surface-muted)] px-2 py-1.5",
            )}
          >
            <div className="h-1.5 w-[16%] rounded-sm bg-[var(--screening-border-strong)] opacity-40" />
            <div className="h-1.5 w-[28%] rounded-sm bg-[var(--screening-border-strong)] opacity-35" />
            <div className="h-1.5 w-[12%] rounded-sm bg-[var(--screening-border-strong)] opacity-30" />
            <div className="ml-auto h-1.5 w-[10%] rounded-sm bg-[var(--screening-border-strong)] opacity-35" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** First-submit coach mark introducing the Work History audit trail. */
export function WorkLogIntroModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title="Your Work History is ready"
      size="lg"
      fitContent
      primaryAction={{
        label: "Got it",
        onClick: onClose,
      }}
    >
      <div className="flex flex-col gap-4">
        <p
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "m-0 text-[var(--screening-text-primary)]",
          )}
          style={notoVar}
        >
          Submitted matches are recorded in the Work History so you can review what you completed
          this session. Open it anytime from the history icon next to Last updated in the page
          header.
        </p>
        <WorkLogOpenDemo />
      </div>
    </DialogModal>
  );
}
