import { useState, type ReactNode } from "react";
import { AceSidebar, type AceSidebarGroup } from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { ThemeProvider } from "../context/ThemeContext";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { AskChattyBubble } from "./AskChattyBubble";
import { ReviewFlowSiteHeader } from "./ReviewFlowSiteHeader";
import { cn } from "./ui/utils";

type ReportingWorkspaceShellProps = {
  title: string;
  titleIcon?: string;
  /** ACE sidebar open/close control left of the page title. Default true. */
  showSidebarToggle?: boolean;
  /** Hide the groups-variant “New Group” control (e.g. Data Manager). */
  showNewGroupControl?: boolean;
  /** Label for the groups-variant create control. Default “New Group”. */
  newGroupLabel?: string;
  sidebarGroups: AceSidebarGroup[];
  emptyGroupMessage?: string;
  children: ReactNode;
  modals?: ReactNode;
};

export function ReportingWorkspaceShell({
  title,
  titleIcon,
  showSidebarToggle = true,
  showNewGroupControl = true,
  newGroupLabel = "New Group",
  sidebarGroups,
  emptyGroupMessage = "None.",
  children,
  modals,
}: ReportingWorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chattyOpen, setChattyOpen] = useState(false);
  const [menuHost, setMenuHost] = useState<HTMLDivElement | null>(null);

  return (
    <ThemeProvider>
      <div
        ref={setMenuHost}
        className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]"
      >
        <ReviewFlowSiteHeader activeProduct="reporting" />

        <div className="flex shrink-0 items-center justify-between border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-5">
            {showSidebarToggle ? (
              <button
                type="button"
                aria-expanded={sidebarOpen}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                className={sidebarIconButtonClass}
                onClick={() => setSidebarOpen((open) => !open)}
              >
                <MaterialSymbol
                  name="left_panel_close"
                  size="md"
                  className={cn(
                    "text-current transition-transform duration-[var(--ace-motion-duration-medium)] [transition-timing-function:var(--ace-motion-ease-standard)] motion-reduce:transition-none",
                    !sidebarOpen && "rotate-180",
                  )}
                />
              </button>
            ) : null}
            <div className="flex min-w-0 items-center gap-2">
              {titleIcon ? (
                <MaterialSymbol
                  name={titleIcon}
                  size="md"
                  className="text-[var(--ace-secondary-teal-500)]"
                />
              ) : null}
              <h1
                className={cn(
                  aceTypography(ACE_TYPE.h6Bold),
                  "m-0 text-base leading-[1.65] text-[var(--screening-text-primary)]",
                )}
              >
                {title}
              </h1>
            </div>
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

        <div className="flex min-h-0 flex-1">
          {/*
            AceSidebar paints --ace-sidebar-shadow but also uses overflow-hidden,
            which clips its own box-shadow. Host the shadow on this wrapper instead.
          */}
          <div
            className={cn(
              "relative z-[1] flex h-full min-h-0 shrink-0 flex-col",
              sidebarOpen && "shadow-[var(--ace-sidebar-shadow)]",
            )}
          >
            <AceSidebar
              variant="groups"
              open={sidebarOpen}
              groups={sidebarGroups}
              showGroupAdd={false}
              addLabel={newGroupLabel}
              onNewGroup={showNewGroupControl ? () => undefined : undefined}
              emptyGroupMessage={emptyGroupMessage}
              menuPortalContainer={menuHost}
              className={cn(
                "h-full min-h-0 !shadow-none",
                // New Dashboard / New Group: Material Symbol + p1 label need a shared line box.
                showNewGroupControl &&
                  [
                    "[&>div>div:first-child>button]:!items-center",
                    "[&>div>div:first-child>button>.material-symbols-outlined]:!m-0",
                    "[&>div>div:first-child>button>.material-symbols-outlined]:!inline-flex",
                    "[&>div>div:first-child>button>.material-symbols-outlined]:!size-4",
                    "[&>div>div:first-child>button>.material-symbols-outlined]:!items-center",
                    "[&>div>div:first-child>button>.material-symbols-outlined]:!justify-center",
                    "[&>div>div:first-child>button>.material-symbols-outlined]:!leading-none",
                    "[&>div>div:first-child>button>.material-symbols-outlined]:![font-size:16px]",
                    "[&>div>div:first-child>button>span:not(.material-symbols-outlined)]:!leading-none",
                    "[&>div>div:first-child>button>span:not(.material-symbols-outlined)]:!py-0",
                  ].join(" "),
              )}
            />
          </div>

          <main className="relative z-0 min-h-0 min-w-0 flex-1 overflow-auto bg-[var(--screening-surface-muted)]">
            {children}
          </main>
        </div>

        {modals}

        <AskChattyBubble open={chattyOpen} onClose={() => setChattyOpen(false)} />
        <button
          type="button"
          aria-label={chattyOpen ? "Close Ask Chatty" : "Ask Chatty"}
          aria-expanded={chattyOpen}
          onClick={() => setChattyOpen((open) => !open)}
          className={cn(
            "fixed bottom-6 right-6 z-30 inline-flex size-12 items-center justify-center rounded-[var(--radius-md)]",
            "bg-[var(--ace-secondary-teal-400)] text-white shadow-[var(--ace-landing-page-card-shadow-hover)]",
            "dark:bg-[var(--ace-secondary-teal-500)]",
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
