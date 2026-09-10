type AiCommentRow = {
  id: string;
  name: string;
  matchScore: number;
  status: string;
};

const LIST_SIGNAL_LABELS = [
  "PEP-list",
  "watchlist",
  "sanctions-list",
  "screening-list",
] as const;

const SAFE_RESOLUTION = [
  "identity is adequately corroborated for release (multi-field match above the clearance threshold)",
  "identity resolution meets the release bar (DOB and geography align with the client profile)",
  "corroborating attributes are sufficient to treat this as a resolved non-hit for clearance",
  "secondary identifiers support release-grade identity confirmation against the client record",
] as const;

const SAFE_ACTIONS = [
  "recommend Safe disposition; no further identity hold required",
  "clear as Safe under risk-based screening (no escalation path warranted)",
  "release as Safe; residual list noise does not justify continued review",
  "recommend Safe; treat residual score as non-material after identity confirmation",
] as const;

const ESCALATE_RESOLUTION = [
  "identity is not yet resolved (soft country-only corroboration is below release grade)",
  "identity remains ambiguous (name-dominant hit without enough secondary corroboration)",
  "identity adjudication is incomplete (partial attribute overlap falls short of release grade)",
  "client-to-list linkage is unresolved (score is high but supporting fields are thin)",
] as const;

const ESCALATE_ACTIONS = [
  "hold for identity adjudication (risk-based hold, never an OFAC block)",
  "route for Level 1 identity review before any release decision",
  "retain on a risk-based hold pending identity adjudication",
  "escalate for identity confirmation; do not clear on score alone",
] as const;

const SAFE_HUMAN_COMMENTS = [
  "This list record looks like the same person as the client. Identity checks are strong enough to clear it as Safe.",
  "The match lines up with the client profile on key attributes, so a Safe disposition is appropriate.",
  "Available identity evidence supports treating this as a non-material list hit and clearing it as Safe.",
  "Client and list details corroborate well enough to recommend Safe without further hold.",
] as const;

const ESCALATE_HUMAN_COMMENTS = [
  "This list record is not confirmed as the same person yet. Keep it on hold for identity review before clearing.",
  "The hit is strong on name but thin on supporting identity, so it should stay with Level 1 for adjudication.",
  "Identity is still ambiguous on this alert. Escalate for review rather than clearing on score alone.",
  "Corroboration is below release grade. Hold this match for identity adjudication before any Safe call.",
] as const;

const SYNTHETIC_DISCLAIMERS = [
  "adverse-media count is SYNTHETIC (forge-minted cassette, not a vendor report).",
  "media-hit tally is SYNTHETIC (prototype cassette; not sourced from a live vendor feed).",
  "adverse-media signal is SYNTHETIC (demo cassette only, not a production vendor extract).",
  "supporting media count is SYNTHETIC (seeded cassette data, not a real vendor payload).",
] as const;

export const MULTIPLE_ALERTS_COMMENT_MESSAGE = "Multiple alerts selected";

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: readonly T[], seed: number, salt: number): T {
  return items[(seed + salt) % items.length]!;
}

function formatListName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toUpperCase();
}

function confidenceForScore(score: number): "High" | "Medium" | "Low" {
  if (score >= 85) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

function buildStructuredPrintout(row: AiCommentRow, seed: number): string {
  const listLabel = pick(LIST_SIGNAL_LABELS, seed, 3);
  const displayName = formatListName(row.name);
  const score = Math.max(1, Math.min(100, Math.round(row.matchScore)));
  const disclaimer = pick(SYNTHETIC_DISCLAIMERS, seed, 29);

  if (row.status === "AI-Escalate") {
    const resolution = pick(ESCALATE_RESOLUTION, seed, 11);
    const action = pick(ESCALATE_ACTIONS, seed, 19);
    return `Strong ${listLabel} signal ('${displayName}', score ${score}) whose ${resolution}; ${action}. [${disclaimer}]`;
  }

  const resolution = pick(SAFE_RESOLUTION, seed, 11);
  const action = pick(SAFE_ACTIONS, seed, 19);
  return `Strong ${listLabel} signal ('${displayName}', score ${score}) whose ${resolution}; ${action}. [${disclaimer}]`;
}

function buildHumanComment(row: AiCommentRow, seed: number): string {
  if (row.status === "AI-Escalate") {
    return pick(ESCALATE_HUMAN_COMMENTS, seed, 23);
  }
  return pick(SAFE_HUMAN_COMMENTS, seed, 23);
}

/**
 * Three-part AI comment for a single alert:
 * Confidence, human-readable note, then structured printout.
 */
export function buildAiDecisionCommentForRow(row: AiCommentRow): string {
  const seed = hashSeed(row.id);
  const score = Math.max(1, Math.min(100, Math.round(row.matchScore)));
  const confidence = confidenceForScore(score);
  const human = buildHumanComment(row, seed);
  const printout = buildStructuredPrintout(row, seed);
  return `Confidence: ${confidence}\n\n${human}\n\n${printout}`;
}

/** Comment body for Review prefill. Multi-select uses a disabled placeholder message. */
export function buildAiDecisionCommentForRows(rows: readonly AiCommentRow[]): string {
  if (rows.length === 0) return "";
  if (rows.length > 1) return MULTIPLE_ALERTS_COMMENT_MESSAGE;
  return buildAiDecisionCommentForRow(rows[0]!);
}
