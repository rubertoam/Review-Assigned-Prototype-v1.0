import { useCallback } from "react";

/**
 * Submits a review decision immediately (no “complete case” confirmation).
 * Kept as a hook so Level 1 / Level 2 share one call site for task-bar submit.
 */
export function useCompleteCaseSubmit({
  onSubmit,
}: {
  onSubmit: (status: string, reason: string) => void;
}): {
  submitReviewDecision: (status: string, reason: string) => void;
} {
  const submitReviewDecision = useCallback(
    (status: string, reason: string) => {
      onSubmit(status, reason);
    },
    [onSubmit],
  );

  return { submitReviewDecision };
}
