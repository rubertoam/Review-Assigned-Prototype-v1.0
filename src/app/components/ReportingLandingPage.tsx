import { useMemo } from "react";
import { useUserFlow } from "../flows/FlowContext";
import {
  ProductLandingPage,
  type LandingFeatureCard,
  type LandingLinkColumn,
} from "./ProductLandingPage";

const HERO_DESCRIPTION =
  "Explore dashboards, report libraries, and data management tools to monitor screening activity and compliance outcomes across FinScan.";

const LINK_COLUMNS: readonly LandingLinkColumn[] = [
  {
    id: "reports",
    title: "Popular Reports",
    icon: "bar_chart",
    links: [
      "Case Work Report",
      "Payment Productivity Report",
      "Search Classification Summary Report",
      "Client Query Report",
    ],
  },
  {
    id: "dashboards",
    title: "Dashboards",
    icon: "public",
    links: [
      "Watchlist Screening Rules",
      "Average Resolution Time",
      "Media Classification",
      "Status Distribution",
    ],
  },
  {
    id: "more",
    title: "More Links",
    icon: "open_in_new",
    links: ["Resource Center", "My Settings"],
  },
];

export function ReportingLandingPage() {
  const {
    openReportingDashboard,
    openReportingReportLibrary,
    openReportingDataManager,
  } = useUserFlow();

  const featureCards = useMemo(
    (): LandingFeatureCard[] => [
      {
        id: "dashboard",
        title: "Dashboard",
        description: "Description of the feature goes here...",
        navigates: true,
        onActivate: openReportingDashboard,
      },
      {
        id: "report-library",
        title: "Report Library",
        description: "Description of the feature goes here...",
        navigates: true,
        onActivate: openReportingReportLibrary,
      },
      {
        id: "data-manager",
        title: "Data Manager",
        description: "Description of the feature goes here...",
        navigates: true,
        onActivate: openReportingDataManager,
      },
    ],
    [openReportingDashboard, openReportingReportLibrary, openReportingDataManager],
  );

  return (
    <ProductLandingPage
      product="reporting"
      palette="finscan-teal"
      heroDescription={HERO_DESCRIPTION}
      featureCards={featureCards}
      linkColumns={LINK_COLUMNS}
    />
  );
}
