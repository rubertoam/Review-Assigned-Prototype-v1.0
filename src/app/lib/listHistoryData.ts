import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import {
  getListProfileForRow,
  type ListProfileData,
  type ListProfileDataTable,
  type ListProfileGeneralField,
} from "./listProfileData";

export type ListHistoryField = {
  label: string;
  value: string;
};

export type ListHistoryVersion = {
  id: string;
  modifiedLabel: string;
  /** Full list profile snapshot for this history version (All-tab sections). */
  profile: ListProfileData;
};

export type ListHistoryDiffRow = {
  label: string;
  newerValue: string;
  olderValue: string;
  changed: boolean;
};

const EMPTY = "--";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function unit(seed: number, salt: number): number {
  const x = Math.sin((seed + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function formatListHistoryDate(seed: number, versionIndex: number, withMs: boolean): string {
  const baseMs = Date.UTC(2026, 3, 14, 17, 32, 52, 867);
  const stepDays = 14 + Math.floor(unit(seed, 8 + versionIndex) * 12);
  const ms =
    baseMs -
    versionIndex * stepDays * 24 * 60 * 60 * 1000 -
    Math.floor(unit(seed, 9 + versionIndex) * 3_600_000);
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

function cloneTable(table: ListProfileDataTable): ListProfileDataTable {
  return {
    columns: [...table.columns],
    rows: table.rows.map((row) => [...row]),
  };
}

function cloneProfile(profile: ListProfileData): ListProfileData {
  return {
    general: profile.general.map((field) => ({ ...field })),
    addresses: cloneTable(profile.addresses),
    dates: cloneTable(profile.dates),
    idNumbers: cloneTable(profile.idNumbers),
    person: cloneTable(profile.person),
    tracking: cloneTable(profile.tracking),
  };
}

function setGeneralField(
  general: ListProfileGeneralField[],
  label: string,
  value: string,
): ListProfileGeneralField[] {
  return general.map((field) => (field.label === label ? { ...field, value } : field));
}

function getGeneralValue(general: readonly ListProfileGeneralField[], label: string): string {
  return general.find((field) => field.label === label)?.value ?? EMPTY;
}

/** Flatten a list profile into labeled fields for differences comparison. */
export function flattenListProfileForDiff(profile: ListProfileData): ListHistoryField[] {
  const fields: ListHistoryField[] = profile.general.map((field) => ({
    label: field.label,
    value: field.value || EMPTY,
  }));

  const appendTable = (sectionLabel: string, table: ListProfileDataTable) => {
    if (table.rows.length === 0) {
      fields.push({ label: `${sectionLabel} · (empty)`, value: EMPTY });
      return;
    }
    table.rows.forEach((row, rowIndex) => {
      table.columns.forEach((column, colIndex) => {
        fields.push({
          label: `${sectionLabel} · Row ${rowIndex + 1} · ${column}`,
          value: row[colIndex] || EMPTY,
        });
      });
    });
  };

  appendTable("Addresses", profile.addresses);
  appendTable("Dates", profile.dates);
  appendTable("ID Numbers", profile.idNumbers);
  appendTable("Person", profile.person);
  appendTable("Tracking", profile.tracking);

  return fields;
}

function fieldMap(fields: readonly ListHistoryField[]): Map<string, string> {
  return new Map(fields.map((field) => [field.label, field.value]));
}

export function diffListHistoryVersions(
  newer: ListHistoryVersion,
  older: ListHistoryVersion,
): ListHistoryDiffRow[] {
  const newerFields = flattenListProfileForDiff(newer.profile);
  const olderFields = flattenListProfileForDiff(older.profile);
  const newerMap = fieldMap(newerFields);
  const olderMap = fieldMap(olderFields);
  const labels = Array.from(new Set([...newerMap.keys(), ...olderMap.keys()]));

  return labels.map((label) => {
    const newerValue = newerMap.get(label) ?? EMPTY;
    const olderValue = olderMap.get(label) ?? EMPTY;
    return {
      label,
      newerValue,
      olderValue,
      changed: newerValue !== olderValue,
    };
  });
}

export function olderListHistoryVersions(
  versions: readonly ListHistoryVersion[],
  newerId: string | null,
): ListHistoryVersion[] {
  if (!newerId) return [];
  const newerIndex = versions.findIndex((version) => version.id === newerId);
  if (newerIndex < 0) return [];
  return versions.slice(newerIndex + 1);
}

function formatUpdatedDateIso(seed: number, versionIndex: number): string {
  const baseMs = Date.UTC(2026, 3, 14, 9, 17, 12);
  const stepDays = 14 + Math.floor(unit(seed, 8 + versionIndex) * 12);
  const ms =
    baseMs -
    versionIndex * stepDays * 24 * 60 * 60 * 1000 -
    Math.floor(unit(seed, 9 + versionIndex) * 3_600_000);
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.000`;
}

function mutateProfileForVersion(
  base: ListProfileData,
  row: ScreeningResultRow,
  seed: number,
  versionIndex: number,
): ListProfileData {
  const profile = cloneProfile(base);

  if (versionIndex === 0) {
    return profile;
  }

  const updatedDate = formatUpdatedDateIso(seed, versionIndex);
  const versionNumber = Number.parseInt(getGeneralValue(profile.general, "Version"), 10);
  const olderVersion = Number.isFinite(versionNumber)
    ? String(Math.max(1, versionNumber - versionIndex * 101))
    : getGeneralValue(profile.general, "Version");

  profile.general = setGeneralField(profile.general, "Full Name", `${row.name} (Prior)`);
  profile.general = setGeneralField(profile.general, "Updated Date", updatedDate);
  profile.general = setGeneralField(profile.general, "Version", olderVersion);
  profile.general = setGeneralField(
    profile.general,
    "Active",
    unit(seed, 30 + versionIndex) > 0.7 ? "No" : "Yes",
  );
  profile.general = setGeneralField(
    profile.general,
    "Deleted",
    versionIndex > 1 && unit(seed, 40 + versionIndex) > 0.85 ? "Yes" : "No",
  );

  if (profile.addresses.rows[0]) {
    const city = profile.addresses.rows[0][1] ?? "";
    profile.addresses.rows[0] = [
      ...profile.addresses.rows[0].slice(0, 1),
      versionIndex === 1 ? `${city} (prior)` : city,
      ...profile.addresses.rows[0].slice(2),
    ];
  }

  if (profile.person.rows[0] && unit(seed, 55 + versionIndex) > 0.45) {
    const categoryCol = profile.person.columns.indexOf("Category");
    if (categoryCol >= 0) {
      profile.person.rows[0] = profile.person.rows[0].map((cell, index) =>
        index === categoryCol ? "Weak" : cell,
      );
    }
  }

  if (profile.tracking.rows[0]) {
    const valueCol = profile.tracking.columns.indexOf("Tracking Information Value");
    if (valueCol >= 0) {
      const current = profile.tracking.rows[0][valueCol] ?? "";
      profile.tracking.rows[0] = profile.tracking.rows[0].map((cell, index) =>
        index === valueCol ? `${current}-v${versionIndex}` : cell,
      );
    }
  }

  return profile;
}

function buildVersion(
  row: ScreeningResultRow,
  seed: number,
  versionIndex: number,
): ListHistoryVersion {
  const base = getListProfileForRow(row);
  return {
    id: `list-history-${row.id}-${versionIndex}`,
    modifiedLabel: formatListHistoryDate(seed, versionIndex, true),
    profile: mutateProfileForVersion(base, row, seed, versionIndex),
  };
}

function versionCountForRow(seed: number): number {
  return 1 + Math.floor(unit(seed, 5) * 3); // 1–3 versions
}

/** Newest-first list history versions for a screening match row. */
export function initialListHistoryVersionsForRow(row: ScreeningResultRow): ListHistoryVersion[] {
  const seed = hashString(row.id);
  const count = versionCountForRow(seed);
  return Array.from({ length: count }, (_, versionIndex) =>
    buildVersion(row, seed, versionIndex),
  );
}
