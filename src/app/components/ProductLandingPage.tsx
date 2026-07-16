import { useState } from "react";
import { AceLandingPageCard } from "@ace-ds/components/organisms/AceCards/AceLandingPageCard";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { ThemeProvider } from "../context/ThemeContext";
import { useUserFlow } from "../flows/FlowContext";
import type { LandingProduct } from "../lib/appNavigation";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { AskChattyBubble } from "./AskChattyBubble";
import { Checkbox } from "./ui/checkbox";
import { cn } from "./ui/utils";
import { ReviewFlowSiteHeader } from "./ReviewFlowSiteHeader";

export type LandingFeatureCard = {
  id: string;
  title: string;
  description: string;
  navigates?: boolean;
  headerIcon?: string;
  badgeCount?: number;
  /** Defaults to red status pill; payments uses orange. */
  badgeTone?: "red" | "orange";
  onActivate?: () => void;
};

export type LandingLinkColumn = {
  id: string;
  title: string;
  icon: string;
  links: readonly string[];
};

export type LandingColorPalette =
  | "finscan-purple"
  | "enlighten-violet"
  | "innovative-blue"
  | "finscan-teal";

export type ProductLandingPageProps = {
  product: LandingProduct;
  heroDescription: string;
  featureCards: readonly LandingFeatureCard[];
  linkColumns: readonly LandingLinkColumn[];
  /** Defaults to FinScan Purple. Payments: Enlighten Violet. KYC: Innovative Blue. Reporting: Teal. */
  palette?: LandingColorPalette;
};

const PALETTE = {
  "finscan-purple": {
    heroGradient: cn(
      "bg-[linear-gradient(to_top_left,var(--screening-primary-soft-bg)_0%,#CBC5EC_22%,var(--screening-primary-200)_48%,var(--screening-primary)_72%,var(--ace-button-purple-500)_100%)]",
      "dark:bg-[linear-gradient(to_top_left,var(--ace-dark-mode-800)_0%,#2a2540_28%,#3d2e6a_55%,var(--ace-button-purple-500)_100%)]",
    ),
    cardFill: "bg-[var(--ace-landing-page-card-footer-bg)]",
    focusRingOffset: "focus-visible:ring-offset-[var(--ace-button-purple-500)]",
    floatingAction:
      "bg-[var(--ace-button-purple-400)] dark:bg-[var(--ace-button-purple-500)]",
    heroOverlay: cn(
      "bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.28)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(61_46_138_/_0.35)_0%,transparent_50%)]",
      "dark:bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.08)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(155_142_212_/_0.22)_0%,transparent_50%)]",
    ),
  },
  "enlighten-violet": {
    heroGradient: cn(
      "bg-[linear-gradient(to_top_left,var(--ace-secondary-enlighten-violet-50)_0%,var(--ace-secondary-enlighten-violet-100)_22%,var(--ace-secondary-enlighten-violet-200)_48%,var(--ace-secondary-enlighten-violet-400)_72%,var(--ace-secondary-enlighten-violet-500)_100%)]",
      "dark:bg-[linear-gradient(to_top_left,var(--ace-secondary-enlighten-violet-900)_0%,var(--ace-secondary-enlighten-violet-800)_28%,var(--ace-secondary-enlighten-violet-700)_58%,var(--ace-secondary-enlighten-violet-500)_100%)]",
    ),
    cardFill: cn(
      "bg-[var(--ace-secondary-enlighten-violet-50)]",
      "dark:bg-[var(--ace-secondary-enlighten-violet-800)]",
    ),
    focusRingOffset: "focus-visible:ring-offset-[var(--ace-secondary-enlighten-violet-500)]",
    floatingAction: cn(
      "bg-[var(--ace-secondary-enlighten-violet-400)]",
      "dark:bg-[var(--ace-secondary-enlighten-violet-500)]",
    ),
    heroOverlay: cn(
      "bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.28)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(146_39_143_/_0.35)_0%,transparent_50%)]",
      "dark:bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.08)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(210_88_207_/_0.22)_0%,transparent_50%)]",
    ),
  },
  "innovative-blue": {
    heroGradient: cn(
      "bg-[linear-gradient(to_top_left,var(--ace-button-blue-50)_0%,var(--ace-button-blue-200)_28%,var(--ace-button-blue-400)_58%,var(--ace-button-blue-500)_82%,var(--ace-button-blue-700)_100%)]",
      "dark:bg-[linear-gradient(to_top_left,#021c29_0%,#033952_32%,var(--ace-button-blue-500)_68%,var(--ace-button-blue-400)_100%)]",
    ),
    cardFill: cn(
      "bg-[var(--ace-button-blue-50)]",
      "dark:bg-[#0f2a38]",
    ),
    focusRingOffset: "focus-visible:ring-offset-[var(--ace-button-blue-500)]",
    floatingAction:
      "bg-[var(--ace-button-blue-400)] dark:bg-[var(--ace-button-blue-500)]",
    heroOverlay: cn(
      "bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.28)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(6_114_163_/_0.35)_0%,transparent_50%)]",
      "dark:bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.08)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(8_157_225_/_0.22)_0%,transparent_50%)]",
    ),
  },
  "finscan-teal": {
    heroGradient: cn(
      "bg-[linear-gradient(to_top_left,var(--ace-secondary-teal-50)_0%,var(--ace-secondary-teal-100)_22%,var(--ace-secondary-teal-200)_48%,var(--ace-secondary-teal-400)_72%,var(--ace-secondary-teal-500)_100%)]",
      "dark:bg-[linear-gradient(to_top_left,var(--ace-secondary-teal-900)_0%,var(--ace-secondary-teal-800)_28%,var(--ace-secondary-teal-700)_58%,var(--ace-secondary-teal-500)_100%)]",
    ),
    cardFill: cn(
      "bg-[var(--ace-secondary-teal-50)]",
      "dark:bg-[var(--ace-secondary-teal-800)]",
    ),
    focusRingOffset: "focus-visible:ring-offset-[var(--ace-secondary-teal-500)]",
    floatingAction:
      "bg-[var(--ace-secondary-teal-400)] dark:bg-[var(--ace-secondary-teal-500)]",
    heroOverlay: cn(
      "bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.28)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(34_173_182_/_0.35)_0%,transparent_50%)]",
      "dark:bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_255_255_/_0.08)_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,rgb(40_202_213_/_0.22)_0%,transparent_50%)]",
    ),
  },
} as const;

function CountBadge({
  count,
  label,
  tone = "red",
}: {
  count: number;
  label: string;
  tone?: "red" | "orange";
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-3 top-3 z-10 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5",
        aceTypography(ACE_TYPE.captionBold),
        "text-[10px] leading-none text-white",
        tone === "orange"
          ? "bg-[var(--ace-status-pending-orange-500)]"
          : "bg-[var(--ace-status-critical-red-500)]",
      )}
      aria-label={label}
    >
      {count}
    </span>
  );
}

function CardHeaderIcon({ name }: { name: string }) {
  return (
    <span
      className="pointer-events-none absolute right-3 top-3 z-10 inline-flex size-5 items-center justify-center text-[var(--screening-text-muted)]"
      aria-hidden
    >
      <MaterialSymbol name={name} className="text-[20px] leading-none" />
    </span>
  );
}

/** Shared 4-column feature-card grid used on product landings and All Settings. */
export const landingFeatureCardGridClass = cn(
  "grid w-fit max-w-full justify-items-start gap-4",
  "grid-cols-1",
  "min-[26rem]:grid-cols-2",
  "min-[52rem]:grid-cols-3",
  "min-[78rem]:grid-cols-4",
);

/** Default hover-fill + focus ring for cards outside a colored hero (e.g. All Settings). */
export const landingFeatureCardDefaultChrome = {
  cardFill: PALETTE["finscan-purple"].cardFill,
  focusRingOffset: "focus-visible:ring-offset-[var(--screening-surface-muted)]",
} as const;

export function LandingFeatureCardView({
  card,
  cardFillClass,
  focusRingOffsetClass,
  selected = false,
}: {
  card: LandingFeatureCard;
  cardFillClass: string;
  focusRingOffsetClass: string;
  /** Optional selected chrome (e.g. All Settings). Only when user has chosen the card. */
  selected?: boolean;
}) {
  const interactive = Boolean(card.navigates && card.onActivate);
  const showBadge = card.badgeCount != null && card.badgeCount > 0;

  const cardNode = (
    <div
      className={cn(
        "relative w-[var(--ace-landing-page-card-width)] rounded-[var(--ace-landing-page-card-radius)]",
        "shadow-[var(--ace-landing-page-card-shadow)]",
        "transition-[box-shadow] duration-[var(--ace-motion-duration-medium)]",
        "[transition-timing-function:var(--ace-motion-ease-standard)]",
        "hover:shadow-[0_20px_40px_rgb(0_0_0_/_0.28)]",
      )}
    >
      <div
        className={cn(
          "group/fill relative overflow-hidden rounded-[var(--ace-landing-page-card-radius)]",
          "min-h-[calc(var(--ace-landing-page-card-min-height)*0.85)]",
          "border-[0.5px] border-solid",
          selected
            ? "border-[var(--ace-button-purple-500)]"
            : "border-[var(--ace-landing-page-card-border)]",
          "bg-[var(--ace-landing-page-card-surface)]",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-0 origin-bottom",
            cardFillClass,
            "scale-y-[calc((var(--ace-landing-page-card-footer-py)*2)/(var(--ace-landing-page-card-min-height)*0.85))]",
            "transition-transform duration-500",
            "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            "motion-reduce:transition-none",
            "group-hover/fill:scale-y-100",
          )}
        />
        {showBadge ? (
          <CountBadge
            count={card.badgeCount!}
            tone={card.badgeTone}
            label={`${card.badgeCount} items`}
          />
        ) : null}
        {card.headerIcon ? <CardHeaderIcon name={card.headerIcon} /> : null}
        <AceLandingPageCard
          variant="description"
          title={card.title}
          description={card.description}
          showHeaderActions={false}
          showFooterStats={false}
          showFooterLink={false}
          elevateOnHover={false}
          className={cn(
            "relative z-[1] h-full min-h-[calc(var(--ace-landing-page-card-min-height)*0.85)] border-transparent bg-transparent shadow-none",
            "[&>header]:border-transparent [&>header]:bg-transparent",
            "[&>footer]:border-transparent [&>footer]:bg-transparent",
            "[&_header_.invisible]:hidden",
            showBadge || card.headerIcon ? "[&>header>div]:pr-8" : undefined,
          )}
        />
      </div>
    </div>
  );

  if (interactive) {
    return (
      <div
        role="link"
        tabIndex={0}
        onClick={card.onActivate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            card.onActivate?.();
          }
        }}
        className={cn(
          "cursor-pointer rounded-[var(--ace-landing-page-card-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
          focusRingOffsetClass,
        )}
      >
        {cardNode}
      </div>
    );
  }

  return <div className="cursor-pointer">{cardNode}</div>;
}

export function ProductLandingPage({
  product,
  heroDescription,
  featureCards,
  linkColumns,
  palette = "finscan-purple",
}: ProductLandingPageProps) {
  const { startPageProduct, setStartPageProduct } = useUserFlow();
  const [featuresExpanded, setFeaturesExpanded] = useState(true);
  const [chattyOpen, setChattyOpen] = useState(false);
  const colors = PALETTE[palette];
  const isStartPage = startPageProduct === product;

  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface)] text-[var(--screening-text-primary)]">
        <ReviewFlowSiteHeader activeProduct={product} />

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
          <div className="flex min-w-0 flex-wrap items-center gap-4 md:gap-6">
            <p className={cn(aceTypography(ACE_TYPE.p1SemiBold), "m-0 text-[var(--screening-text-primary)]")}>
              Welcome to FinScan v7.0
            </p>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={isStartPage}
                onCheckedChange={(checked) =>
                  setStartPageProduct(checked === true ? product : null)
                }
                aria-label="Set as my start page"
              />
              <span className={cn(aceTypography(ACE_TYPE.p1Regular), "text-sm text-[var(--screening-text-primary)]")}>
                Set as my start page
              </span>
            </label>
          </div>
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

        <section
          className={cn(
            "relative shrink-0 px-4 py-[1.875rem] md:px-8 md:py-10",
            colors.heroGradient,
          )}
        >
          <div aria-hidden className={cn("pointer-events-none absolute inset-0", colors.heroOverlay)} />
          <div className="relative mx-auto flex w-fit max-w-full flex-col gap-5">
            <p
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "m-0 max-w-full text-left text-sm leading-[1.65] text-white md:text-base",
                "whitespace-normal min-[78rem]:whitespace-nowrap",
                "[text-shadow:0_1px_2px_rgb(26_20_59_/_0.35)]",
              )}
            >
              {heroDescription}
            </p>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity,margin] duration-[var(--ace-motion-duration-slow)]",
                "[transition-timing-function:var(--ace-motion-ease-standard)]",
                "motion-reduce:transition-none",
                featuresExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "-mt-5 grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="min-h-0 overflow-hidden" aria-hidden={!featuresExpanded}>
                <div className={landingFeatureCardGridClass}>
                  {featureCards.map((card) => (
                    <LandingFeatureCardView
                      key={card.id}
                      card={card}
                      cardFillClass={colors.cardFill}
                      focusRingOffsetClass={colors.focusRingOffset}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-expanded={featuresExpanded}
              onClick={() => setFeaturesExpanded((open) => !open)}
              className={cn(
                aceTypography(ACE_TYPE.captionBold),
                "w-fit text-left text-white underline-offset-2 hover:underline",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2",
                colors.focusRingOffset,
              )}
            >
              {featuresExpanded ? "Show less" : "Show more"}
            </button>
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col justify-center px-4 py-4 md:px-8 md:py-5">
          <div className="mx-auto grid w-full max-w-[80rem] grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {linkColumns.map((column) => (
              <div key={column.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <MaterialSymbol
                    name={column.icon}
                    size="md"
                    className="text-[var(--screening-text-secondary)]"
                  />
                  <h2
                    className={cn(
                      aceTypography(ACE_TYPE.p1Bold),
                      "m-0 text-sm text-[var(--screening-text-primary)]",
                    )}
                  >
                    {column.title}
                  </h2>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {column.links.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        className={cn(
                          aceTypography(ACE_TYPE.p1Regular),
                          "text-left text-sm text-[var(--screening-text-primary)]",
                          "rounded-[var(--radius-sm)] transition-colors duration-[var(--ace-motion-duration-fast)]",
                          "[transition-timing-function:var(--ace-motion-ease-standard)]",
                          "hover:text-[var(--screening-primary)] hover:underline",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
                        )}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="shrink-0 border-t border-[var(--screening-border-strong)] px-4 py-3 md:px-8">
          <p
            className={cn(
              aceTypography(ACE_TYPE.footerRegular),
              "m-0 text-[var(--screening-text-secondary)]",
            )}
          >
            Copyright © Innovative Systems, Inc. 2015-2026. All rights reserved.
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
            colors.floatingAction,
            "text-white shadow-[var(--ace-landing-page-card-shadow-hover)]",
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
