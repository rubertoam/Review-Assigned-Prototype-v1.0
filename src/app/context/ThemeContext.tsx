import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeContextValue = {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("review-theme") === "dark";
  });

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    localStorage.setItem("review-theme", theme);
    // ACE DS tokens live under [data-theme="dark"] on <html> (portaled menus inherit this).
    document.documentElement.setAttribute("data-theme", theme);
    // Our own CSS variables (.dark {}) and the Tailwind `dark:` variant (.dark *)
    // key off the `dark` class, so it must be toggled in lockstep with data-theme.
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;
    return () => {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "";
    };
  }, [isDark]);

  const value = useMemo(
    () => ({
      isDark,
      setIsDark,
      toggleDark: () => setIsDark((d) => !d),
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
