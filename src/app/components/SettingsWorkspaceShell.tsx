import { useState, type ReactNode } from "react";
import { AceSidebar, type AceSidebarGroup } from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { ThemeProvider } from "../context/ThemeContext";
import type { ProductNavId } from "./ReviewFlowSiteHeader";
import { AskChattyBubble } from "./AskChattyBubble";
import { ReviewFlowSiteHeader } from "./ReviewFlowSiteHeader";
import { cn } from "./ui/utils";

type SettingsWorkspaceShellProps = {
  /** Left side of the sub-header (title, breadcrumb, etc.). */
  headerStart: ReactNode;
  activeProduct?: ProductNavId;
  showSidebarToggle?: boolean;
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  sidebarGroups: AceSidebarGroup[];
  emptyGroupMessage?: string;
  children: ReactNode;
};

/**
 * Settings screens shell — same AceSidebar `variant="groups"` as reporting
 * (DS white panel surface), muted gray page/main, no “New Group” control.
 */
export function SettingsWorkspaceShell({
  headerStart,
  activeProduct,
  showSidebarToggle = false,
  sidebarOpen: sidebarOpenProp,
  onSidebarOpenChange,
  sidebarGroups,
  emptyGroupMessage = "None.",
  children,
}: SettingsWorkspaceShellProps) {
  const [sidebarOpenUncontrolled, setSidebarOpenUncontrolled] = useState(true);
  const sidebarOpen = sidebarOpenProp ?? sidebarOpenUncontrolled;
  const setSidebarOpen = onSidebarOpenChange ?? setSidebarOpenUncontrolled;
  const [chattyOpen, setChattyOpen] = useState(false);
  const [menuHost, setMenuHost] = useState<HTMLDivElement | null>(null);

  return (
    <ThemeProvider>
      <div
        ref={setMenuHost}
        className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]"
      >
        <ReviewFlowSiteHeader activeProduct={activeProduct} />

        <div className="flex shrink-0 items-center justify-between border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-5">
            {showSidebarToggle ? (
              <>
                <button
                  type="button"
                  aria-expanded={sidebarOpen}
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  className={sidebarIconButtonClass}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
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
                <MaterialSymbol
                  name="keyboard_arrow_right"
                  size="md"
                  className="shrink-0 text-[var(--screening-text-muted)]"
                />
              </>
            ) : null}
            {headerStart}
          </div>
          <div
            className={cn(
              "inline-flex shrink-0 items-center justify-center border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-3 py-1.5",
              "[font:var(--ace-type-caption-bold)] [letter-spacing:var(--ace-type-caption-bold-tracking)]",
              "text-[var(--screening-text-secondary)]",
            )}
            aria-label="Organization"
          >
            AIG
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
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
              addLabel="New Group"
              emptyGroupMessage={emptyGroupMessage}
              menuPortalContainer={menuHost}
              className={cn(
                // Keep DS panel surface (--screening-surface); only relocate shadow to wrapper.
                "h-full min-h-0 !shadow-none",
                // Settings groups have no Edit/Copy/Delete — hide ACE overflow triggers.
                "[&_button[aria-label^='Actions for']]:hidden",
              )}
            />
          </div>

          <main className="relative z-0 min-h-0 min-w-0 flex-1 overflow-auto bg-[var(--screening-surface-muted)]">
            {children}
          </main>
        </div>

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
