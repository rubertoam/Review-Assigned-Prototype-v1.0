/** Demo client-record comments of varying length for the profile middle panel. */
const CLIENT_RECORD_COMMENTS = [
  "KYC refresh complete.",
  "Customer confirmed address match via phone on last review cycle.",
  "No adverse media identified during periodic review. Profile remains Low Risk pending next scheduled screening.",
  "Client provided updated passport scan; DOB and nationality align with onboarding package. Escalate only if new list hits appear.",
  "Relationship manager notes ongoing wire activity to EU counterparties. Compliance spot-checked three transactions this quarter with no exceptions. Continue monitoring for changes in beneficial ownership or high-risk jurisdiction exposure that would warrant an out-of-cycle review.",
  "Entity onboarding packet incomplete — missing board resolution. Holding documents-required queue until legal uploads the certified copy.",
  "PEP adjacency only (spouse). Enhanced due diligence questionnaire filed 12 Mar 2026. No further action unless status changes.",
  "Short note: OK to clear false positives on phonetic name matches.",
  "Annual review: source of wealth attested as salary and investment income. Supporting bank statements on file. Comment exceeds display limit so analysts can open the full text in the modal when reviewing lengthy free-form narrative from the core banking system.",
  "—",
] as const;

export const CLIENT_PROFILE_PASSTHROUGH_PLACEHOLDER = "--";

export const CLIENT_PROFILE_FIELD_CHAR_LIMIT = 100;

/** Deterministic comment for a client profile case index. */
export function clientProfileCommentForCase(caseIndex: number): string {
  const safeIndex =
    ((caseIndex % CLIENT_RECORD_COMMENTS.length) + CLIENT_RECORD_COMMENTS.length) %
    CLIENT_RECORD_COMMENTS.length;
  return CLIENT_RECORD_COMMENTS[safeIndex]!;
}

export function truncateClientProfileField(
  value: string,
  limit: number = CLIENT_PROFILE_FIELD_CHAR_LIMIT,
): { display: string; truncated: boolean } {
  if (value.length <= limit) {
    return { display: value, truncated: false };
  }
  return { display: `${value.slice(0, limit)}…`, truncated: true };
}
