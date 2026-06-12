export const CASE_INTERACTION_OPTIONS = [
  "Risk",
  "Review Target",
  "Organization",
  "Individual",
] as const;

export type CaseInteraction = (typeof CASE_INTERACTION_OPTIONS)[number];
export type CaseInteractionPicklist = "all" | CaseInteraction;

export const casesData = [
  { name: "John Smith", results: 8, selected: true, interaction: "Individual" as const },
  { name: "Mr. Jose A Gonzalez", results: 8, selected: false, interaction: "Review Target" as const },
  { name: "Muammar Qadhafi", results: 7, selected: false, interaction: "Risk" as const },
  { name: "Jane Doe", results: 5, selected: false, interaction: "Individual" as const },
  { name: "Bank of Iran", results: 3, selected: false, isEntity: true, interaction: "Organization" as const },
  { name: "Bank of Moscow", results: 2, selected: false, isEntity: true, interaction: "Organization" as const },
] as const;

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
  reviewTargetOverdue: boolean;
  riskBand: ClientRiskBand;
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
    riskBand: "high",
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
    riskBand: "high",
    showIdVerified: false,
  },
];

export function clientProfileForCaseIndex(caseIndex: number): ClientProfileFields {
  const i = Math.max(0, Math.min(caseIndex, CLIENT_PROFILES.length - 1));
  return CLIENT_PROFILES[i];
}

export function riskBandPresentation(band: ClientRiskBand): { box: string; text: string; label: string } {
  if (band === "high") {
    return { box: "bg-[#fdeaea] dark:bg-[#3d2f2f]", text: "text-[#9e2a2a] dark:text-[#f0b4b4]", label: "High Risk" };
  }
  if (band === "medium") {
    return { box: "bg-[#fff4e8] dark:bg-[#3d3628]", text: "text-[#c2410c] dark:text-[#f0c090]", label: "Medium Risk" };
  }
  return { box: "bg-[#f8fbf1] dark:bg-[#2a302c]", text: "text-[#87b531]", label: "Low Risk" };
}
