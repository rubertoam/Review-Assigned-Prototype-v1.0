import { useEffect, useMemo, useState } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import {
  type ActivityComment,
  type ActivityLogItem,
  createUserActivityComment,
  generateRowActivity,
  getReplyCount,
  type ReviewActivityFilter,
} from "../lib/reviewActivityData";
import { getPersistedRowActivity } from "../lib/reviewActivityState";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { AceGridExpandPanel } from "./AceGridExpandPanel";
import { ReviewActivityMatchSelect } from "./ReviewActivityMatchSelect";
import { cn } from "./ui/utils";
import { ScreeningStatusBadge } from "./ScreeningStatusBadge";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;
const NEUTRAL_800 = "text-[var(--screening-text-primary)]";
const PRIMARY_PURPLE = "text-[var(--screening-primary)]";
const ICON_CLASS = "text-[var(--screening-primary)]";
const ACCORDION_MOTION_CLASS =
  "duration-[var(--ace-accordion-duration)] [transition-timing-function:var(--ace-accordion-ease)]";

const ACTIVITY_FILTERS: { id: ReviewActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "comments", label: "Comments" },
  { id: "log", label: "Log" },
];

const MAX_ACTIVITY_RESULTS = 5;

const replyInputClass =
  "[&_input]:text-xs [&_input]:leading-[1.65] [&_input]:placeholder:text-xs [&_input]:placeholder:leading-[1.65]";

const COMMENT_ACTION_BUTTON_CLASS = cn(
  aceTypography(ACE_TYPE.p1Bold),
  "cursor-pointer border-0 bg-transparent p-0",
  PRIMARY_PURPLE,
);

function EditDeleteActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={onEdit}
        className={COMMENT_ACTION_BUTTON_CLASS}
        style={notoVar}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className={COMMENT_ACTION_BUTTON_CLASS}
        style={notoVar}
      >
        Delete
      </button>
    </div>
  );
}

function renderBodyText(body: string) {
  const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]+)?)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = mentionRegex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`} className={NEUTRAL_800}>
          {body.slice(lastIndex, match.index)}
        </span>,
      );
    }

    parts.push(
      <span key={`mention-${key++}`} className={cn("font-bold", PRIMARY_PURPLE)}>
        @{match[1]}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < body.length) {
    parts.push(
      <span key={`text-${key++}`} className={NEUTRAL_800}>
        {body.slice(lastIndex)}
      </span>,
    );
  }

  return parts;
}

function ActivityAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <img src={src} alt="" className="size-4 shrink-0 rounded-full object-cover" aria-hidden />
  );
}

function ActivityReplyField({
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const canSubmit = value.trim().length > 0;

  return (
    <div className="flex w-full min-w-0 items-center gap-2 px-4">
      <div className={cn("min-w-0 flex-1", replyInputClass)}>
        <AceInputField
          fieldSize="sm"
          placeholder="Write a reply and press Enter..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (canSubmit) onSubmit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
          aria-label="Write a reply"
        />
      </div>
      <button
        type="button"
        aria-label="Submit reply"
        disabled={!canSubmit}
        onClick={onSubmit}
        className={cn(
          "inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--screening-primary)] text-white",
          !canSubmit && "cursor-not-allowed opacity-50",
        )}
      >
        <MaterialSymbol name="arrow_upward" size="sm" className="text-white" />
      </button>
    </div>
  );
}

function ActivityCommentComposer({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const canSubmit = value.trim().length > 0;

  return (
    <div className="mt-2 px-1.5 pb-2 pt-4">
      <div className={cn("w-full min-w-0", replyInputClass)}>
        <AceInputField
          fieldSize="sm"
          placeholder="Add a comment and press Enter. Use @ to mention."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (canSubmit) onSubmit();
            }
          }}
          aria-label="Add a comment"
        />
      </div>
    </div>
  );
}

function ActivityCommentBlock({
  comment,
  isReply,
  replyCount,
  repliesExpanded,
  isEditing,
  editDraft,
  isReplying,
  replyDraft,
  onToggleReplies,
  onReply,
  onEdit,
  onDelete,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  onReplyDraftChange,
  onSubmitReply,
  onCancelReply,
}: {
  comment: ActivityComment;
  isReply?: boolean;
  replyCount?: number;
  repliesExpanded?: boolean;
  isEditing: boolean;
  editDraft: string;
  isReplying: boolean;
  replyDraft: string;
  onToggleReplies?: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditDraftChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onReplyDraftChange: (value: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
}) {
  return (
    <article className={cn("flex w-full min-w-0 flex-col gap-2", isReply && "pl-6")}>
      <div className="flex items-center gap-2">
        <ActivityAvatar src={comment.avatarSrc} alt={comment.author} />
        <p
          className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0", NEUTRAL_800)}
          style={notoVar}
        >
          <span className={cn("font-bold", PRIMARY_PURPLE)}>{comment.author}</span>
          <span>{` · ${comment.relativeTime}`}</span>
        </p>
      </div>

      {isEditing ? (
        <div className={cn("px-4", replyInputClass)}>
          <AceInputField
            fieldSize="sm"
            value={editDraft}
            onChange={(event) => onEditDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSaveEdit();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onCancelEdit();
              }
            }}
            aria-label={`Edit comment by ${comment.author}`}
          />
        </div>
      ) : (
        <p
          className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 px-4", NEUTRAL_800)}
          style={notoVar}
        >
          {renderBodyText(comment.body)}
        </p>
      )}

      {!isEditing && comment.commentActions !== "readonly" ? (
        <div
          className={cn(
            "px-4",
            comment.commentActions === "thread" && replyCount
              ? "flex items-start justify-between"
              : "",
          )}
        >
          {comment.commentActions === "simple" ? (
            <button
              type="button"
              onClick={onReply}
              className={COMMENT_ACTION_BUTTON_CLASS}
              style={notoVar}
            >
              Reply
            </button>
          ) : null}

          {comment.commentActions === "owner" || comment.commentActions === "thread" ? (
            <EditDeleteActions onEdit={onEdit} onDelete={onDelete} />
          ) : null}

          {comment.commentActions === "thread" && replyCount ? (
            <button
              type="button"
              onClick={onToggleReplies}
              aria-expanded={repliesExpanded}
              className="inline-flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0"
            >
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center transition-transform",
                  ACCORDION_MOTION_CLASS,
                  repliesExpanded ? "rotate-0" : "-rotate-90",
                )}
                aria-hidden
              >
                <MaterialSymbol
                  name="keyboard_arrow_down"
                  size="md"
                  className={cn(ICON_CLASS, PRIMARY_PURPLE)}
                />
              </span>
              <span
                className={cn(aceTypography(ACE_TYPE.p1Bold), PRIMARY_PURPLE)}
                style={notoVar}
              >
                {replyCount} response
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      {isReplying ? (
        <ActivityReplyField
          value={replyDraft}
          onChange={onReplyDraftChange}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
        />
      ) : null}
    </article>
  );
}

const ACTIVITY_STATUS_STYLE_ALIAS: Record<string, string> = {
  "In Process": "New",
  "Pending Review": "New",
  "Confirmed Match": "Escalate",
};

function ActivityStatusTag({ label }: { label: string }) {
  const statusKey = ACTIVITY_STATUS_STYLE_ALIAS[label] ?? label;
  return <ScreeningStatusBadge status={statusKey}>{label}</ScreeningStatusBadge>;
}

function ActivityFileTag({ fileName }: { fileName: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-[4px] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-2 py-1">
      <MaterialSymbol name="draft" size="md" className={cn(ICON_CLASS, "text-[#dc264b]")} />
      <span
        className="truncate text-[10px] font-normal leading-[1.65] tracking-[0.2px] text-[var(--screening-text-primary)]"
        style={notoVar}
      >
        {fileName}
      </span>
    </span>
  );
}

function ActivityLogRow({ item }: { item: ActivityLogItem }) {
  const mutedTime = (
    <span className={cn(aceTypography(ACE_TYPE.captionRegular), NEUTRAL_800)} style={notoVar}>
      {` · ${item.relativeTime}`}
    </span>
  );

  if (item.kind === "upload") {
    return (
      <article className="flex items-center gap-2">
        <MaterialSymbol name="cloud_upload" size="md" className={ICON_CLASS} />
        <p className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 inline", NEUTRAL_800)} style={notoVar}>
          <ActivityFileTag fileName={item.fileName ?? "attachment"} />
          {mutedTime}
        </p>
      </article>
    );
  }

  if (item.kind === "url") {
    return (
      <article className="flex items-center gap-2">
        <MaterialSymbol name="link" size="md" className={ICON_CLASS} />
        <p className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 inline", NEUTRAL_800)} style={notoVar}>
          <span>{item.url}</span>
          {mutedTime}
        </p>
      </article>
    );
  }

  if (item.kind === "screening") {
    return (
      <article className="flex items-center gap-2">
        <MaterialSymbol name="check_circle" size="md" className={ICON_CLASS} />
        <p className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 inline", NEUTRAL_800)} style={notoVar}>
          <span>Screened by screening rule </span>
          <span className="font-bold">{item.screeningRule}</span>
          {mutedTime}
        </p>
      </article>
    );
  }

  return (
    <article className="flex items-center gap-2">
      <MaterialSymbol name="check_circle" size="md" className={ICON_CLASS} />
      <p className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 inline", NEUTRAL_800)} style={notoVar}>
        <span>{item.author} moved status to </span>
        {item.statusLabel ? <ActivityStatusTag label={item.statusLabel} /> : null}
        {mutedTime}
      </p>
    </article>
  );
}

function ActivityFilterPill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-[4px] px-2 py-1 transition-colors",
        "text-[10px] font-normal leading-[1.65] tracking-[0.2px]",
        selected ? "bg-[#523eb9] text-white" : "bg-[#e4e6ea] text-[#23262c]",
      )}
      style={notoVar}
    >
      {label}
    </button>
  );
}

type FeedBlock = { type: "comment"; comment: ActivityComment } | { type: "log"; item: ActivityLogItem };

export function ReviewActivityFeed({
  selectedRows,
  activityViewRowId,
  onActivityViewRowIdChange,
  activityFilter,
  onActivityFilterChange,
  resetSignal,
  activityPersistRevision,
  pulseSignal = 0,
}: {
  selectedRows: readonly ScreeningResultRow[];
  activityViewRowId: string | null;
  onActivityViewRowIdChange: (rowId: string) => void;
  activityFilter: ReviewActivityFilter;
  onActivityFilterChange: (filter: ReviewActivityFilter) => void;
  resetSignal: number;
  activityPersistRevision: number;
  /** Increment to pulse the most recent activity item (e.g. when the panel opens). */
  pulseSignal?: number;
}) {
  const activityRow =
    selectedRows.find((row) => row.id === activityViewRowId) ?? selectedRows[0] ?? null;
  const rowId = activityRow?.id ?? null;
  const generatedActivity = useMemo(
    () => (activityRow ? generateRowActivity(activityRow) : null),
    [activityRow],
  );
  const persistedActivity = useMemo(
    () => (rowId ? getPersistedRowActivity(rowId) : null),
    [activityPersistRevision, rowId],
  );
  const persistedCommentIds = useMemo(
    () => new Set(persistedActivity?.comments.map((comment) => comment.id) ?? []),
    [persistedActivity],
  );
  const persistedLogIds = useMemo(
    () => new Set(persistedActivity?.logs.map((item) => item.id) ?? []),
    [persistedActivity],
  );

  const [pulseActive, setPulseActive] = useState(false);
  useEffect(() => {
    if (!pulseSignal) return;
    setPulseActive(true);
    const timer = setTimeout(() => setPulseActive(false), 3200);
    return () => clearTimeout(timer);
  }, [pulseSignal]);

  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [newCommentDraft, setNewCommentDraft] = useState("");

  useEffect(() => {
    if (!rowId || !generatedActivity) {
      setComments([]);
      setLogs([]);
      setExpandedThreads({});
      setReplyingToId(null);
      setReplyDraft("");
      setEditingId(null);
      setEditDraft("");
      setNewCommentDraft("");
      return;
    }

    setComments([
      ...(persistedActivity?.comments ?? []),
      ...generatedActivity.comments,
    ]);
    setLogs([...(persistedActivity?.logs ?? []), ...generatedActivity.logs]);
    setExpandedThreads({});
    setReplyingToId(null);
    setReplyDraft("");
    setEditingId(null);
    setEditDraft("");
    setNewCommentDraft("");
  }, [generatedActivity, persistedActivity, rowId, resetSignal]);

  const feedBlocks = useMemo((): FeedBlock[] => {
    if (!rowId || !generatedActivity) return [];

    const blocks: FeedBlock[] = [];
    const showComments = activityFilter === "comments" || activityFilter === "all";
    const showLogs = activityFilter === "log" || activityFilter === "all";
    const { demoCommentIds, demoLogIds, timeline } = generatedActivity;

    const appendComment = (comment: ActivityComment) => {
      blocks.push({ type: "comment", comment });
    };

    const appendTimelineEntry = (entry: { type: "comment" | "log"; id: string }) => {
      if (entry.type === "comment") {
        if (!showComments) return;
        const comment = comments.find((item) => item.id === entry.id && !item.parentId);
        if (!comment) return;
        appendComment(comment);
        return;
      }

      if (!showLogs) return;
      const logItem = logs.find((item) => item.id === entry.id);
      if (logItem) {
        blocks.push({ type: "log", item: logItem });
      }
    };

    // Oldest first: pre-existing generated history, then carried-over L1 activity.
    for (const entry of timeline) {
      appendTimelineEntry(entry);
    }

    for (const entry of persistedActivity?.timeline ?? []) {
      appendTimelineEntry(entry);
    }

    // Current-session activity (newest), pinned to the bottom of the thread.
    if (showLogs) {
      const dynamicLogs = logs.filter(
        (item) => !demoLogIds.has(item.id) && !persistedLogIds.has(item.id),
      );
      for (const item of dynamicLogs) {
        blocks.push({ type: "log", item });
      }
    }

    if (showComments) {
      for (const comment of comments.filter(
        (item) =>
          !item.parentId &&
          !demoCommentIds.has(item.id) &&
          !persistedCommentIds.has(item.id),
      )) {
        appendComment(comment);
      }
    }

    return blocks;
  }, [
    activityFilter,
    comments,
    generatedActivity,
    logs,
    persistedActivity,
    persistedCommentIds,
    persistedLogIds,
    rowId,
  ]);

  const handleToggleReplies = (commentId: string) => {
    setExpandedThreads((current) => ({
      ...current,
      [commentId]: !current[commentId],
    }));
  };

  const handleSubmitReply = (parentId: string) => {
    const trimmed = replyDraft.trim();
    if (!trimmed) return;
    setComments((current) => [...current, createUserActivityComment(trimmed, parentId)]);
    setReplyDraft("");
    setReplyingToId(null);
    setExpandedThreads((current) => ({ ...current, [parentId]: true }));
  };

  const handleAddComment = () => {
    const trimmed = newCommentDraft.trim();
    if (!trimmed) return;
    setComments((current) => [...current, createUserActivityComment(trimmed)]);
    setNewCommentDraft("");
  };

  const handleSaveEdit = (commentId: string) => {
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    setComments((current) =>
      current.map((comment) =>
        comment.id === commentId ? { ...comment, body: trimmed } : comment,
      ),
    );
    setEditingId(null);
    setEditDraft("");
  };

  const handleDelete = (commentId: string) => {
    setComments((current) =>
      current.filter((comment) => comment.id !== commentId && comment.parentId !== commentId),
    );
    if (replyingToId === commentId) {
      setReplyingToId(null);
      setReplyDraft("");
    }
    if (editingId === commentId) {
      setEditingId(null);
      setEditDraft("");
    }
  };

  const renderCommentBlock = (comment: ActivityComment, isReply = false) => (
    <ActivityCommentBlock
      comment={comment}
      isReply={isReply}
      replyCount={isReply ? 0 : getReplyCount(comments, comment.id)}
      repliesExpanded={expandedThreads[comment.id] ?? false}
      isEditing={editingId === comment.id}
      editDraft={editDraft}
      isReplying={replyingToId === comment.id}
      replyDraft={replyDraft}
      onToggleReplies={() => handleToggleReplies(comment.id)}
      onReply={() => {
        setReplyingToId(comment.id);
        setReplyDraft("");
        setEditingId(null);
        setEditDraft("");
      }}
      onEdit={() => {
        setEditingId(comment.id);
        setEditDraft(comment.body);
        setReplyingToId(null);
        setReplyDraft("");
      }}
      onDelete={() => handleDelete(comment.id)}
      onEditDraftChange={setEditDraft}
      onSaveEdit={() => handleSaveEdit(comment.id)}
      onCancelEdit={() => {
        setEditingId(null);
        setEditDraft("");
      }}
      onReplyDraftChange={setReplyDraft}
      onSubmitReply={() => handleSubmitReply(comment.id)}
      onCancelReply={() => {
        setReplyingToId(null);
        setReplyDraft("");
      }}
    />
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {selectedRows.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 overflow-visible py-1">
          <div className="flex flex-wrap items-center gap-1">
            {ACTIVITY_FILTERS.map((filter) => (
              <ActivityFilterPill
                key={filter.id}
                label={filter.label}
                selected={activityFilter === filter.id}
                onSelect={() => onActivityFilterChange(filter.id)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "whitespace-nowrap text-[var(--screening-text-muted)]",
              )}
              style={notoVar}
            >
              {selectedRows.length} of {MAX_ACTIVITY_RESULTS} selected
            </span>
            {selectedRows.length > 1 &&
            selectedRows.length <= MAX_ACTIVITY_RESULTS &&
            activityViewRowId ? (
              <ReviewActivityMatchSelect
                rows={selectedRows}
                value={activityViewRowId}
                onChange={onActivityViewRowIdChange}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {selectedRows.length === 0 ? (
        <p
          className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 text-[var(--screening-text-muted)]")}
          style={notoVar}
        >
          Select one or more matches to view activity.
        </p>
      ) : selectedRows.length > MAX_ACTIVITY_RESULTS ? (
        <p
          className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 text-[var(--screening-text-muted)]")}
          style={notoVar}
        >
          Can only display activity for up to {MAX_ACTIVITY_RESULTS} results at a time.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-6">
          {feedBlocks.map((block, index) => {
            const isLatest = index === feedBlocks.length - 1;
            const pulseClass = isLatest && pulseActive ? "activity-pulse" : undefined;
            if (block.type === "log") {
              return (
                <div key={block.item.id} className={pulseClass}>
                  <ActivityLogRow item={block.item} />
                </div>
              );
            }

            const { comment } = block;
            const threadReplies = comments.filter((item) => item.parentId === comment.id);
            const isThreadParent =
              comment.commentActions === "thread" && threadReplies.length > 0;
            const repliesExpanded = expandedThreads[comment.id] ?? false;

            return (
              <div key={comment.id} className={cn("flex flex-col gap-2", pulseClass)}>
                {renderCommentBlock(comment)}
                {isThreadParent ? (
                  <AceGridExpandPanel
                    open={repliesExpanded}
                    contentClassName="flex flex-col gap-2"
                  >
                    {threadReplies.map((reply) => (
                      <div key={reply.id}>{renderCommentBlock(reply, true)}</div>
                    ))}
                  </AceGridExpandPanel>
                ) : null}
              </div>
            );
          })}
          </div>
          <ActivityCommentComposer
            value={newCommentDraft}
            onChange={setNewCommentDraft}
            onSubmit={handleAddComment}
          />
        </>
      )}
    </div>
  );
}
