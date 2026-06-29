import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { AceTabs, aceTabButtonId } from "./ui/ace-tabs";
import { getListProfileForRow } from "../lib/listProfileData";
import { LIST_PROFILE_TABS, type ListProfileTabId } from "../lib/listProfileTabs";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";
import {
  GeneralProfileComparison,
  ListProfileAllTabView,
  ListProfileDataTableView,
} from "./ListProfileTabContent";

export function ListProfileInlineContent({
  row,
  className,
  headerTrailing,
}: {
  row: ScreeningResultRow;
  className?: string;
  headerTrailing?: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<ListProfileTabId>("general");
  const tabPrefix = useId();
  const profile = useMemo(() => getListProfileForRow(row), [row]);

  useEffect(() => {
    setActiveTab("general");
  }, [row.id]);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <AceTabs
            items={[...LIST_PROFILE_TABS]}
            value={activeTab}
            onValueChange={(id) => setActiveTab(id as ListProfileTabId)}
            idPrefix={tabPrefix}
            aria-label="List profile sections"
          />
        </div>
        {headerTrailing ? <div className="shrink-0">{headerTrailing}</div> : null}
      </div>
      <div
        role="tabpanel"
        id={`${tabPrefix}-panel-${activeTab}`}
        aria-labelledby={aceTabButtonId(tabPrefix, activeTab)}
        className="pt-4"
      >
        {activeTab === "general" ? <GeneralProfileComparison row={row} /> : null}
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
