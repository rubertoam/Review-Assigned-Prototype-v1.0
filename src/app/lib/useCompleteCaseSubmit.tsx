import { useCallback, useState, type ReactNode } from "react";
import {
  CompleteCaseConfirmDialog,
  shouldSkipCompleteCaseDialog,
  setSkipCompleteCaseDialog,
} from "../components/CompleteCaseConfirmDialog";
import {
  willCompleteCaseOnSubmit,
  type ScreeningResultRow,
} from "../components/ScreeningResultsTable";

type PendingSubmit = { status: string; reason: string };

export function useCompleteCaseSubmit({
  rows,
  selectedIds,
  flowVariant,
  onSubmit,
}: {
  rows: ScreeningResultRow[];
  selectedIds: Set<string>;
  flowVariant: "level-1" | "level-2";
  onSubmit: (status: string, reason: string) => void;
}): {
  submitReviewDecision: (status: string, reason: string) => void;
  completeCaseConfirmDialog: ReactNode;
} {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(null);

  const finalizeSubmit = useCallback(
    (status: string, reason: string) => {
      onSubmit(status, reason);
    },
    [onSubmit],
  );

  const submitReviewDecision = useCallback(
    (status: string, reason: string) => {
      const completingCase = willCompleteCaseOnSubmit(rows, selectedIds, flowVariant);
      if (completingCase && !shouldSkipCompleteCaseDialog()) {
        setPendingSubmit({ status, reason });
        setConfirmOpen(true);
        return;
      }
      finalizeSubmit(status, reason);
    },
    [rows, selectedIds, flowVariant, finalizeSubmit],
  );

  const handleConfirm = useCallback(() => {
    if (dontShowAgain) {
      setSkipCompleteCaseDialog(true);
    }
    if (pendingSubmit) {
      finalizeSubmit(pendingSubmit.status, pendingSubmit.reason);
    }
    setPendingSubmit(null);
    setConfirmOpen(false);
    setDontShowAgain(false);
  }, [dontShowAgain, pendingSubmit, finalizeSubmit]);

  const handleCancel = useCallback(() => {
    setPendingSubmit(null);
    setConfirmOpen(false);
    setDontShowAgain(false);
  }, []);

  const completeCaseConfirmDialog = (
    <CompleteCaseConfirmDialog
      open={confirmOpen}
      dontShowAgain={dontShowAgain}
      onDontShowAgainChange={setDontShowAgain}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { submitReviewDecision, completeCaseConfirmDialog };
}
