export const APP_VIEWS = [
  "landing",
  "review",
  "reporting-dashboard",
  "reporting-report-library",
  "reporting-data-manager",
  "all-settings",
  "organization-settings",
  "payments-management",
  "administration-settings",
] as const;

export type AppView = (typeof APP_VIEWS)[number];

export const LANDING_PRODUCTS = ["watchlist", "payments", "kyc", "reporting"] as const;

export type LandingProduct = (typeof LANDING_PRODUCTS)[number];

/** Shared GitHub Pages build opens Workbench directly (other shells stay in-repo for later). */
export const DEFAULT_APP_VIEW: AppView = "review";
export const DEFAULT_LANDING_PRODUCT: LandingProduct = "watchlist";

export function isAppView(value: string): value is AppView {
  return (APP_VIEWS as readonly string[]).includes(value);
}

export function isLandingProduct(value: string): value is LandingProduct {
  return (LANDING_PRODUCTS as readonly string[]).includes(value);
}
