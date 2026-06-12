import { useEffect, useId, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { AceTabs, aceTabButtonId } from "./ui/ace-tabs";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { getListProfileForRow } from "../lib/listProfileData";
import { LIST_PROFILE_TABS, type ListProfileTabId } from "../lib/listProfileTabs";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";
import {
  ListProfileAllTabView,
  ListProfileDataTableView,
  ListProfileGeneralTable,
} from "./ListProfileTabContent";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export { LIST_PROFILE_TABS, type ListProfileTabId } from "../lib/listProfileTabs";

export interface ListProfilePanelProps {
  row: ScreeningResultRow;
  onBack: () => void;
}

export function ListProfilePanel({ row, onBack }: ListProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<ListProfileTabId>("general");
  const tabPrefix = useId();
  const profile = useMemo(() => getListProfileForRow(row), [row]);

  useEffect(() => {
    setActiveTab("general");
  }, [row.id]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 bg-[var(--screening-surface)] px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "mb-3 inline-flex cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)] transition-colors",
            "hover:text-[var(--dialog-modal-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
          )}
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          <span
            className={cn(aceTypography(ACE_TYPE.p1Bold), "text-[var(--screening-primary)]")}
            style={notoVar}
          >
            Back to List
          </span>
        </button>

        <AceTabs
          items={[...LIST_PROFILE_TABS]}
          value={activeTab}
          onValueChange={(id) => setActiveTab(id as ListProfileTabId)}
          idPrefix={tabPrefix}
          aria-label="List profile sections"
        />
      </div>

      <div
        role="tabpanel"
        id={`${tabPrefix}-panel-${activeTab}`}
        aria-labelledby={aceTabButtonId(tabPrefix, activeTab)}
        className="min-h-0 flex-1 overflow-y-auto bg-[var(--screening-surface)] px-4 py-6"
      >
        {activeTab === "general" ? <ListProfileGeneralTable fields={profile.general} /> : null}
        {activeTab === "addresses" ? (
          <ListProfileDataTableView table={profile.addresses} caption="Address records" />
        ) : null}
        {activeTab === "dates" ? (
          <ListProfileDataTableView table={profile.dates} caption="Date records" />
        ) : null}
        {activeTab === "id-numbers" ? (
          <ListProfileDataTableView table={profile.idNumbers} caption="Identification numbers" />
        ) : null}
        {activeTab === "person" ? (
          <ListProfileDataTableView table={profile.person} caption="Person records" />
        ) : null}
        {activeTab === "tracking" ? (
          <ListProfileDataTableView table={profile.tracking} caption="Tracking information" />
        ) : null}
        {activeTab === "all" ? <ListProfileAllTabView profile={profile} /> : null}
        <p className="sr-only">Selected match: {row.name}</p>
      </div>
    </div>
  );
}
