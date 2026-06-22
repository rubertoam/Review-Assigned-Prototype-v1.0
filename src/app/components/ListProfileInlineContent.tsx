import { useEffect, useId, useMemo, useState } from "react";
import { AceTabs, aceTabButtonId } from "./ui/ace-tabs";
import { getListProfileForRow } from "../lib/listProfileData";
import { LIST_PROFILE_TABS, type ListProfileTabId } from "../lib/listProfileTabs";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";
import {
  ListProfileAllTabView,
  ListProfileDataTableView,
  ListProfileGeneralTable,
} from "./ListProfileTabContent";

export function ListProfileInlineContent({
  row,
  className,
}: {
  row: ScreeningResultRow;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState<ListProfileTabId>("general");
  const tabPrefix = useId();
  const profile = useMemo(() => getListProfileForRow(row), [row]);

  useEffect(() => {
    setActiveTab("general");
  }, [row.id]);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <AceTabs
        items={[...LIST_PROFILE_TABS]}
        value={activeTab}
        onValueChange={(id) => setActiveTab(id as ListProfileTabId)}
        idPrefix={tabPrefix}
        aria-label="List profile sections"
      />
      <div
        role="tabpanel"
        id={`${tabPrefix}-panel-${activeTab}`}
        aria-labelledby={aceTabButtonId(tabPrefix, activeTab)}
        className="pt-4"
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
