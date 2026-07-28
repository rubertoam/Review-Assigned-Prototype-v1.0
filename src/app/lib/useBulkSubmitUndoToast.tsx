import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AceToast } from "@ace-ds/components/molecules/AceToast/AceToast";
import { aceTypography, ACE_TYPE } from "./aceTypography";
import { cn } from "../components/ui/utils";
import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import {
  ToastMotionShell,
  TOAST_DURATION_MS,
  toastViewportClass,
} from "./toastPresentation";
import { getWorkflowForLevel1Status } from "./reviewDecisionConfig";

/** Default screening rule name shown in undo-success copy (matches activity feed seed data). */
export const DEFAULT_SCREENING_RULE_LABEL = "Sanctioned Matches";

export type SubmitUndoSnapshot = {
  caseIndex: number;
  /** Previous row objects for ids that were submitted (pre-decision). */
  previousRowsById: Record<string, ScreeningResultRow>;
  matchCount: number;
  /** Case / client display name (used for single-match toast copy). */
  caseName: string;
  workflowLabel: string;
  screeningRuleLabel: string;
};

type SubmitToastState = SubmitUndoSnapshot & {
  kind: "submit";
  id: number;
};

type UndoSuccessToastState = {
  kind: "undo-success";
  id: number;
  matchCount: number;
  screeningRuleLabel: string;
};

type ActiveToast = SubmitToastState | UndoSuccessToastState;

function workflowLabelForSubmit(
  flowVariant: "level-1" | "level-2",
  status: string,
): string {
  if (flowVariant === "level-1") {
    return getWorkflowForLevel1Status(status)?.label ?? status;
  }
  if (status === "Remediate") return "Level 1 Remediation";
  return status;
}

export function buildSubmitUndoSnapshot({
  caseIndex,
  caseName,
  rows,
  selectedIds,
  status,
  flowVariant,
  screeningRuleLabel = DEFAULT_SCREENING_RULE_LABEL,
}: {
  caseIndex: number;
  caseName: string;
  rows: readonly ScreeningResultRow[];
  selectedIds: ReadonlySet<string>;
  status: string;
  flowVariant: "level-1" | "level-2";
  screeningRuleLabel?: string;
}): SubmitUndoSnapshot {
  const previousRowsById: Record<string, ScreeningResultRow> = {};
  for (const row of rows) {
    if (selectedIds.has(row.id)) {
      previousRowsById[row.id] = { ...row };
    }
  }
  return {
    caseIndex,
    caseName,
    previousRowsById,
    matchCount: selectedIds.size,
    workflowLabel: workflowLabelForSubmit(flowVariant, status),
    screeningRuleLabel,
  };
}

function BoldHighlight({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        aceTypography(ACE_TYPE.p1Bold),
        "text-[var(--screening-text-primary)]",
      )}
    >
      {children}
    </span>
  );
}

function SubmitSuccessToast({
  toast,
  onDismissed,
  onUndo,
}: {
  toast: SubmitToastState;
  onDismissed: () => void;
  /** Called when Undo is pressed; should stash restore data then trigger dismiss. */
  onUndo: (requestDismiss: () => void) => void;
}) {
  const message =
    toast.matchCount === 1 ? (
      <>
        Case escalated: {toast.caseName} sent to{" "}
        <BoldHighlight>{toast.workflowLabel}.</BoldHighlight>
      </>
    ) : (
      <>
        {toast.matchCount} matches sent to workflow{" "}
        <BoldHighlight>{toast.workflowLabel}.</BoldHighlight>
      </>
    );

  return (
    <ToastMotionShell onDismissed={onDismissed} durationMs={TOAST_DURATION_MS}>
      {(progress, requestDismiss) => (
        <AceToast
          tone="success"
          layout="default"
          title="Success!"
          message={message}
          actionLabel="Undo"
          onAction={() => onUndo(requestDismiss)}
          onDismiss={requestDismiss}
          progress={progress}
        />
      )}
    </ToastMotionShell>
  );
}

function UndoSuccessToast({
  toast,
  onDismissed,
}: {
  toast: UndoSuccessToastState;
  onDismissed: () => void;
}) {
  const message =
    toast.matchCount === 1 ? (
      <>
        1 match submission for the <BoldHighlight>{toast.screeningRuleLabel}</BoldHighlight>{" "}
        screening rule has been undone.
      </>
    ) : (
      <>
        {toast.matchCount} match submissions for the{" "}
        <BoldHighlight>{toast.screeningRuleLabel}</BoldHighlight> screening rule have been
        undone.
      </>
    );

  return (
    <ToastMotionShell onDismissed={onDismissed} durationMs={TOAST_DURATION_MS}>
      {(progress, requestDismiss) => (
        <AceToast
          tone="success"
          layout="default"
          title="Undo Success!"
          message={message}
          onDismiss={requestDismiss}
          progress={progress}
        />
      )}
    </ToastMotionShell>
  );
}

export function useBulkSubmitUndoToast({
  restoreRows,
}: {
  restoreRows: (
    caseIndex: number,
    previousRowsById: Record<string, ScreeningResultRow>,
  ) => void;
}): {
  showBulkSubmitToast: (snapshot: SubmitUndoSnapshot) => void;
  commitPendingToast: () => void;
  bulkSubmitToast: ReactNode;
} {
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const idRef = useRef(0);
  const pendingUndoRef = useRef<SubmitToastState | null>(null);
  const activeToastRef = useRef<ActiveToast | null>(null);
  activeToastRef.current = activeToast;

  const commitPendingToast = useCallback(() => {
    pendingUndoRef.current = null;
    setActiveToast(null);
  }, []);

  const showBulkSubmitToast = useCallback((snapshot: SubmitUndoSnapshot) => {
    if (snapshot.matchCount < 1) return;
    pendingUndoRef.current = null;
    idRef.current += 1;
    setActiveToast({ ...snapshot, kind: "submit", id: idRef.current });
  }, []);

  const handleSubmitDismissed = useCallback(() => {
    const pendingUndo = pendingUndoRef.current;
    pendingUndoRef.current = null;
    if (pendingUndo) {
      restoreRows(pendingUndo.caseIndex, pendingUndo.previousRowsById);
      idRef.current += 1;
      setActiveToast({
        kind: "undo-success",
        id: idRef.current,
        matchCount: pendingUndo.matchCount,
        screeningRuleLabel: pendingUndo.screeningRuleLabel,
      });
      return;
    }
    setActiveToast(null);
  }, [restoreRows]);

  const handleUndoSuccessDismissed = useCallback(() => {
    setActiveToast(null);
  }, []);

  const handleUndo = useCallback((requestDismiss: () => void) => {
    const current = activeToastRef.current;
    if (current?.kind === "submit") {
      pendingUndoRef.current = current;
    }
    requestDismiss();
  }, []);

  const bulkSubmitToast = activeToast ? (
    <div className={toastViewportClass}>
      {activeToast.kind === "submit" ? (
        <SubmitSuccessToast
          key={activeToast.id}
          toast={activeToast}
          onDismissed={handleSubmitDismissed}
          onUndo={handleUndo}
        />
      ) : (
        <UndoSuccessToast
          key={activeToast.id}
          toast={activeToast}
          onDismissed={handleUndoSuccessDismissed}
        />
      )}
    </div>
  ) : null;

  return { showBulkSubmitToast, commitPendingToast, bulkSubmitToast };
}
