import { casesData } from "./reviewCaseData";

export type ClientDocumentItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  path: string;
  isUrl: boolean;
  modifyDate: string;
  modifyUser: string;
};

/** Seed documents for John Smith only. */
export const JOHN_SMITH_DOCUMENTS: readonly ClientDocumentItem[] = [
  {
    id: "doc-test-file",
    title: "Test file",
    category: "Unknown",
    description: "",
    path: "Test file.txt",
    isUrl: false,
    modifyDate: "27 Jul 2026 1:17:11 PM",
    modifyUser: "antonio",
  },
  {
    id: "doc-passport",
    title: "passport-scan.pdf",
    category: "Identification",
    description: "Primary government ID",
    path: "passport-scan.pdf",
    isUrl: false,
    modifyDate: "12 Jun 2026 9:04:22 AM",
    modifyUser: "janet",
  },
  {
    id: "doc-utility",
    title: "utility-bill-march.pdf",
    category: "Proof of Address",
    description: "",
    path: "utility-bill-march.pdf",
    isUrl: false,
    modifyDate: "03 May 2026 4:41:08 PM",
    modifyUser: "antonio",
  },
];

export function initialDocumentsForCase(caseIndex: number): ClientDocumentItem[] {
  if (casesData[caseIndex]?.name === "John Smith") {
    return JOHN_SMITH_DOCUMENTS.map((doc) => ({ ...doc }));
  }
  return [];
}

export function formatDocumentModifyDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("day")} ${get("month")} ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`;
}
