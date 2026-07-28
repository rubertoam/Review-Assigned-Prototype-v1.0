import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import { Checkbox } from "./ui/checkbox";

/** In-memory only — refresh clears “don’t show again”. */
let skipCompleteCaseDialog = false;

export const SKIP_COMPLETE_CASE_DIALOG_KEY = "finscan-review-assigned-skip-complete-case-dialog";

export function shouldSkipCompleteCaseDialog(): boolean {
  return skipCompleteCaseDialog;
}

export function setSkipCompleteCaseDialog(skip: boolean) {
  skipCompleteCaseDialog = skip;
}

const bodyBtnClass = cn(
  aceTypography(ACE_TYPE.p1Bold),
  "inline-flex items-center justify-center rounded-[var(--dialog-modal-btn-radius)] px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dialog-modal-primary)] focus-visible:ring-offset-2",
);

export interface CompleteCaseConfirmDialogProps {
  open: boolean;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CompleteCaseConfirmDialog({
  open,
  dontShowAgain,
  onDontShowAgainChange,
  onConfirm,
  onCancel,
}: CompleteCaseConfirmDialogProps) {
  return (
    <DialogModal
      open={open}
      onClose={onCancel}
      title="Clear all screening results?"
      size="md"
      fitContent
      description={
        <>
          All screening results for this case will be updated with your selected status and
          reason. The case will move to{" "}
          <span className={cn(aceTypography(ACE_TYPE.p1Bold), "text-[var(--dialog-modal-body)]")}>
            Done
          </span>
          , where you can review it at any time.
        </>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-[var(--dialog-modal-footer-btn-gap)]">
          <label
            htmlFor="complete-case-dont-show-again"
            className="mr-auto flex cursor-pointer items-center gap-2"
          >
            <Checkbox
              id="complete-case-dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(value) => onDontShowAgainChange(value === true)}
              aria-describedby="complete-case-dont-show-again-label"
            />
            <span
              id="complete-case-dont-show-again-label"
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "text-[var(--dialog-modal-body)] select-none",
              )}
            >
              Don&apos;t show again
            </span>
          </label>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              bodyBtnClass,
              "border border-solid border-[var(--dialog-modal-outline-border)] bg-[var(--dialog-modal-surface)] text-[var(--dialog-modal-outline-text)] hover:bg-[var(--dialog-modal-outline-hover-bg)]",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              bodyBtnClass,
              "bg-[var(--dialog-modal-primary)] text-[var(--dialog-modal-on-primary)] hover:bg-[var(--dialog-modal-primary-hover)]",
            )}
          >
            OK
          </button>
        </div>
      }
    />
  );
}
