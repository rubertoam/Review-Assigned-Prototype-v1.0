import type { ScreeningResultRow } from "../components/ScreeningResultsTable";
import avatarJanet from "../../assets/review-activity/avatar-janet.png";
import avatarLaura from "../../assets/review-activity/avatar-laura.png";
import avatarSam from "../../assets/review-activity/avatar-sam.png";

export type ReviewActivityFilter = "all" | "comments" | "log";

export type ReviewActivityCommentActions = "thread" | "owner" | "simple" | "readonly";

export type ActivityComment = {
  id: string;
  author: string;
  avatarSrc: string;
  relativeTime: string;
  body: string;
  parentId?: string;
  commentActions: ReviewActivityCommentActions;
};

export type ActivityLogItem = {
  id: string;
  kind: "status-change" | "upload" | "url" | "screening";
  relativeTime: string;
  author?: string;
  statusLabel?: string;
  screeningRule?: string;
  fileName?: string;
  url?: string;
};

export type SubmittedReviewComment = {
  id: string;
  body: string;
  timestamp: string;
  relativeTime: string;
};

export type GeneratedRowActivity = {
  comments: ActivityComment[];
  logs: ActivityLogItem[];
  timeline: ReadonlyArray<{ type: "comment" | "log"; id: string }>;
  demoCommentIds: ReadonlySet<string>;
  demoLogIds: ReadonlySet<string>;
};

type ActivityAuthor = {
  name: string;
  avatarSrc: string;
};

const ACTIVITY_AUTHORS = {
  sam: { name: "Sam Admin", avatarSrc: avatarSam },
  janet: { name: "Janet Analyst", avatarSrc: avatarJanet },
  laura: { name: "Laura Leader", avatarSrc: avatarLaura },
} as const satisfies Record<string, ActivityAuthor>;

export type ReviewFlowVariant = "level-1" | "level-2";

export function activityAuthorForFlow(flowVariant: ReviewFlowVariant) {
  return flowVariant === "level-1" ? ACTIVITY_AUTHORS.janet : ACTIVITY_AUTHORS.laura;
}

const RELATIVE_TIMES = [
  "Just now",
  "5 min ago",
  "15 min ago",
  "1 hour ago",
  "3 hours ago",
  "1 day ago",
  "2 days ago",
] as const;

const STATUS_LABELS = [
  "Escalate",
  "Safe",
  "In Process",
  "False Positive",
  "Confirmed Match",
  "Pending Review",
] as const;

const SCREENING_RULES = [
  "Sanctioned Matches",
  "PEP Screening",
  "Adverse Media",
  "Watchlist Screening",
  "Entity Resolution",
  "High-Risk Jurisdiction",
] as const;

const UPLOAD_FILE_NAMES = [
  "client-review-doc.pdf",
  "supporting-evidence.pdf",
  "source-list-export.pdf",
  "match-analysis-notes.pdf",
  "compliance-memo.pdf",
  "screening-summary.pdf",
  "due-diligence-pack.pdf",
  "research-attachment.pdf",
] as const;

const ACTIVITY_URLS = [
  "https://intranet/research/client-profile",
  "https://sharepoint/compliance/review-queue",
  "https://wiki/escalation-playbook",
  "https://lists/sanctions-update-log",
] as const;

const OTHER_COMMENT_BODIES = [
  "@Laura Leader and @Janet Analyst thank you for moving quickly on {name}.",
  "@Janet Analyst please take another look at {name} when you can.",
  "Compared {name} to the list profile — the match still looks significant.",
  "@Sam Admin can you confirm next steps for {name}?",
  "Adding context on {name} for the review team.",
  "@Laura Leader flagging {name} for a second opinion.",
] as const;

const JANET_COMMENT_BODIES = [
  "@Laura Leader this case needs more information on {name}, so I am escalating.",
  "Escalating {name} — I've attached research documents for review.",
  "@Laura Leader please review {name}; match score and list data look concerning.",
  "Moving {name} forward for secondary review with supporting notes attached.",
] as const;

const THREAD_REPLY_BODIES = [
  "Thank you @Janet Analyst",
  "Reviewed {name} — agree with the escalation.",
  "@Janet Analyst I'll review {name} this afternoon.",
  "Thanks for the update on {name}, @Janet Analyst.",
] as const;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]!;
}

function pickMany<T>(random: () => number, items: readonly T[], count: number): T[] {
  const pool = [...items];
  const selected: T[] = [];
  const limit = Math.min(count, pool.length);
  for (let index = 0; index < limit; index += 1) {
    const choiceIndex = Math.floor(random() * pool.length);
    selected.push(pool.splice(choiceIndex, 1)[0]!);
  }
  return selected;
}

function fillTemplate(template: string, name: string): string {
  return template.replaceAll("{name}", name);
}

function shuffle<T>(random: () => number, items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

function createCommentId(rowId: string, index: number) {
  return `${rowId}-activity-comment-${index}`;
}

function createLogId(rowId: string, index: number) {
  return `${rowId}-activity-log-${index}`;
}

export function generateRowActivity(row: ScreeningResultRow): GeneratedRowActivity {
  const random = createSeededRandom(hashString(`${row.id}:${row.name}`));
  const comments: ActivityComment[] = [];
  const logs: ActivityLogItem[] = [];
  const timeline: Array<{ type: "comment" | "log"; id: string }> = [];
  const demoCommentIds = new Set<string>();
  const demoLogIds = new Set<string>();

  let commentIndex = 0;
  let logIndex = 0;

  const otherAuthorCount = 1 + Math.floor(random() * 2);
  const otherAuthors = shuffle(random, [ACTIVITY_AUTHORS.sam, ACTIVITY_AUTHORS.laura]).slice(
    0,
    otherAuthorCount,
  );

  const topLevelComments: ActivityComment[] = [];

  for (const author of otherAuthors) {
    const id = createCommentId(row.id, commentIndex++);
    const comment: ActivityComment = {
      id,
      author: author.name,
      avatarSrc: author.avatarSrc,
      relativeTime: pick(random, RELATIVE_TIMES),
      body: fillTemplate(pick(random, OTHER_COMMENT_BODIES), row.name),
      commentActions: "simple",
    };
    comments.push(comment);
    topLevelComments.push(comment);
    demoCommentIds.add(id);
  }

  const janetCommentId = createCommentId(row.id, commentIndex++);
  const janetComment: ActivityComment = {
    id: janetCommentId,
    author: ACTIVITY_AUTHORS.janet.name,
    avatarSrc: ACTIVITY_AUTHORS.janet.avatarSrc,
    relativeTime: pick(random, RELATIVE_TIMES),
    body: fillTemplate(pick(random, JANET_COMMENT_BODIES), row.name),
    commentActions: "thread",
  };
  comments.push(janetComment);
  topLevelComments.push(janetComment);
  demoCommentIds.add(janetCommentId);

  if (random() > 0.2) {
    const replyAuthor = random() > 0.5 ? ACTIVITY_AUTHORS.laura : ACTIVITY_AUTHORS.sam;
    const replyId = createCommentId(row.id, commentIndex++);
    comments.push({
      id: replyId,
      author: replyAuthor.name,
      avatarSrc: replyAuthor.avatarSrc,
      relativeTime: pick(random, RELATIVE_TIMES),
      body: fillTemplate(pick(random, THREAD_REPLY_BODIES), row.name),
      parentId: janetCommentId,
      commentActions: "simple",
    });
    demoCommentIds.add(replyId);
  }

  const logKinds = shuffle(random, ["status-change", "upload", "screening", "url"] as const);
  const logCount = 2 + Math.floor(random() * 3);
  const selectedLogKinds = pickMany(random, logKinds, logCount);

  for (const kind of selectedLogKinds) {
    const id = createLogId(row.id, logIndex++);
    const relativeTime = pick(random, RELATIVE_TIMES);
    const author = pick(random, [ACTIVITY_AUTHORS.janet, ACTIVITY_AUTHORS.sam, ACTIVITY_AUTHORS.laura]);

    let item: ActivityLogItem;
    if (kind === "status-change") {
      item = {
        id,
        kind,
        relativeTime,
        author: author.name,
        statusLabel: pick(random, STATUS_LABELS),
      };
    } else if (kind === "upload") {
      item = {
        id,
        kind,
        relativeTime,
        fileName: pick(random, UPLOAD_FILE_NAMES),
      };
    } else if (kind === "url") {
      item = {
        id,
        kind,
        relativeTime,
        url: pick(random, ACTIVITY_URLS),
      };
    } else {
      item = {
        id,
        kind,
        relativeTime,
        screeningRule: pick(random, SCREENING_RULES),
      };
    }

    logs.push(item);
    demoLogIds.add(id);
  }

  const timelineEntries = shuffle(random, [
    ...topLevelComments.map((comment) => ({ type: "comment" as const, id: comment.id })),
    ...logs.map((item) => ({ type: "log" as const, id: item.id })),
  ]);
  timeline.push(...timelineEntries);

  return {
    comments,
    logs,
    timeline,
    demoCommentIds,
    demoLogIds,
  };
}

export function commentFromSubmitted(submitted: SubmittedReviewComment): ActivityComment {
  return {
    id: submitted.id,
    author: "You",
    avatarSrc: avatarSam,
    relativeTime: submitted.relativeTime,
    body: submitted.body,
    commentActions: "owner",
  };
}

export function createUserActivityComment(body: string, parentId?: string): ActivityComment {
  return {
    id: `comment-${Math.random().toString(36).slice(2, 9)}`,
    author: "You",
    avatarSrc: avatarSam,
    relativeTime: "Just now",
    body,
    parentId,
    commentActions: "owner",
  };
}

export function createSubmittedComment(body: string): SubmittedReviewComment {
  return {
    id: `comment-${Math.random().toString(36).slice(2, 9)}`,
    body,
    timestamp: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    relativeTime: "Just now",
  };
}

export function mergeUploadLogItems(
  logs: ActivityLogItem[],
  uploadedFiles: readonly { id: string; name: string }[],
  uploadedLinks: readonly { id: string; url: string }[],
): ActivityLogItem[] {
  const dynamicUploads: ActivityLogItem[] = uploadedFiles.map((file, index) => ({
    id: `upload-${file.id}`,
    kind: "upload" as const,
    relativeTime: index === 0 ? "Just now" : "15 min ago",
    fileName: file.name,
  }));

  const dynamicLinks: ActivityLogItem[] = uploadedLinks.map((link, index) => ({
    id: `link-${link.id}`,
    kind: "url" as const,
    relativeTime: index === 0 ? "Just now" : "15 min ago",
    url: link.url,
  }));

  return [...dynamicUploads, ...dynamicLinks, ...logs];
}

export function getReplyCount(comments: readonly ActivityComment[], parentId: string): number {
  return comments.filter((comment) => comment.parentId === parentId).length;
}

export function getPrimaryRowId(selectedRows: readonly ScreeningResultRow[]): string | null {
  return selectedRows[0]?.id ?? null;
}

export function createPendingDecisionLogs(
  selectedStatus: string | null,
): ActivityLogItem[] {
  if (!selectedStatus) return [];

  return [
    {
      id: "decision-status",
      kind: "status-change",
      relativeTime: "Just now",
      author: "You",
      statusLabel: selectedStatus,
    },
  ];
}
