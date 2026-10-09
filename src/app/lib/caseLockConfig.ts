import { casesData, LOCKED_CASE_CLIENT_NAME } from "./reviewCaseData";
import { lauraProfileImageUrl } from "./profileAssets";

export const BANK_OF_IRAN_CASE_INDEX = casesData.findIndex(
  (item) => item.name === LOCKED_CASE_CLIENT_NAME,
);

const LOCKED_CASE_REVIEWER = {
  name: "Laura Leader",
  shortName: "Laura",
  imageUrl: lauraProfileImageUrl,
} as const;

export function isCaseLockedByAnotherUser(caseIndex: number): boolean {
  return casesData[caseIndex]?.name === LOCKED_CASE_CLIENT_NAME;
}

export function lockedCaseReviewer(caseIndex: number) {
  if (!isCaseLockedByAnotherUser(caseIndex)) return null;
  return LOCKED_CASE_REVIEWER;
}
