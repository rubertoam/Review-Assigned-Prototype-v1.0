import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "review-layout-side-by-side";

type ReviewLayoutContextValue = {
  isSideBySide: boolean;
  setIsSideBySide: (value: boolean) => void;
};

const ReviewLayoutContext = createContext<ReviewLayoutContextValue | null>(null);

export function ReviewLayoutProvider({ children }: { children: ReactNode }) {
  const [isSideBySide, setIsSideBySideState] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  const setIsSideBySide = useCallback((value: boolean) => {
    setIsSideBySideState(value);
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }, []);

  const value = useMemo(
    () => ({ isSideBySide, setIsSideBySide }),
    [isSideBySide, setIsSideBySide],
  );

  return (
    <ReviewLayoutContext.Provider value={value}>{children}</ReviewLayoutContext.Provider>
  );
}

/** Safe outside the provider (e.g. settings shells) — toggle is a no-op. */
export function useReviewLayout(): ReviewLayoutContextValue {
  const ctx = useContext(ReviewLayoutContext);
  if (!ctx) {
    return {
      isSideBySide: false,
      setIsSideBySide: () => {},
    };
  }
  return ctx;
}
