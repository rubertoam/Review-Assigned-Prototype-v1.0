export const CASE_FILTER_GROUPS = [
  {
    label: "Risk",
    items: [
      { value: "risk-high", label: "High", selectedLabel: "Risk - High" },
      { value: "risk-medium", label: "Medium", selectedLabel: "Risk - Medium" },
      { value: "risk-low", label: "Low", selectedLabel: "Risk - Low" },
    ],
  },
  {
    label: "Review Target",
    items: [
      { value: "review-target-met", label: "Met", selectedLabel: "Review Target - Met" },
      {
        value: "review-target-overdue-warning",
        label: "Overdue Warning",
        selectedLabel: "Review Target - Overdue Warning",
      },
      { value: "review-target-overdue", label: "Overdue", selectedLabel: "Review Target - Overdue" },
    ],
  },
  {
    label: "Record Type",
    items: [
      { value: "individual", label: "Individual", selectedLabel: "Individual" },
      { value: "organization", label: "Organization", selectedLabel: "Organization" },
      {
        value: "unknown-record-type",
        label: "Unknown",
        selectedLabel: "Unknown Record Type",
      },
    ],
  },
  {
    label: "Application IDs",
    items: [
      { value: "application-isi", label: "ISI", selectedLabel: "Application - ISI" },
      {
        value: "application-isi-focus",
        label: "ISI Focus",
        selectedLabel: "Application - ISI Focus",
      },
      {
        value: "application-watchlist-api",
        label: "Watchlist API",
        selectedLabel: "Application - Watchlist API",
      },
      { value: "application-edd", label: "EDD", selectedLabel: "Application - EDD" },
    ],
  },
] as const;

export type CaseFilterValue = (typeof CASE_FILTER_GROUPS)[number]["items"][number]["value"];

export function caseFilterDisplayLabel(value: CaseFilterValue): string {
  for (const group of CASE_FILTER_GROUPS) {
    const match = group.items.find((item) => item.value === value);
    if (match) return match.selectedLabel;
  }
  return value;
}

export function caseFilterTriggerLabel(selectedFilters: ReadonlySet<CaseFilterValue>): string {
  if (selectedFilters.size === 0) return "All";
  if (selectedFilters.size === 1) {
    return caseFilterDisplayLabel([...selectedFilters][0]);
  }
  return `${selectedFilters.size} selected`;
}

export const CASE_SORT_OPTIONS = [
  { value: "name-asc", label: "A-Z" },
  { value: "name-desc", label: "Z-A" },
  { value: "results-asc", label: "Matches: Low to High" },
  { value: "results-desc", label: "Matches: High to Low" },
] as const;

export type CaseSortValue = (typeof CASE_SORT_OPTIONS)[number]["value"];

export type CaseRecordType = "individual" | "organization" | "unknown";

const SANCTION_CASE_SEED = [
  { name: "John Smith", results: 110, selected: true },
  { name: "Mr. Jose A Gonzalez", results: 8, selected: false },
  { name: "Muammar Qadhafi", results: 7, selected: false },
  { name: "Jane Doe", results: 5, selected: false },
  { name: "Bank of Iran", results: 3, selected: false, isEntity: true },
  { name: "Bank of Moscow", results: 2, selected: false, isEntity: true },
] as const;

/** Extra names so Sanction Matches case list can scroll (~50 total). */
const SANCTION_CASE_EXTRA_NAMES = [
  "Elena Vargas",
  "Marcus Chen",
  "Sofia Rahman",
  "David Okonkwo",
  "Priya Nair",
  "Hassan Al-Rashid",
  "Claire Fontaine",
  "Andrei Petrov",
  "Mei Lin Zhao",
  "Carlos Mendoza",
  "Amara Diallo",
  "Noah Bergman",
  "Yuki Tanaka",
  "Fatima El-Sayed",
  "Lucas Ferreira",
  "Ingrid Solberg",
  "Omar Haddad",
  "Grace Okafor",
  "Kenji Watanabe",
  "Isabella Rossi",
  "Samuel Wright",
  "Nadia Kowalski",
  "Theo Martin",
  "Aisha Patel",
  "Diego Alvarez",
  "Hannah Berg",
  "Ravi Krishnan",
  "Lena Hofmann",
  "Peter Novak",
  "Camille Dubois",
  "Jin Park",
  "Maya Thompson",
  "Viktor Sokolov",
  "Leila Mansour",
  "Owen Gallagher",
  "Sara Lindqvist",
  "Mohammed Farooq",
  "Chloe Bennett",
  "Antonio Silva",
  "Yara Haddadin",
  "Global Trade LLC",
  "Northern Holdings AG",
  "Pacific Rim Partners",
  "Atlas Shipping Co",
] as const;

function buildSanctionCasesData() {
  const extras = SANCTION_CASE_EXTRA_NAMES.map((name, index) => {
    const isEntity =
      name.includes("LLC") ||
      name.includes("AG") ||
      name.includes("Partners") ||
      name.includes("Co");
    return {
      name,
      results: 2 + (index % 9),
      selected: false,
      ...(isEntity ? { isEntity: true as const } : {}),
    };
  });
  return [...SANCTION_CASE_SEED, ...extras];
}

export const casesData = buildSanctionCasesData();

export type ClientRiskBand = "low" | "medium" | "high";

export interface ClientProfileFields {
  clientId: string;
  countryLabel: string;
  dob: string | null;
  gender: string | null;
  addressLines: readonly [string, string, string];
  lastModified: string;
  applicationLabel: string;
  reviewTargetSummary: string;
  /** Approaching review target deadline — shows overdue warning in profile. */
  reviewTargetOverdue: boolean;
  /** Past review target deadline. */
  reviewTargetPastDue: boolean;
  riskBand: ClientRiskBand;
  recordType?: CaseRecordType;
  showIdVerified: boolean;
}

/** Per-case profile: aligned with `casesData` indices (0–5). */
export const CLIENT_PROFILES: readonly ClientProfileFields[] = [
  {
    clientId: "K7M2R9X",
    countryLabel: "USA",
    dob: "03/23/1978",
    gender: "Male",
    addressLines: ["3943 Allegheny Blvd.", "Pittsburgh, PA 15203", "USA"],
    lastModified: "01 Oct 2025 16:44:14",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: true,
    reviewTargetPastDue: false,
    riskBand: "low",
    showIdVerified: true,
  },
  {
    clientId: "B4N8PW2Q",
    countryLabel: "USA",
    dob: "04/11/1985",
    gender: "Male",
    addressLines: ["2200 Brickell Ave, Ste 400", "Miami, FL 33129", "USA"],
    lastModified: "28 Sep 2025 09:12:03",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    reviewTargetPastDue: false,
    riskBand: "low",
    showIdVerified: true,
  },
  {
    clientId: "H3T9K6MV8",
    countryLabel: "LBY",
    dob: "06/07/1942",
    gender: "Male",
    addressLines: ["Government District, Bab al-Azizia complex", "Tripoli, Tripoli District", "Libya"],
    lastModified: "15 Sep 2025 11:30:44",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    reviewTargetPastDue: false,
    riskBand: "high",
    showIdVerified: true,
  },
  {
    clientId: "F4R8N2J",
    countryLabel: "USA",
    dob: "09/14/1992",
    gender: "Female",
    addressLines: ["88 Beacon St, Unit 6B", "Boston, MA 02108", "USA"],
    lastModified: "22 Aug 2025 14:05:47",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    reviewTargetPastDue: false,
    riskBand: "medium",
    showIdVerified: true,
  },
  {
    clientId: "M9K3V7QX",
    countryLabel: "IRN",
    dob: null,
    gender: null,
    addressLines: ["No. 328 Mirdamad Blvd, Valiasr Office Tower", "Tehran 19115", "Iran"],
    lastModified: "10 Jul 2025 08:41:19",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    reviewTargetPastDue: false,
    riskBand: "high",
    recordType: "unknown",
    showIdVerified: false,
  },
  {
    clientId: "R6W2K5NP",
    countryLabel: "RUS",
    dob: null,
    gender: null,
    addressLines: ["12 Neglinnaya St, Central Bank Annex", "Moscow 107031", "Russia"],
    lastModified: "03 Jun 2025 17:22:11",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    reviewTargetPastDue: false,
    riskBand: "high",
    showIdVerified: false,
  },
];

export function recordTypeForCase(caseIndex: number): CaseRecordType {
  const profile = clientProfileForCaseIndex(caseIndex);
  if (profile.recordType) return profile.recordType;
  const item = casesData[caseIndex];
  if (!item) return "unknown";
  if ("isEntity" in item && item.isEntity) return "organization";
  return "individual";
}

export function caseMatchesSingleFilter(caseIndex: number, filter: CaseFilterValue): boolean {
  const profile = clientProfileForCaseIndex(caseIndex);
  switch (filter) {
    case "risk-high":
      return profile.riskBand === "high";
    case "risk-medium":
      return profile.riskBand === "medium";
    case "risk-low":
      return profile.riskBand === "low";
    case "review-target-met":
      return !profile.reviewTargetOverdue && !profile.reviewTargetPastDue;
    case "review-target-overdue-warning":
      return profile.reviewTargetOverdue;
    case "review-target-overdue":
      return profile.reviewTargetPastDue;
    case "individual":
      return recordTypeForCase(caseIndex) === "individual";
    case "organization":
      return recordTypeForCase(caseIndex) === "organization";
    case "unknown-record-type":
      return recordTypeForCase(caseIndex) === "unknown";
    case "application-isi":
      return profile.applicationLabel === "ISI";
    case "application-isi-focus":
      return profile.applicationLabel === "ISI Focus";
    case "application-watchlist-api":
      return profile.applicationLabel === "Watchlist API";
    case "application-edd":
      return profile.applicationLabel === "EDD";
    default:
      return false;
  }
}

export function caseMatchesFilters(
  caseIndex: number,
  selectedFilters: ReadonlySet<CaseFilterValue>,
): boolean {
  if (selectedFilters.size === 0) return true;
  for (const filter of selectedFilters) {
    if (caseMatchesSingleFilter(caseIndex, filter)) return true;
  }
  return false;
}

export function compareCasesBySort(
  aIndex: number,
  bIndex: number,
  sort: CaseSortValue,
  /** Resolves the result count to sort by; defaults to the static case total. */
  resultCountForIndex: (index: number) => number = (index) => casesData[index].results,
  /** Resolves the display name to sort by; defaults to Sanction Matches cases. */
  nameForIndex: (index: number) => string = (index) => casesData[index].name,
): number {
  if (sort === "results-asc" || sort === "results-desc") {
    const diff = resultCountForIndex(aIndex) - resultCountForIndex(bIndex);
    const ordered = sort === "results-desc" ? -diff : diff;
    return ordered !== 0 ? ordered : aIndex - bIndex;
  }

  const nameCompare = nameForIndex(aIndex).localeCompare(nameForIndex(bIndex), undefined, {
    sensitivity: "base",
  });
  return sort === "name-desc" ? -nameCompare : nameCompare;
}

/** Extra generated cases that should surface as Review Target — Overdue Warning. */
const EXTRA_OVERDUE_WARNING_NAMES = new Set([
  "Fatima El-Sayed",
  "Viktor Sokolov",
]);

export function clientProfileForCaseIndex(caseIndex: number): ClientProfileFields {
  if (caseIndex < CLIENT_PROFILES.length) {
    return CLIENT_PROFILES[caseIndex]!;
  }
  const base = CLIENT_PROFILES[caseIndex % CLIENT_PROFILES.length]!;
  const caseItem = casesData[caseIndex];
  const isEntity = Boolean(caseItem && "isEntity" in caseItem && caseItem.isEntity);
  const namedOverdueWarning = EXTRA_OVERDUE_WARNING_NAMES.has(caseItem?.name ?? "");
  const reviewTargetOverdue = caseIndex % 11 === 0 || namedOverdueWarning;
  // Past-due is mutually exclusive with overdue-warning so filters and row chrome stay clear.
  const reviewTargetPastDue = caseIndex % 19 === 0 && !reviewTargetOverdue;
  return {
    ...base,
    clientId: `C${(1000 + caseIndex).toString(36).toUpperCase()}`,
    reviewTargetOverdue,
    reviewTargetPastDue,
    riskBand: (["low", "medium", "high"] as const)[caseIndex % 3],
    recordType: isEntity ? "organization" : base.recordType ?? "individual",
    dob: isEntity ? null : base.dob,
    gender: isEntity ? null : base.gender,
    showIdVerified: !isEntity,
  };
}

export function riskBandPresentation(band: ClientRiskBand): { box: string; text: string; label: string } {
  if (band === "high") {
    return { box: "bg-[#fdeaea] dark:bg-[#3d2f2f]", text: "text-[#9e2a2a] dark:text-[#f0b4b4]", label: "High Risk" };
  }
  if (band === "medium") {
    return { box: "bg-[#fff4e8] dark:bg-[#3d3628]", text: "text-[#c2410c] dark:text-[#f0c090]", label: "Medium Risk" };
  }
  return { box: "bg-[#f8fbf1] dark:bg-[#2a302c]", text: "text-[#87b531] dark:text-[#a8d46a]", label: "Low Risk" };
}
