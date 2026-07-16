import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_APP_VIEW,
  DEFAULT_LANDING_PRODUCT,
  type AppView,
  type LandingProduct,
} from "../lib/appNavigation";
import {
  DEFAULT_USER_FLOW_ID,
  getUserFlowDefinition,
  readStoredUserFlowId,
  writeStoredUserFlowId,
  type UserFlowDefinition,
  type UserFlowId,
} from "./flowTypes";

type FlowContextValue = {
  flowId: UserFlowId;
  currentFlow: UserFlowDefinition;
  setFlowId: (flowId: UserFlowId) => void;
  appView: AppView;
  setAppView: (view: AppView) => void;
  landingProduct: LandingProduct;
  /** Which product landing is the user's start page (only one at a time). */
  startPageProduct: LandingProduct | null;
  setStartPageProduct: (product: LandingProduct | null) => void;
  openReviewAssigned: () => void;
  openWatchlistLanding: () => void;
  openPaymentsLanding: () => void;
  openKycLanding: () => void;
  openReportingLanding: () => void;
  openReportingDashboard: () => void;
  openReportingReportLibrary: () => void;
  openReportingDataManager: () => void;
  openAllSettings: () => void;
  openOrganizationSettings: () => void;
  openPaymentsManagement: () => void;
  openAdministrationSettings: () => void;
  /** Navigate to the user's selected start-page product landing. */
  openStartPage: () => void;
  /** Alias for Watchlist Overview — kept for existing call sites. */
  openLanding: () => void;
};

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flowId, setFlowIdState] = useState<UserFlowId>(() => readStoredUserFlowId());
  const [appView, setAppView] = useState<AppView>(DEFAULT_APP_VIEW);
  const [landingProduct, setLandingProduct] = useState<LandingProduct>(DEFAULT_LANDING_PRODUCT);
  const [startPageProduct, setStartPageProduct] = useState<LandingProduct | null>(
    DEFAULT_LANDING_PRODUCT,
  );

  const setFlowId = useCallback((nextFlowId: UserFlowId) => {
    setFlowIdState(nextFlowId);
    writeStoredUserFlowId(nextFlowId);
  }, []);

  const openReviewAssigned = useCallback(() => {
    setLandingProduct("watchlist");
    setAppView("review");
  }, []);

  const openWatchlistLanding = useCallback(() => {
    setLandingProduct("watchlist");
    setAppView("landing");
  }, []);

  const openPaymentsLanding = useCallback(() => {
    setLandingProduct("payments");
    setAppView("landing");
  }, []);

  const openKycLanding = useCallback(() => {
    setLandingProduct("kyc");
    setAppView("landing");
  }, []);

  const openReportingLanding = useCallback(() => {
    setLandingProduct("reporting");
    setAppView("landing");
  }, []);

  const openReportingDashboard = useCallback(() => {
    setLandingProduct("reporting");
    setAppView("reporting-dashboard");
  }, []);

  const openReportingReportLibrary = useCallback(() => {
    setLandingProduct("reporting");
    setAppView("reporting-report-library");
  }, []);

  const openReportingDataManager = useCallback(() => {
    setLandingProduct("reporting");
    setAppView("reporting-data-manager");
  }, []);

  const openAllSettings = useCallback(() => {
    setAppView("all-settings");
  }, []);

  const openOrganizationSettings = useCallback(() => {
    setAppView("organization-settings");
  }, []);

  const openPaymentsManagement = useCallback(() => {
    setLandingProduct("payments");
    setAppView("payments-management");
  }, []);

  const openAdministrationSettings = useCallback(() => {
    setAppView("administration-settings");
  }, []);

  const openStartPage = useCallback(() => {
    const product = startPageProduct ?? DEFAULT_LANDING_PRODUCT;
    setLandingProduct(product);
    setAppView("landing");
  }, [startPageProduct]);

  const openLanding = openWatchlistLanding;

  const value = useMemo(
    () => ({
      flowId,
      currentFlow: getUserFlowDefinition(flowId),
      setFlowId,
      appView,
      setAppView,
      landingProduct,
      startPageProduct,
      setStartPageProduct,
      openReviewAssigned,
      openWatchlistLanding,
      openPaymentsLanding,
      openKycLanding,
      openReportingLanding,
      openReportingDashboard,
      openReportingReportLibrary,
      openReportingDataManager,
      openAllSettings,
      openOrganizationSettings,
      openPaymentsManagement,
      openAdministrationSettings,
      openStartPage,
      openLanding,
    }),
    [
      flowId,
      setFlowId,
      appView,
      landingProduct,
      startPageProduct,
      openReviewAssigned,
      openWatchlistLanding,
      openPaymentsLanding,
      openKycLanding,
      openReportingLanding,
      openReportingDashboard,
      openReportingReportLibrary,
      openReportingDataManager,
      openAllSettings,
      openOrganizationSettings,
      openPaymentsManagement,
      openAdministrationSettings,
      openStartPage,
      openLanding,
    ],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useUserFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error("useUserFlow must be used within FlowProvider");
  }
  return ctx;
}

export { DEFAULT_USER_FLOW_ID };
