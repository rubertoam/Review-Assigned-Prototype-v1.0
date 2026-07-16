import { useMemo, useState } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { ThemeProvider } from "../context/ThemeContext";
import { useUserFlow } from "../flows/FlowContext";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { AskChattyBubble } from "./AskChattyBubble";
import {
  LandingFeatureCardView,
  landingFeatureCardDefaultChrome,
  landingFeatureCardGridClass,
  type LandingFeatureCard,
} from "./ProductLandingPage";
import { ReviewFlowSiteHeader } from "./ReviewFlowSiteHeader";
import { cn } from "./ui/utils";

const SETTINGS_CARD_DEFS = [
  { id: "organization", title: "Organization", headerIcon: "more_horiz" },
  { id: "payments", title: "Payments Management", headerIcon: "more_horiz" },
  { id: "administration", title: "Administration", headerIcon: "more_horiz" },
  { id: "screening", title: "Screening Settings", headerIcon: "tune" },
  { id: "focus-health", title: "Focus Health", headerIcon: "ecg_heart" },
  { id: "database", title: "Database Connections", headerIcon: "database" },
  { id: "common", title: "Common Configurations", headerIcon: "tune" },
  { id: "batch", title: "Batch Job Settings", headerIcon: "more_horiz" },
  { id: "risk", title: "Risk Score Evaluator", headerIcon: "tune" },
  { id: "kyc", title: "KYC Configurations", headerIcon: "more_horiz" },
  { id: "enhance", title: "Enhance Discover Configurations", headerIcon: "tune" },
  { id: "mtv", title: "MTV Settings, Rules, Processes", headerIcon: "tune" },
] as const;

export function AllSettingsPage() {
  const {
    openOrganizationSettings,
    openPaymentsManagement,
    openAdministrationSettings,
  } = useUserFlow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chattyOpen, setChattyOpen] = useState(false);

  const featureCards = useMemo((): LandingFeatureCard[] => {
    return SETTINGS_CARD_DEFS.map((card) => ({
      id: card.id,
      title: card.title,
      description: "Description of the feature goes here...",
      headerIcon: card.headerIcon,
      navigates: true,
      onActivate: () => {
        setSelectedId(card.id);
        if (card.id === "organization") openOrganizationSettings();
        if (card.id === "payments") openPaymentsManagement();
        if (card.id === "administration") openAdministrationSettings();
      },
    }));
  }, [
    openOrganizationSettings,
    openPaymentsManagement,
    openAdministrationSettings,
  ]);

  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]">
        <ReviewFlowSiteHeader />

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
          <h1
            className={cn(
              aceTypography(ACE_TYPE.h6Bold),
              "m-0 text-base leading-[1.65] text-[var(--screening-text-primary)]",
            )}
          >
            All Settings
          </h1>
          <div
            className={cn(
              "inline-flex shrink-0 items-center justify-center border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-3 py-1.5",
              aceTypography(ACE_TYPE.captionBold),
              "text-[var(--screening-text-secondary)]",
            )}
            aria-label="Organization"
          >
            AIG
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-auto px-4 py-5 md:px-8 md:py-6">
          <div className={cn("mx-auto w-fit max-w-full", landingFeatureCardGridClass)}>
            {featureCards.map((card) => (
              <LandingFeatureCardView
                key={card.id}
                card={card}
                cardFillClass={landingFeatureCardDefaultChrome.cardFill}
                focusRingOffsetClass={landingFeatureCardDefaultChrome.focusRingOffset}
                selected={selectedId === card.id}
              />
            ))}
          </div>
        </main>

        <footer className="shrink-0 border-t border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
          <p
            className={cn(
              aceTypography(ACE_TYPE.footerRegular),
              "m-0 text-[var(--screening-text-secondary)]",
            )}
          >
            Copyright © Innovative Systems, Inc. 2015-2028. All rights reserved.
          </p>
        </footer>

        <AskChattyBubble open={chattyOpen} onClose={() => setChattyOpen(false)} />
        <button
          type="button"
          aria-label={chattyOpen ? "Close Ask Chatty" : "Ask Chatty"}
          aria-expanded={chattyOpen}
          onClick={() => setChattyOpen((open) => !open)}
          className={cn(
            "fixed bottom-6 right-6 z-30 inline-flex size-12 items-center justify-center rounded-[var(--radius-md)]",
            "bg-[var(--ace-button-purple-500)] text-white shadow-[var(--ace-landing-page-card-shadow-hover)]",
            "transition-transform duration-[var(--ace-motion-duration-fast)] [transition-timing-function:var(--ace-motion-ease-standard)]",
            "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
          )}
        >
          <MaterialSymbol name={chattyOpen ? "close" : "smart_toy"} size="lg" />
        </button>
      </div>
    </ThemeProvider>
  );
}
