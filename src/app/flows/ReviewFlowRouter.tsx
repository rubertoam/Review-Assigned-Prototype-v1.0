import { Level1ReviewInterface } from "./level-1/Level1ReviewInterface";
import { Level2ReviewInterface } from "./level-2/Level2ReviewInterface";
import { useUserFlow } from "./FlowContext";
import { WatchlistLandingPage } from "../components/WatchlistLandingPage";
import { PaymentsLandingPage } from "../components/PaymentsLandingPage";
import { KycLandingPage } from "../components/KycLandingPage";
import { ReportingLandingPage } from "../components/ReportingLandingPage";
import { ReportingDashboardPage } from "../components/ReportingDashboardPage";
import { ReportingReportLibraryPage } from "../components/ReportingReportLibraryPage";
import { ReportingDataManagerPage } from "../components/ReportingDataManagerPage";
import { AllSettingsPage } from "../components/AllSettingsPage";
import { OrganizationSettingsPage } from "../components/OrganizationSettingsPage";
import { PaymentsManagementPage } from "../components/PaymentsManagementPage";
import { AdministrationSettingsPage } from "../components/AdministrationSettingsPage";

export function ReviewFlowRouter() {
  const { flowId, appView, landingProduct } = useUserFlow();

  if (appView === "all-settings") {
    return <AllSettingsPage />;
  }

  if (appView === "organization-settings") {
    return <OrganizationSettingsPage />;
  }

  if (appView === "payments-management") {
    return <PaymentsManagementPage />;
  }

  if (appView === "administration-settings") {
    return <AdministrationSettingsPage />;
  }

  if (appView === "reporting-dashboard") {
    return <ReportingDashboardPage />;
  }

  if (appView === "reporting-report-library") {
    return <ReportingReportLibraryPage />;
  }

  if (appView === "reporting-data-manager") {
    return <ReportingDataManagerPage />;
  }

  if (appView === "landing") {
    if (landingProduct === "payments") {
      return <PaymentsLandingPage />;
    }
    if (landingProduct === "kyc") {
      return <KycLandingPage />;
    }
    if (landingProduct === "reporting") {
      return <ReportingLandingPage />;
    }
    return <WatchlistLandingPage />;
  }

  switch (flowId) {
    case "level-2":
      return <Level2ReviewInterface key="level-2" />;
    case "level-1":
    default:
      return <Level1ReviewInterface key="level-1" />;
  }
}
