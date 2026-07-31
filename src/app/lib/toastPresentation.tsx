import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type AnimationEvent,
} from "react";
import { cn } from "../components/ui/utils";

export const TOAST_DURATION_MS = 5000;

const TOAST_SLIDE_MS = 240;

/** Pausable 5s countdown; `progress` is remaining fraction (1 → 0). */
export function usePausableCountdown({
  active,
  durationMs,
  onComplete,
}: {
  active: boolean;
  durationMs: number;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(1);
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(durationMs);
  const lastTickRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;
    remainingRef.current = durationMs;
    lastTickRef.current = null;
    setProgress(1);
    setPaused(false);
  }, [active, durationMs]);

  useEffect(() => {
    if (!active || paused) {
      lastTickRef.current = null;
      return;
    }

    let frame = 0;
    const tick = (now: number) => {
      if (lastTickRef.current == null) {
        lastTickRef.current = now;
      }
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      remainingRef.current = Math.max(0, remainingRef.current - delta);
      setProgress(remainingRef.current / durationMs);
      if (remainingRef.current <= 0) {
        onCompleteRef.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, paused, durationMs]);

  return {
    progress,
    paused,
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
  };
}

type MotionPhase = "enter" | "shown" | "exit";

/**
 * Slides toast in from the left; slides back out to the left before `onDismissed`.
 * Uses CSS keyframe animations (more reliable than mount transitions).
 */
export function ToastMotionShell({
  children,
  onDismissed,
  durationMs = TOAST_DURATION_MS,
  pauseCountdown = true,
}: {
  children: (progress: number, requestDismiss: () => void) => ReactNode;
  onDismissed: () => void;
  durationMs?: number;
  pauseCountdown?: boolean;
}) {
  const [phase, setPhase] = useState<MotionPhase>("enter");
  const phaseRef = useRef<MotionPhase>("enter");
  const dismissedRef = useRef(false);
  const onDismissedRef = useRef(onDismissed);
  onDismissedRef.current = onDismissed;

  const finishDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismissedRef.current();
  }, []);

  const requestDismiss = useCallback(() => {
    if (phaseRef.current === "exit") return;
    phaseRef.current = "exit";
    setPhase("exit");
  }, []);

  useEffect(() => {
    // Fallback if animationend doesn't fire (reduced motion / interrupted).
    if (phase !== "exit") return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => finishDismiss(),
      prefersReduced ? 0 : TOAST_SLIDE_MS + 60,
    );
    return () => window.clearTimeout(timer);
  }, [phase, finishDismiss]);

  const { progress, onMouseEnter, onMouseLeave } = usePausableCountdown({
    active: phase === "shown",
    durationMs,
    onComplete: requestDismiss,
  });

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (phase === "enter") {
      phaseRef.current = "shown";
      setPhase("shown");
      return;
    }
    if (phase === "exit") {
      finishDismiss();
    }
  };

  const animationName =
    phase === "enter"
      ? "ace-toast-slide-in-left"
      : phase === "exit"
        ? "ace-toast-slide-out-left"
        : "none";

  return (
    <div
      className="pointer-events-auto w-full will-change-transform"
      style={{
        animationName,
        animationDuration: `${TOAST_SLIDE_MS}ms`,
        animationTimingFunction:
          phase === "exit"
            ? "cubic-bezier(0.4, 0, 1, 1)"
            : "cubic-bezier(0.22, 1, 0.36, 1)",
        animationFillMode: "forwards",
        ...(phase === "shown"
          ? { transform: "translateX(0)", opacity: 1 }
          : null),
      }}
      onMouseEnter={pauseCountdown ? onMouseEnter : undefined}
      onMouseLeave={pauseCountdown ? onMouseLeave : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      {children(progress, requestDismiss)}
    </div>
  );
}

export const toastViewportClass = cn(
  "pointer-events-none fixed bottom-6 left-6 z-[80]",
  "flex w-[var(--ace-toast-width)] flex-col gap-3",
  "overflow-visible",
);

/**
 * Single fixed host for concurrent toasts. Hooks should return toast cards only —
 * wrap all Level toast nodes in one viewport so they stack with gap instead of
 * overlapping at the same fixed corner.
 */
export function ToastViewport({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return <div className={toastViewportClass}>{items}</div>;
}
