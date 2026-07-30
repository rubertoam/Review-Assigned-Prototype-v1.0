import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** Looping how-to demo — cursor hovers the sidebar Work Log (history) icon. */
function WorkLogOpenDemo() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-md)] border border-solid",
        "border-[var(--screening-border-strong)] bg-[var(--screening-surface-muted)]",
        "aspect-[16/10] w-full",
      )}
      role="img"
      aria-label="Animation showing the mouse cursor hovering over the Work History icon in the sidebar header"
    >
      <div className="absolute inset-0 flex items-start justify-center px-6 pt-10">
        <div
          className={cn(
            "relative w-full max-w-[17rem] overflow-visible rounded-[var(--radius-sm)]",
            "border border-solid border-[var(--ace-sidebar-border)] bg-[var(--screening-surface)]",
            "shadow-[var(--ace-sidebar-shadow)]",
          )}
        >
          <div className="flex items-center gap-2 px-3 py-3">
            <div className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)] px-3 py-2">
              <p
                className={cn(
                  aceTypography(ACE_TYPE.footerRegular),
                  "m-0 truncate text-[var(--screening-text-primary)]",
                )}
                style={notoVar}
              >
                Level 1 Users
              </p>
            </div>
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
              {/* Cursor tip targets the history icon (same Material Symbol as the sidebar). */}
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
          <div className="border-t border-[var(--ace-sidebar-border)] px-3 py-3">
            <div className="mb-2 h-2 w-16 rounded bg-[var(--ace-neutral-200)]" />
            <div className="space-y-1.5">
              <div className="h-7 rounded-[var(--ace-sidebar-item-radius)] bg-[var(--ace-sidebar-item-selected-bg)]" />
              <div className="h-7 rounded-[var(--ace-sidebar-item-radius)] bg-[var(--ace-neutral-100)]" />
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
          this session. Open it anytime from the history icon in the top right of the Review
          Assigned sidebar.
        </p>
        <WorkLogOpenDemo />
      </div>
    </DialogModal>
  );
}
