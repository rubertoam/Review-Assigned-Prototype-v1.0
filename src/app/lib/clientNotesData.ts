import { casesData } from "./reviewCaseData";

export type ClientNote = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
};

const NOTE_AUTHORS = ["Sam", "Laura", "Rebecca"] as const;

const NOTE_BODIES = [
  "Verified identity documents against the application package.",
  "Followed up with the relationship manager on outstanding KYC items.",
  "No adverse media findings in the latest screening refresh.",
  "Client provided an updated proof of address; pending review.",
  "Escalated beneficial ownership discrepancy for secondary review.",
  "Confirmed source of funds narrative matches bank statements on file.",
  "Requested clarification on employment history gaps.",
  "Risk rating remains unchanged after annual review checklist.",
] as const;

/** Deterministic 0–1 value from case index + salt (stable across reloads). */
function caseUnit(caseIndex: number, salt: number): number {
  const x = Math.sin((caseIndex + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pickNoteCount(caseIndex: number): number {
  return 1 + Math.floor(caseUnit(caseIndex, 1) * 3);
}

function formatNoteTimestamp(caseIndex: number, noteIndex: number): string {
  const day = 1 + Math.floor(caseUnit(caseIndex, 10 + noteIndex) * 27);
  const monthIndex = Math.floor(caseUnit(caseIndex, 20 + noteIndex) * 12);
  const hour = 8 + Math.floor(caseUnit(caseIndex, 30 + noteIndex) * 10);
  const minute = Math.floor(caseUnit(caseIndex, 40 + noteIndex) * 60);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ] as const;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12) + 1;
  const minuteLabel = String(minute).padStart(2, "0");
  return `${day} ${months[monthIndex]} 2026 ${hour12}:${minuteLabel} ${period}`;
}

export function initialNotesForCase(caseIndex: number): ClientNote[] {
  if (!casesData[caseIndex]) return [];
  const count = pickNoteCount(caseIndex);
  const notes: ClientNote[] = [];
  for (let i = 0; i < count; i += 1) {
    const bodyIndex = Math.floor(caseUnit(caseIndex, 50 + i) * NOTE_BODIES.length);
    const authorIndex = Math.floor(caseUnit(caseIndex, 60 + i) * NOTE_AUTHORS.length);
    notes.push({
      id: `note-${caseIndex}-${i}`,
      body: NOTE_BODIES[bodyIndex]!,
      author: NOTE_AUTHORS[authorIndex]!,
      createdAt: formatNoteTimestamp(caseIndex, i),
    });
  }
  return notes;
}

export function formatNoteCreatedAt(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("day")} ${get("month")} ${get("year")} ${get("hour")}:${get("minute")} ${get("dayPeriod")}`;
}
