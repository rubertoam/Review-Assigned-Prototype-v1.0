import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./ui/utils";

const DEFAULT_WIDTH = 480;
const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MAX_WIDTH = 720;

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** localStorage key for persisted width; omit to skip persistence */
  widthStorageKey?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export function SideDrawer({
  isOpen,
  onClose,
  children,
  widthStorageKey,
  defaultWidth = DEFAULT_WIDTH,
  minWidth = DEFAULT_MIN_WIDTH,
  maxWidth = DEFAULT_MAX_WIDTH,
  className,
}: SideDrawerProps) {
  const clampWidth = useCallback(
    (w: number) => Math.min(maxWidth, Math.max(minWidth, w)),
    [minWidth, maxWidth],
  );

  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined" || !widthStorageKey) return defaultWidth;
    const stored = localStorage.getItem(widthStorageKey);
    if (stored) {
      const n = Number.parseInt(stored, 10);
      if (!Number.isNaN(n)) return clampWidth(n);
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const persistWidth = useCallback(
    (w: number) => {
      if (widthStorageKey) localStorage.setItem(widthStorageKey, String(w));
    },
    [widthStorageKey],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = startXRef.current - e.clientX;
      const next = clampWidth(startWidthRef.current + delta);
      setWidth(next);
    };
    const onUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setWidth((w) => {
        persistWidth(w);
        return w;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [clampWidth, persistWidth]);

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div
      className={cn(
        "relative flex max-h-full min-h-0 shrink-0 flex-col self-stretch overflow-hidden bg-white dark:bg-[#22272b] border-[#cfd2d9] dark:border-[#38414a]",
        isResizing
          ? "transition-opacity duration-200 ease-out"
          : "transition-[width,opacity] duration-200 ease-out",
        isOpen ? "opacity-100 border-l" : "w-0 opacity-0 border-l-0",
        className,
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Resize drawer"
            className="absolute left-0 top-0 z-10 h-full w-2 cursor-col-resize touch-none bg-transparent hover:bg-[#523eb9]/25 active:bg-[#523eb9]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#523eb9]/40"
            onMouseDown={onResizeStart}
          />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pl-1.5">{children}</div>
        </>
      ) : null}
    </div>
  );
}
