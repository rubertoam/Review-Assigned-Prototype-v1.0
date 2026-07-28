import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AceToast } from "@ace-ds/components/molecules/AceToast/AceToast";
import { aceTypography, ACE_TYPE } from "./aceTypography";
import { cn } from "../components/ui/utils";
import { casesData, clientProfileForCaseIndex } from "./reviewCaseData";
import {
  ToastMotionShell,
  TOAST_DURATION_MS,
  toastViewportClass,
} from "./toastPresentation";

const SHOW_AFTER_MS = 10_000;
const EXPIRING_IN_LABEL = "15 minutes";

/** Case index used for the prototype overdue warning toast (John Smith). */
export const OVERDUE_WARNING_CASE_INDEX = 0;

function OverdueWarningToastCard({
  caseName,
  expiringIn,
  onDismissed,
}: {
  caseName: string;
  expiringIn: string;
  onDismissed: () => void;
}) {
  const message = (
    <>
      <span
        className={cn(
          aceTypography(ACE_TYPE.p1Bold),
          "text-[var(--screening-text-primary)]",
        )}
      >
        {caseName}
      </span>{" "}
      has a Review Target that is{" "}
      <span
        className={cn(
          aceTypography(ACE_TYPE.p1Bold),
          "text-[var(--screening-text-primary)]",
        )}
      >
        {expiringIn}
      </span>{" "}
      from expiring.
    </>
  );

  return (
    <ToastMotionShell onDismissed={onDismissed} durationMs={TOAST_DURATION_MS}>
      {(progress, requestDismiss) => (
        <AceToast
          tone="warning"
          layout="default"
          title="Overdue Warning"
          message={message}
          onDismiss={requestDismiss}
          progress={progress}
        />
      )}
    </ToastMotionShell>
  );
}

/** Shows an overdue-warning toast 10s after the Level 1 prototype mounts. */
export function useOverdueWarningToast(): ReactNode {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const profile = clientProfileForCaseIndex(OVERDUE_WARNING_CASE_INDEX);
    if (!profile.reviewTargetOverdue) return;

    const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDismissed = useCallback(() => setVisible(false), []);

  if (!visible) return null;

  const caseName = casesData[OVERDUE_WARNING_CASE_INDEX]?.name ?? "Case";

  return (
    <div className={toastViewportClass}>
      <OverdueWarningToastCard
        caseName={caseName}
        expiringIn={EXPIRING_IN_LABEL}
        onDismissed={handleDismissed}
      />
    </div>
  );
}
