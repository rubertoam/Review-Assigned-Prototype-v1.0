import type { ScreeningResultRow } from "../components/ScreeningResultsTable";

export type ListProfileGeneralField = { label: string; value: string };

export type ListProfileDataTable = {
  columns: string[];
  rows: string[][];
};

export type ListProfileData = {
  general: ListProfileGeneralField[];
  addresses: ListProfileDataTable;
  dates: ListProfileDataTable;
  idNumbers: ListProfileDataTable;
  person: ListProfileDataTable;
  tracking: ListProfileDataTable;
};

type CaseClientContext = {
  caseName: string;
  isEntity: boolean;
  country: string;
  dob: string | null;
  gender: string | null;
  cityLine: string;
  addressCity: string;
  lastModified: string;
  listName: string;
  listId: string;
};

const CASE_CLIENT_CONTEXT: readonly CaseClientContext[] = [
  {
    caseName: "John Smith",
    isEntity: false,
    country: "United States",
    dob: "03/23/1978",
    gender: "Male",
    cityLine: "Pittsburgh PA",
    addressCity: "Pittsburgh PA",
    lastModified: "2026-04-14 09:17:12.000",
    listName: "LSEG - World Check",
    listId: "WC",
  },
  {
    caseName: "Mr. Jose A Gonzalez",
    isEntity: false,
    country: "United States",
    dob: "04/11/1985",
    gender: "Male",
    cityLine: "Miami FL",
    addressCity: "Miami FL",
    lastModified: "2025-09-28 09:12:03.000",
    listName: "LSEG - World Check",
    listId: "WC",
  },
  {
    caseName: "Muammar Qadhafi",
    isEntity: false,
    country: "Libya",
    dob: "06/07/1942",
    gender: "Male",
    cityLine: "Tripoli",
    addressCity: "Tripoli",
    lastModified: "2025-09-15 11:30:44.000",
    listName: "OFAC SDN List",
    listId: "OFAC",
  },
  {
    caseName: "Jane Doe",
    isEntity: false,
    country: "United States",
    dob: "09/14/1992",
    gender: "Female",
    cityLine: "Boston MA",
    addressCity: "Boston MA",
    lastModified: "2025-08-22 14:05:47.000",
    listName: "LSEG - World Check",
    listId: "WC",
  },
  {
    caseName: "Bank of Iran",
    isEntity: true,
    country: "Iran",
    dob: null,
    gender: null,
    cityLine: "Tehran",
    addressCity: "Tehran",
    lastModified: "2025-07-10 08:41:19.000",
    listName: "OFAC SDN List",
    listId: "OFAC",
  },
  {
    caseName: "Bank of Moscow",
    isEntity: true,
    country: "Russia",
    dob: null,
    gender: null,
    cityLine: "Moscow",
    addressCity: "Moscow",
    lastModified: "2025-06-03 17:22:11.000",
    listName: "EU Consolidated List",
    listId: "EU",
  },
] as const;

function parseScreeningRowId(id: string): { caseIndex: number; rowIndex: number } {
  const match = /^c(\d+)-(\d+)$/.exec(id);
  if (!match) return { caseIndex: 0, rowIndex: 0 };
  return { caseIndex: Number(match[1]), rowIndex: Number(match[2]) - 1 };
}

function stableUid(caseIndex: number, rowIndex: number, salt: number): string {
  return String(1000 + caseIndex * 137 + rowIndex * 17 + salt);
}

function stableVersion(caseIndex: number, rowIndex: number): string {
  return String(20_000_000 + caseIndex * 10_003 + rowIndex * 101);
}

function splitPersonName(fullName: string): { first: string; last: string } {
  const cleaned = fullName.replace(/^Mr\.\s*|^Mrs\.\s*/i, "").trim();
  const parts = cleaned.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return { first: fullName, last: "—" };
  if (parts.length === 1) return { first: parts[0], last: "—" };
  return { first: parts[0], last: parts[parts.length - 1] };
}

function johnSmithListProfile(row: ScreeningResultRow, rowIndex: number): ListProfileData {
  const profileId = String(2892 + rowIndex);
  const dobDisplay = row.dob !== "—" ? row.dob : "[Enter DOB]";

  return {
    general: [
      { label: "List Name", value: "LSEG - World Check" },
      { label: "List ID", value: "WC" },
      { label: "Full Name", value: row.name },
      { label: "List Profile ID", value: profileId },
      { label: "Record Type", value: "Individual" },
      { label: "Deleted", value: "No" },
      { label: "Load Date", value: "2026-04-14 07:43:19.000" },
      { label: "Updated Date", value: "2026-04-14 09:17:12.000" },
      { label: "Active", value: "Yes" },
      { label: "Version", value: stableVersion(0, rowIndex) },
    ],
    addresses: {
      columns: ["Address Type", "City Line", "Original City", "Main Entry", "UID"],
      rows: [["Place of Birth", "Pittsburgh PA", "Pittsburgh PA", "True", stableUid(0, rowIndex, 3)]],
    },
    dates: {
      columns: ["Type", "Value", "Original Type", "Original Date", "Main Entry", "UID"],
      rows: [
        ["Date of Birth", "0239949", "Date of Birth", dobDisplay, "True", stableUid(0, rowIndex, 1)],
        ["Date of Birth", "2694930", "Date of Birth", dobDisplay, "True", stableUid(0, rowIndex, 5)],
      ],
    },
    idNumbers: {
      columns: [
        "Type",
        "Subtype",
        "Value",
        "Country Issued",
        "Original Type",
        "Original Number",
        "Country",
        "UID",
      ],
      rows: [
        [
          "Identification Number",
          "Social Security Number",
          "444390928",
          "United States",
          "SSN",
          "444-39-0928",
          "United States",
          stableUid(0, rowIndex, 9),
        ],
      ],
    },
    person: {
      columns: [
        "Type",
        "Full Name",
        "Original Type",
        "Category",
        "Original First Name",
        "Original Last Name",
        "UID",
      ],
      rows: [
        ["Alias", "Johnny Smith", "A.K.A.", "Strong", "Johnny", "Smith", "5157"],
        ["Alias", "John Smith", "A.K.A.", "Strong", "John", "Smith", "5158"],
        ["Primary", "Jonathan Smith", "—", "Strong", "Jonathan", "Smith", "5159"],
      ],
    },
    tracking: {
      columns: ["Type", "Tracking Information Value", "Original Type"],
      rows: [
        ["ID from Source", "7721", "UID"],
        ["Unclassified", "SDNTK", "Sanction Program"],
      ],
    },
  };
}

function generatedListProfile(
  row: ScreeningResultRow,
  caseIndex: number,
  rowIndex: number,
): ListProfileData {
  const ctx = CASE_CLIENT_CONTEXT[Math.min(caseIndex, CASE_CLIENT_CONTEXT.length - 1)];
  const { first, last } = splitPersonName(row.name);
  const profileId = String(2100 + caseIndex * 100 + rowIndex);
  const dobDisplay = row.dob !== "—" ? row.dob : ctx.dob ?? "[Enter DOB]";
  const recordType = ctx.isEntity ? "Organization" : "Individual";
  const idValue = String(100_000_000 + caseIndex * 1_111_111 + rowIndex * 10_007).slice(0, 9);
  const formattedId =
    ctx.country === "United States" && !ctx.isEntity
      ? `${idValue.slice(0, 3)}-${idValue.slice(3, 5)}-${idValue.slice(5)}`
      : idValue;

  const personRows: string[][] = ctx.isEntity
    ? [
        [
          "Primary",
          row.name,
          "—",
          "Strong",
          row.name,
          "—",
          stableUid(caseIndex, rowIndex, 1),
        ],
        [
          "Alias",
          ctx.caseName,
          "A.K.A.",
          "Strong",
          ctx.caseName,
          "—",
          stableUid(caseIndex, rowIndex, 2),
        ],
      ]
    : [
        [
          "Primary",
          row.name,
          "—",
          "Strong",
          first,
          last,
          stableUid(caseIndex, rowIndex, 1),
        ],
        [
          "Alias",
          ctx.caseName,
          "A.K.A.",
          "Strong",
          splitPersonName(ctx.caseName).first,
          splitPersonName(ctx.caseName).last,
          stableUid(caseIndex, rowIndex, 2),
        ],
      ];

  const idSubtype = ctx.isEntity ? "Registration Number" : "National Identifier";
  const idOriginalType = ctx.isEntity ? "REG" : ctx.country === "United States" ? "SSN" : "NID";

  return {
    general: [
      { label: "List Name", value: ctx.listName },
      { label: "List ID", value: ctx.listId },
      { label: "Full Name", value: row.name },
      { label: "List Profile ID", value: profileId },
      { label: "Record Type", value: recordType },
      { label: "Deleted", value: "No" },
      { label: "Load Date", value: `2026-0${(caseIndex % 9) + 1}-14 07:43:19.000` },
      { label: "Updated Date", value: ctx.lastModified },
      { label: "Active", value: "Yes" },
      { label: "Version", value: stableVersion(caseIndex, rowIndex) },
    ],
    addresses: {
      columns: ["Address Type", "City Line", "Original City", "Main Entry", "UID"],
      rows: [
        [
          ctx.isEntity ? "Registered Office" : "Place of Birth",
          ctx.cityLine,
          ctx.addressCity,
          "True",
          stableUid(caseIndex, rowIndex, 3),
        ],
      ],
    },
    dates: {
      columns: ["Type", "Value", "Original Type", "Original Date", "Main Entry", "UID"],
      rows: ctx.isEntity
        ? [
            [
              "Incorporation Date",
              String(1_200_000 + caseIndex * 10_000 + rowIndex),
              "Incorporation Date",
              "—",
              "True",
              stableUid(caseIndex, rowIndex, 4),
            ],
          ]
        : [
            [
              "Date of Birth",
              String(200_000 + caseIndex * 10_000 + rowIndex * 101),
              "Date of Birth",
              dobDisplay,
              "True",
              stableUid(caseIndex, rowIndex, 4),
            ],
            [
              "Date of Birth",
              String(300_000 + caseIndex * 10_000 + rowIndex * 103),
              "Date of Birth",
              dobDisplay,
              "True",
              stableUid(caseIndex, rowIndex, 6),
            ],
          ],
    },
    idNumbers: {
      columns: [
        "Type",
        "Subtype",
        "Value",
        "Country Issued",
        "Original Type",
        "Original Number",
        "Country",
        "UID",
      ],
      rows: [
        [
          "Identification Number",
          idSubtype,
          idValue,
          ctx.country,
          idOriginalType,
          formattedId,
          ctx.country,
          stableUid(caseIndex, rowIndex, 9),
        ],
      ],
    },
    person: {
      columns: [
        "Type",
        "Full Name",
        "Original Type",
        "Category",
        "Original First Name",
        "Original Last Name",
        "UID",
      ],
      rows: personRows,
    },
    tracking: {
      columns: ["Type", "Tracking Information Value", "Original Type"],
      rows:
        caseIndex >= 4
          ? [
              ["ID from Source", stableUid(caseIndex, rowIndex, 11), "UID"],
              ["Unclassified", "IRAN", "Sanction Program"],
            ]
          : caseIndex === 2
            ? [
                ["ID from Source", stableUid(caseIndex, rowIndex, 11), "UID"],
                ["Unclassified", "SDGT", "Sanction Program"],
              ]
            : [
                ["ID from Source", stableUid(caseIndex, rowIndex, 11), "UID"],
                ["Unclassified", "WC-REF", "Reference Code"],
              ],
    },
  };
}

export type ListProfileSummary = {
  listCategory: string;
  listId: string;
  listProfileId: string;
};

/** List metadata for screening table columns (aligned with General tab fields). */
export function getListProfileSummaryForRow(row: ScreeningResultRow): ListProfileSummary {
  const { caseIndex, rowIndex } = parseScreeningRowId(row.id);
  if (caseIndex === 0) {
    return {
      listCategory: "LSEG - World Check",
      listId: "WC",
      listProfileId: String(2892 + rowIndex),
    };
  }

  const ctx = CASE_CLIENT_CONTEXT[Math.min(caseIndex, CASE_CLIENT_CONTEXT.length - 1)];
  return {
    listCategory: ctx.listName,
    listId: ctx.listId,
    listProfileId: String(2100 + caseIndex * 100 + rowIndex),
  };
}

export function getListProfileForRow(row: ScreeningResultRow): ListProfileData {
  const { caseIndex, rowIndex } = parseScreeningRowId(row.id);
  if (caseIndex === 0) {
    return johnSmithListProfile(row, rowIndex);
  }
  return generatedListProfile(row, caseIndex, rowIndex);
}
