import type {
  ActivityComment,
  ActivityLogItem,
  SubmittedReviewComment,
} from "./reviewActivityData";
import {
  activityAuthorForFlow,
  type ReviewFlowVariant,
} from "./reviewActivityData";

export type StoredRowActivity = {
  comments: ActivityComment[];
  logs: ActivityLogItem[];
  timeline: Array<{ type: "comment" | "log"; id: string }>;
};

/** In-memory only — refresh resets the prototype. */
const activityByRowId: Record<string, StoredRowActivity> = {};

function readAll(): Record<string, StoredRowActivity> {
  return activityByRowId;
}

function writeAll(data: Record<string, StoredRowActivity>): void {
  for (const key of Object.keys(activityByRowId)) {
    delete activityByRowId[key];
  }
  Object.assign(activityByRowId, data);
}

export function getPersistedRowActivity(rowId: string): StoredRowActivity | null {
  return readAll()[rowId] ?? null;
}

function mergeStoredRowActivity(
  existing: StoredRowActivity | undefined,
  incoming: StoredRowActivity,
): StoredRowActivity {
  if (!existing) return incoming;
  return {
    comments: [...existing.comments, ...incoming.comments],
    logs: [...existing.logs, ...incoming.logs],
    timeline: [...existing.timeline, ...incoming.timeline],
  };
}

export function buildReviewSubmitActivity(
  flowVariant: ReviewFlowVariant,
  {
    status,
    comments,
    files,
    links,
  }: {
    status: string;
    comments: readonly SubmittedReviewComment[];
    files: readonly { id: string; name: string }[];
    links: readonly { id: string; url: string }[];
  },
): StoredRowActivity {
  const batchId = `${Date.now()}`;
  const author = activityAuthorForFlow(flowVariant);

  const activityComments: ActivityComment[] = comments.map((comment) => ({
    id: `persisted-comment-${comment.id}-${batchId}`,
    author: author.name,
    avatarSrc: author.avatarSrc,
    relativeTime: comment.relativeTime,
    body: comment.body,
    commentActions: "readonly",
  }));

  const activityLogs: ActivityLogItem[] = [
    {
      id: `persisted-status-${batchId}`,
      kind: "status-change",
      relativeTime: "Just now",
      author: author.name,
      statusLabel: status,
    },
  ];

  for (const file of files) {
    activityLogs.push({
      id: `persisted-upload-${file.id}-${batchId}`,
      kind: "upload",
      relativeTime: "Just now",
      fileName: file.name,
    });
  }

  for (const link of links) {
    activityLogs.push({
      id: `persisted-link-${link.id}-${batchId}`,
      kind: "url",
      relativeTime: "Just now",
      url: link.url,
    });
  }

  return {
    comments: activityComments,
    logs: activityLogs,
    timeline: [
      ...activityComments.map((comment) => ({ type: "comment" as const, id: comment.id })),
      ...activityLogs.map((item) => ({ type: "log" as const, id: item.id })),
    ],
  };
}

export function appendPersistedReviewActivity(
  rowIds: readonly string[],
  incoming: StoredRowActivity,
): void {
  if (rowIds.length === 0) return;
  const all = readAll();
  for (const rowId of rowIds) {
    all[rowId] = mergeStoredRowActivity(all[rowId], incoming);
  }
  writeAll(all);
}
