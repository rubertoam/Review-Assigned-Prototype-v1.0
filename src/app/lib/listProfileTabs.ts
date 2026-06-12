export const LIST_PROFILE_TABS = [
  { id: "general", label: "General" },
  { id: "addresses", label: "Addresses" },
  { id: "dates", label: "Dates" },
  { id: "id-numbers", label: "ID Numbers" },
  { id: "person", label: "Person" },
  { id: "tracking", label: "Tracking Information" },
  { id: "all", label: "All" },
] as const;

export type ListProfileTabId = (typeof LIST_PROFILE_TABS)[number]["id"];

/** Tabs rendered as accordion sections inside the All tab (excludes All itself). */
export const LIST_PROFILE_ACCORDION_TABS = LIST_PROFILE_TABS.filter((tab) => tab.id !== "all");
