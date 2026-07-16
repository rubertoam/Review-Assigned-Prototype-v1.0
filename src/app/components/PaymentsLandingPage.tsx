import {
  ProductLandingPage,
  type LandingFeatureCard,
  type LandingLinkColumn,
} from "./ProductLandingPage";

const HERO_DESCRIPTION =
  "Screen incoming and outgoing payments against compliance lists to block payments in real time.";

const FEATURE_CARDS: readonly LandingFeatureCard[] = [
  {
    id: "assigned-transactions",
    title: "Assigned Transactions",
    description: "Description of the feature goes here...",
    badgeCount: 32,
    badgeTone: "orange",
  },
  {
    id: "payments-browser",
    title: "Payments Browser",
    description: "Description of the feature goes here...",
  },
  {
    id: "safe-list-search",
    title: "Safe List Search",
    description: "Description of the feature goes here...",
  },
  {
    id: "payments-management",
    title: "Payments Management",
    description: "Description of the feature goes here...",
  },
];

const LINK_COLUMNS: readonly LandingLinkColumn[] = [
  {
    id: "reports",
    title: "Payment Reports",
    icon: "bar_chart",
    links: [
      "Payment Productivity Report",
      "Payment History Report",
      "Payment Composition Report",
    ],
  },
  {
    id: "dashboards",
    title: "Payment Dashboards",
    icon: "balance",
    links: [
      "Average Resolution Time",
      "Rules Generating Results",
      "Screened Transactions",
      "Payment History",
      "Payment Status",
    ],
  },
  {
    id: "more",
    title: "More Links",
    icon: "open_in_new",
    links: ["Dashboard", "Report Library", "Data Manager", "Resource Center", "My Settings"],
  },
];

export function PaymentsLandingPage() {
  return (
    <ProductLandingPage
      product="payments"
      palette="enlighten-violet"
      heroDescription={HERO_DESCRIPTION}
      featureCards={FEATURE_CARDS}
      linkColumns={LINK_COLUMNS}
    />
  );
}
