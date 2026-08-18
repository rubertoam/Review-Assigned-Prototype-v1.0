import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

export type ReviewOnboardingCoachStepId =
  | "sidebar-toggle"
  | "assignment"
  | "case-list"
  | "client-profile"
  | "matches"
  | "task-bar"
  | "dark-mode";

type CoachStep = {
  id: ReviewOnboardingCoachStepId;
  title: string;
  description: string;
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
  /** Keep the nav sidebar open so this target is visible. */
  requiresSidebarOpen?: boolean;
  /** Ensure a case/detail panel is visible for this step. */
  requiresDetail?: boolean;
};

const COACH_STEPS: readonly CoachStep[] = [
  {
    id: "sidebar-toggle",
    title: "Sidebar",
    description: "Use this icon to open or close the sidebar anytime.",
    side: "bottom",
    align: "start",
  },
  {
    id: "assignment",
    title: "Assigned Work",
    description: "You can view your assigned work here.",
    side: "right",
    align: "start",
    requiresSidebarOpen: true,
  },
  {
    id: "case-list",
    title: "Clients",
    description:
      "Browse client profiles and select one to review match alerts.",
    side: "right",
    align: "start",
  },
  {
    id: "client-profile",
    title: "Client profile",
    description:
      "Review key client details here while you work through alerts.",
    side: "bottom",
    align: "start",
    requiresDetail: true,
  },
  {
    id: "matches",
    title: "Matches",
    description:
      "Review Match Alerts in the table. Use the three dot menu to review the List Profile, Match History, Match Simulator and more.",
    side: "bottom",
    align: "center",
    requiresDetail: true,
  },
  {
    id: "task-bar",
    title: "Task bar",
    description:
      "Use the task bar to open the Review Panel to clear alerts and review match activity.",
    side: "top",
    align: "end",
    requiresDetail: true,
  },
  {
    id: "dark-mode",
    title: "Dark mode",
    description:
      "Prefer a darker workspace? Open your profile menu and turn on Dark mode anytime.",
    side: "bottom",
    align: "end",
  },
] as const;

const POPOVER_WIDTH = 280;
const POPOVER_GAP = 12;
const ARROW_SIZE = 8;
const POPOVER_SURFACE = "var(--ace-button-purple-500)";

function prepareStep(
  step: CoachStep | undefined,
  options?: {
    onEnsureSidebarOpen?: () => void;
    onEnsureDetailVisible?: () => void;
  },
) {
  if (!step) return;
  if (step.requiresSidebarOpen) options?.onEnsureSidebarOpen?.();
  if (step.requiresDetail) options?.onEnsureDetailVisible?.();
}

export function useReviewOnboardingCoach(options?: {
  onEnsureSidebarOpen?: () => void;
  onEnsureDetailVisible?: () => void;
}) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const onEnsureSidebarOpen = options?.onEnsureSidebarOpen;
  const onEnsureDetailVisible = options?.onEnsureDetailVisible;

  useEffect(() => {
    // Always offer the tour when the prototype loads (no persistence).
    const id = window.setTimeout(() => setPromptOpen(true), 450);
    return () => window.clearTimeout(id);
  }, []);

  const declineTour = useCallback(() => {
    setPromptOpen(false);
    setActive(false);
  }, []);

  const startTour = useCallback(() => {
    setPromptOpen(false);
    setStepIndex(0);
    prepareStep(COACH_STEPS[0], {
      onEnsureSidebarOpen,
      onEnsureDetailVisible,
    });
    setActive(true);
  }, [onEnsureDetailVisible, onEnsureSidebarOpen]);

  const dismiss = useCallback(() => {
    setActive(false);
  }, []);

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current >= COACH_STEPS.length - 1) {
        setActive(false);
        return current;
      }
      const upcoming = COACH_STEPS[current + 1];
      prepareStep(upcoming, { onEnsureSidebarOpen, onEnsureDetailVisible });
      return current + 1;
    });
  }, [onEnsureDetailVisible, onEnsureSidebarOpen]);

  const step = COACH_STEPS[stepIndex] ?? COACH_STEPS[0]!;
  const isLast = stepIndex >= COACH_STEPS.length - 1;

  return {
    promptOpen,
    active,
    step,
    stepIndex,
    stepCount: COACH_STEPS.length,
    isLast,
    startTour,
    declineTour,
    next,
    dismiss,
  };
}

function resolveTargetElement(
  stepId: ReviewOnboardingCoachStepId,
): HTMLElement | null {
  if (stepId === "assignment") {
    return (
      document.querySelector<HTMLElement>('[data-coach-target="assignment"]') ??
      document.querySelector<HTMLElement>('[aria-label="Sidebar navigation"]') ??
      document.querySelector<HTMLElement>('[data-sidebar-group-id="my-work"]')
    );
  }
  return document.querySelector<HTMLElement>(`[data-coach-target="${stepId}"]`);
}

function resolveTargetRect(stepId: ReviewOnboardingCoachStepId): DOMRect | null {
  const el = resolveTargetElement(stepId);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  // Anchor near the top of the matches table so the popover sits over the grid.
  if (stepId === "matches") {
    const bandTop = rect.top + 8;
    const bandHeight = Math.min(72, Math.max(40, rect.height * 0.2));
    return new DOMRect(rect.left, bandTop, rect.width, bandHeight);
  }
  // Client profile sticky block is tall/wide — pin to the header band on the left.
  if (stepId === "client-profile") {
    const bandHeight = Math.min(88, Math.max(52, Math.min(rect.height, 88)));
    const width = Math.min(rect.width, 360);
    return new DOMRect(rect.left, rect.top, width, bandHeight);
  }
  // Task bar is full-width; actions sit on the right — target that cluster.
  if (stepId === "task-bar") {
    const actions = el.querySelector<HTMLElement>(":scope > div");
    if (actions) {
      const actionsRect = actions.getBoundingClientRect();
      if (actionsRect.width > 1 && actionsRect.height > 1) return actionsRect;
    }
  }
  return rect;
}

/** Horizontal point on the target the arrow should aim at (respects popover align). */
function arrowAnchorX(rect: DOMRect, align: CoachStep["align"]): number {
  if (align === "start") return rect.left + Math.min(28, rect.width / 2);
  if (align === "end") return rect.right - Math.min(28, rect.width / 2);
  return rect.left + rect.width / 2;
}

function clampArrowOffset(offset: number): number {
  return Math.min(Math.max(offset, 16), POPOVER_WIDTH - 24);
}

function popoverPosition(
  rect: DOMRect,
  side: CoachStep["side"],
  align: CoachStep["align"],
): { top: number; left: number; transform?: string; arrow: CSSProperties } {
  let top = 0;
  let left = 0;

  if (side === "bottom") {
    top = rect.bottom + POPOVER_GAP;
  } else if (side === "top") {
    top = rect.top - POPOVER_GAP;
  } else if (side === "right") {
    left = rect.right + POPOVER_GAP;
  } else {
    left = rect.left - POPOVER_GAP - POPOVER_WIDTH;
  }

  if (side === "bottom" || side === "top") {
    if (align === "start") left = rect.left;
    else if (align === "end") left = rect.right - POPOVER_WIDTH;
    else left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
  } else if (align === "start") {
    top = rect.top;
  } else if (align === "end") {
    top = rect.bottom;
  } else {
    top = rect.top + rect.height / 2;
  }

  const maxLeft = window.innerWidth - POPOVER_WIDTH - 8;
  const clampedLeft = Math.max(8, Math.min(left, maxLeft));
  const clampedTop = Math.max(8, top);

  let transform: string | undefined;
  if (side === "top") transform = "translateY(-100%)";
  else if (side === "left" || side === "right") {
    if (align === "center") transform = "translateY(-50%)";
    else if (align === "end") transform = "translateY(-100%)";
  }

  const arrowX = clampArrowOffset(
    arrowAnchorX(rect, align) - clampedLeft - ARROW_SIZE,
  );

  const arrow: CSSProperties = { position: "absolute", width: 0, height: 0 };
  if (side === "bottom") {
    arrow.top = -ARROW_SIZE;
    arrow.left = arrowX;
    arrow.borderLeft = `${ARROW_SIZE}px solid transparent`;
    arrow.borderRight = `${ARROW_SIZE}px solid transparent`;
    arrow.borderBottom = `${ARROW_SIZE}px solid ${POPOVER_SURFACE}`;
  } else if (side === "top") {
    arrow.bottom = -ARROW_SIZE;
    arrow.left = arrowX;
    arrow.borderLeft = `${ARROW_SIZE}px solid transparent`;
    arrow.borderRight = `${ARROW_SIZE}px solid transparent`;
    arrow.borderTop = `${ARROW_SIZE}px solid ${POPOVER_SURFACE}`;
  } else if (side === "right") {
    arrow.left = -ARROW_SIZE;
    arrow.top = 20;
    arrow.borderTop = `${ARROW_SIZE}px solid transparent`;
    arrow.borderBottom = `${ARROW_SIZE}px solid transparent`;
    arrow.borderRight = `${ARROW_SIZE}px solid ${POPOVER_SURFACE}`;
  } else {
    arrow.right = -ARROW_SIZE;
    arrow.top = 20;
    arrow.borderTop = `${ARROW_SIZE}px solid transparent`;
    arrow.borderBottom = `${ARROW_SIZE}px solid transparent`;
    arrow.borderLeft = `${ARROW_SIZE}px solid ${POPOVER_SURFACE}`;
  }

  return {
    top: clampedTop,
    left: clampedLeft,
    transform,
    arrow,
  };
}

interface ReviewOnboardingCoachProps {
  promptOpen: boolean;
  onStartTour: () => void;
  onDeclineTour: () => void;
  active: boolean;
  step: CoachStep;
  stepIndex: number;
  stepCount: number;
  isLast: boolean;
  onNext: () => void;
  onDismiss: () => void;
}

export function ReviewOnboardingCoach({
  promptOpen,
  onStartTour,
  onDeclineTour,
  active,
  step,
  stepIndex,
  stepCount,
  isLast,
  onNext,
  onDismiss,
}: ReviewOnboardingCoachProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }

    // Drop the previous step's rect so we don't flash the wrong popover while
    // waiting for the next target (e.g. after sidebar layout changes).
    setRect(null);

    const el = resolveTargetElement(step.id);
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });

    let frame = 0;
    let attempts = 0;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const nextRect = resolveTargetRect(step.id);
      if (nextRect) {
        setRect(nextRect);
        return;
      }
      attempts += 1;
      // Target not in the DOM (e.g. empty L2 queue) — skip ahead
      if (attempts > 16) {
        onNext();
        return;
      }
      frame = window.setTimeout(measure, 80);
    };

    measure();
    // Remeasure after sidebar open / scroll settle
    const delayed = window.setTimeout(measure, 280);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      cancelled = true;
      window.clearTimeout(frame);
      window.clearTimeout(delayed);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, step.id, onNext]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onDismiss]);

  const placement =
    active && rect ? popoverPosition(rect, step.side, step.align) : null;

  return (
    <>
      <DialogModal
        open={promptOpen}
        onClose={onDeclineTour}
        title="Take a quick tour?"
        size="lg"
        fitContent
        closeOnOverlayClick={false}
        description='Welcome to the new Review Assigned screen. Click "Take Tour" below to get a short walkthrough of the basic interactions in this new feature.'
        secondaryAction={{
          label: "Not now",
          onClick: onDeclineTour,
        }}
        primaryAction={{
          label: "Take Tour",
          onClick: onStartTour,
        }}
      />

      {active ? (
        <div className="fixed inset-0 z-[70]" aria-live="polite">
          <div
            aria-hidden
            className="absolute inset-0 bg-[rgb(35_38_44/0.48)]"
          />

          {rect && placement ? (
            <div
              ref={popoverRef}
              role="dialog"
              aria-label={step.title}
              className={cn(
                "pointer-events-auto absolute z-[1] flex flex-col gap-3 border p-4",
                "rounded-[var(--radius-md)] border-[var(--ace-button-purple-500)]",
                "bg-[var(--ace-button-purple-500)] text-[var(--ace-button-on-solid)]",
                "shadow-[var(--ace-drop-shadow-md)]",
              )}
              style={{
                top: placement.top,
                left: placement.left,
                width: POPOVER_WIDTH,
                transform: placement.transform,
              }}
            >
              <span style={placement.arrow} aria-hidden />
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      aceTypography(ACE_TYPE.h6Bold),
                      "min-w-0 flex-1 leading-[1.65] text-[var(--ace-button-on-solid)]",
                    )}
                  >
                    {step.title}
                  </p>
                  <button
                    type="button"
                    aria-label="Close tour"
                    onClick={onDismiss}
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
                      "text-[var(--ace-button-on-solid)] transition-colors",
                      "hover:bg-[color-mix(in_srgb,var(--ace-button-on-solid)_16%,transparent)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ace-button-on-solid)]",
                    )}
                  >
                    <MaterialSymbol name="close" size="md" className="text-current" />
                  </button>
                </div>
                <p
                  className={cn(
                    aceTypography(ACE_TYPE.p1Regular),
                    "text-sm leading-[1.65] text-[var(--ace-button-on-solid)]/85",
                  )}
                >
                  {step.description}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    aceTypography(ACE_TYPE.captionSemiBold),
                    "text-[var(--ace-button-on-solid)]/75",
                  )}
                >
                  {stepIndex + 1}/{stepCount}
                </span>
                <AceButton
                  type="button"
                  variant="secondary"
                  palette="purple"
                  size="sm"
                  onClick={onNext}
                >
                  {isLast ? "Got it" : "Next"}
                </AceButton>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
