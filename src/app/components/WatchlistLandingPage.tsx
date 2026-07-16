import { useMemo } from "react";
import { useUserFlow } from "../flows/FlowContext";
import {
  getAssignedCasesBadgeCount,
  getInitialOpenSanctionCaseCount,
} from "../lib/assignedWorkCounts";
import {
  ProductLandingPage,
  type LandingFeatureCard,
  type LandingLinkColumn,
} from "./ProductLandingPage";

const HERO_DESCRIPTION =
  "Screen both individuals and organizations against multiple compliance lists - including global sanctions, PEPs, regulatory watch lists, UBOs, and internally-managed lists.";

const LINK_COLUMNS: readonly LandingLinkColumn[] = [
  {
    id: "reports",
    title: "Watchlist Reports",
    icon: "bar_chart",
    links: [
      "Case Work Report",
      "Client Query Report",
      "Composition Report",
      "Composition Export by List Report",
    ],
  },
  {
    id: "dashboards",
    title: "Watchlist Dashboards",
    icon: "balance",
    links: [
      "Watchlist Screening Rules",
      "Cases & Matches",
      "Open Matches by Age",
      "Load Summary",
      "Screening Summary",
    ],
  },
  {
    id: "more",
    title: "More Links",
    icon: "open_in_new",
    links: ["Dashboard", "Report Library", "Data Manager", "Resource Center", "My Settings"],
  },
];

export function WatchlistLandingPage() {
  const { openReviewAssigned } = useUserFlow();

  const featureCards = useMemo((): LandingFeatureCard[] => {
    const assignedCount = getAssignedCasesBadgeCount(getInitialOpenSanctionCaseCount());
    return [
      {
        id: "assigned-cases",
        title: "Assigned Cases",
        description: "Description of the feature goes here...",
        navigates: true,
        badgeCount: assignedCount,
        onActivate: openReviewAssigned,
      },
      {
        id: "case-browser",
        title: "Case Browser",
        description: "Description of the feature goes here...",
      },
      {
        id: "name-address-search",
        title: "Name/Address List Search",
        description: "Description of the feature goes here...",
      },
      {
        id: "specific-element-search",
        title: "Specific Element List Search",
        description: "Description of the feature goes here...",
      },
      {
        id: "quickscan",
        title: "QuickScan",
        description: "Description of the feature goes here...",
      },
      {
        id: "audit-logs",
        title: "Search Audit Logs",
        description: "Description of the feature goes here...",
      },
      {
        id: "list-editor",
        title: "User Defined List Editor",
        description: "Description of the feature goes here...",
      },
      {
        id: "match-simulation",
        title: "Match Simulation",
        description: "Description of the feature goes here...",
      },
    ];
  }, [openReviewAssigned]);

  return (
    <ProductLandingPage
      product="watchlist"
      heroDescription={HERO_DESCRIPTION}
      featureCards={featureCards}
      linkColumns={LINK_COLUMNS}
    />
  );
}
