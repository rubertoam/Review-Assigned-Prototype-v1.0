import { casesData, CLIENT_PROFILES } from "./reviewCaseData";

export type ClientHistoryField = {
  label: string;
  value: string;
};

export type ClientHistoryVersion = {
  id: string;
  /** Dropdown / comparison label (includes milliseconds). */
  modifiedLabel: string;
  fields: readonly ClientHistoryField[];
};

export type ClientHistoryDiffRow = {
  label: string;
  newerValue: string;
  olderValue: string;
  changed: boolean;
};

const EMPTY = "--";

export const CLIENT_HISTORY_FIELD_LABELS = [
  "Modified Date",
  "Modified By",
  "Name",
  "Address",
  "Gender",
  "Country",
  "National ID",
  "DOB",
  "Initials",
  "CUF15",
  "Wallet",
  "Wallet2",
  "E Address",
  "Postal",
  "Postal Code2",
  "rtt2",
  "rtt",
  "Comment",
] as const;

export type ClientHistoryFieldLabel = (typeof CLIENT_HISTORY_FIELD_LABELS)[number];

const MODIFY_USERS = ["loaduser", "antonio", "janet", "system"] as const;

const ADDRESSES = [
  "P.O. BOX 205-164 BROOKLYN NY 11220",
  "3943 ALLEGHENY BLVD PITTSBURGH PA 15203",
  "2200 BRICKELL AVE STE 400 MIAMI FL 33129",
  "88 BEACON ST UNIT 6B BOSTON MA 02108",
  "GOVERNMENT DISTRICT BAB AL-AZIZIA TRIPOLI",
  "NO. 328 MIRDAMAD BLVD TEHRAN 19115",
  "12 NEGLINNAYA ST MOSCOW 107031",
] as const;

function caseUnit(caseIndex: number, salt: number): number {
  const x = Math.sin((caseIndex + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(list: readonly T[], caseIndex: number, salt: number): T {
  return list[Math.floor(caseUnit(caseIndex, salt) * list.length)]!;
}

function displayOrEmpty(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY;
}

function upperName(name: string): string {
  return name.toUpperCase();
}

/** Newest-first: versionIndex 0 is the latest record. */
function formatHistoryDate(caseIndex: number, versionIndex: number, withMs: boolean): string {
  // Anchor near the Jose mock; older versions step back by ~weeks.
  const baseMs = Date.UTC(2026, 3, 14, 17, 32, 52, 867); // 1:32:52.867 PM EDT-ish display
  const stepDays = 18 + Math.floor(caseUnit(caseIndex, 8 + versionIndex) * 10);
  const ms =
    baseMs -
    versionIndex * stepDays * 24 * 60 * 60 * 1000 -
    Math.floor(caseUnit(caseIndex, 9 + versionIndex) * 3_600_000);
  const date = new Date(ms);

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const millis = String(date.getUTCMilliseconds()).padStart(3, "0");
  const time = withMs
    ? `${get("hour")}:${get("minute")}:${get("second")}.${millis} ${get("dayPeriod")}`
    : `${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`;

  return `${get("day")} ${get("month")} ${get("year")} ${time}`;
}

function fieldsFromValues(
  values: Record<ClientHistoryFieldLabel, string>,
): ClientHistoryField[] {
  return CLIENT_HISTORY_FIELD_LABELS.map((label) => ({
    label,
    value: values[label],
  }));
}

function fieldValue(version: ClientHistoryVersion, label: string): string {
  return version.fields.find((field) => field.label === label)?.value ?? EMPTY;
}

/** Field-level diff for two history versions (newer vs older). */
export function diffClientHistoryVersions(
  newer: ClientHistoryVersion,
  older: ClientHistoryVersion,
): ClientHistoryDiffRow[] {
  return CLIENT_HISTORY_FIELD_LABELS.map((label) => {
    const newerValue = fieldValue(newer, label);
    const olderValue = fieldValue(older, label);
    return {
      label,
      newerValue,
      olderValue,
      changed: newerValue !== olderValue,
    };
  });
}

/** Matches the provided Client History mock for Mr. Jose A Gonzalez (single version). */
const JOSE_GONZALEZ_HISTORY: readonly ClientHistoryVersion[] = [
  {
    id: "history-jose-0",
    modifiedLabel: "14 Apr 2026 1:32:52.867 PM",
    fields: fieldsFromValues({
      "Modified Date": "14 Apr 2026 1:32:52 PM",
      "Modified By": "loaduser",
      Name: "MR. JOSE A GONZALEZ",
      Address: "P.O. BOX 205-164 BROOKLYN NY 11220",
      Gender: "Male",
      Country: "Unknown",
      "National ID": EMPTY,
      DOB: EMPTY,
      Initials: EMPTY,
      CUF15: EMPTY,
      Wallet: EMPTY,
      Wallet2: EMPTY,
      "E Address": EMPTY,
      Postal: EMPTY,
      "Postal Code2": EMPTY,
      rtt2: EMPTY,
      rtt: EMPTY,
      Comment: EMPTY,
    }),
  },
];

function buildVersion(caseIndex: number, versionIndex: number): ClientHistoryVersion {
  const caseItem = casesData[caseIndex];
  const profile = CLIENT_PROFILES[caseIndex];
  const name = upperName(caseItem?.name ?? "UNKNOWN");
  const addressFromProfile = profile
    ? profile.addressLines.join(" ").toUpperCase()
    : pick(ADDRESSES, caseIndex, 80 + versionIndex);
  const modifiedLabel = formatHistoryDate(caseIndex, versionIndex, true);
  const modifiedDate = formatHistoryDate(caseIndex, versionIndex, false);

  const nationalId =
    versionIndex === 0 || caseUnit(caseIndex, 120 + versionIndex) > 0.4
      ? String(100000000 + Math.floor(caseUnit(caseIndex, 121 + versionIndex) * 899999999))
      : EMPTY;

  const values: Record<ClientHistoryFieldLabel, string> = {
    "Modified Date": modifiedDate,
    "Modified By": pick(MODIFY_USERS, caseIndex, 90 + versionIndex),
    Name: name,
    Address:
      versionIndex === 0 ? addressFromProfile : pick(ADDRESSES, caseIndex, 100 + versionIndex),
    Gender: displayOrEmpty(profile?.gender ?? null),
    Country: displayOrEmpty(
      versionIndex > 0 ? (versionIndex % 2 === 0 ? "Unknown" : profile?.countryLabel) : profile?.countryLabel,
    ),
    "National ID": nationalId,
    DOB: displayOrEmpty(versionIndex > 1 ? null : profile?.dob ?? null),
    Initials:
      versionIndex === 0
        ? name
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 3)
        : EMPTY,
    CUF15: versionIndex === 0 && caseUnit(caseIndex, 125) > 0.7 ? "Y" : EMPTY,
    Wallet: EMPTY,
    Wallet2: EMPTY,
    "E Address":
      versionIndex === 0
        ? `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`
        : EMPTY,
    Postal: versionIndex === 0 ? displayOrEmpty(profile?.addressLines[1]?.split(" ").at(-1)) : EMPTY,
    "Postal Code2": EMPTY,
    rtt2: EMPTY,
    rtt: EMPTY,
    Comment:
      versionIndex === 0
        ? "Record updated during periodic review."
        : versionIndex === 1
          ? "Address verified against source system."
          : EMPTY,
  };

  return {
    id: `history-${caseIndex}-${versionIndex}`,
    modifiedLabel,
    fields: fieldsFromValues(values),
  };
}

function versionCountForCase(caseIndex: number): number {
  const name = casesData[caseIndex]?.name;
  if (name === "John Smith") return 3;
  if (name === "Mr. Jose A Gonzalez") return 1;
  if (name === "Muammar Qadhafi") return 2;
  if (name === "Jane Doe") return 2;
  return 1 + Math.floor(caseUnit(caseIndex, 5) * 2);
}

/** Seeded / deterministic client-history versions for a case (newest first). */
export function initialHistoryVersionsForCase(caseIndex: number): ClientHistoryVersion[] {
  const name = casesData[caseIndex]?.name;
  if (name === "Mr. Jose A Gonzalez") {
    return JOSE_GONZALEZ_HISTORY.map((version) => ({
      ...version,
      fields: version.fields.map((field) => ({ ...field })),
    }));
  }

  const count = versionCountForCase(caseIndex);
  return Array.from({ length: count }, (_, versionIndex) => buildVersion(caseIndex, versionIndex));
}

/** Versions older than the selected newer version (excludes the newer itself). */
export function olderHistoryVersions(
  versions: readonly ClientHistoryVersion[],
  newerId: string | null,
): ClientHistoryVersion[] {
  if (!newerId) return [];
  const newerIndex = versions.findIndex((version) => version.id === newerId);
  if (newerIndex < 0) return [];
  // Newest-first: anything after the newer index is older.
  return versions.slice(newerIndex + 1);
}
