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
      aria-label="Animation showing the mouse cursor hovering over the Work History icon in the page header"
    >
      <div className="absolute inset-0 flex items-start justify-center px-4 pt-10">
        <div
          className={cn(
            "relative w-full max-w-[22rem] overflow-visible rounded-[var(--radius-sm)]",
            "border border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)]",
            "shadow-[var(--ace-drop-shadow-xs)]",
          )}
        >
          <div className="flex items-center justify-end gap-2 px-3 py-3">
            <div className="size-2 shrink-0 rounded-full bg-[#87b531]" />
            <p
              className={cn(
                aceTypography(ACE_TYPE.footerRegular),
                "m-0 truncate text-[var(--screening-text-primary)]",
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
                  "work-log-intro-icon relative z-[1]",
                )}
              >
                <MaterialSymbol name="history" size="md" className="text-current" />
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
      </div>
    </div>
  );
}

/** First-submit coach mark introducing the Work Log audit trail. */
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
          this session. Open it anytime from the history icon next to Last updated in the Review
          Assigned page header.
        </p>
        <WorkLogOpenDemo />
      </div>
    </DialogModal>
  );
}
