import { useEffect, useState } from "react";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import {
  formatNoteCreatedAt,
  initialNotesForCase,
  type ClientNote,
} from "../lib/clientNotesData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const noteFieldClass = cn(
  "min-h-24 w-full min-w-0 resize-y rounded-[var(--screening-input-radius)] border border-solid border-[var(--screening-input-border)] bg-[var(--color-surface)] px-[var(--screening-input-px)] py-2",
  aceTypography(ACE_TYPE.p1Regular),
  "text-[var(--screening-text-primary)] placeholder:text-[var(--screening-input-placeholder)]",
  "outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out",
  "focus:border-[var(--screening-input-border-focus)] focus:bg-[var(--screening-input-bg-focus)] focus:shadow-[0_0_0_2px_var(--screening-input-focus-ring)]",
);

function createNoteId() {
  return `note-${Math.random().toString(36).slice(2, 9)}`;
}

function NoteCard({ note, pulse }: { note: ClientNote; pulse?: boolean }) {
  return (
    <article
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3",
        pulse && "activity-pulse",
      )}
    >
      <p
        className={cn(
          aceTypography(ACE_TYPE.p1Regular),
          "m-0 whitespace-pre-wrap text-[var(--screening-text-primary)]",
        )}
        style={notoVar}
      >
        {note.body}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            aceTypography(ACE_TYPE.p1SemiBold),
            "text-[var(--screening-primary)]",
          )}
          style={notoVar}
        >
          {note.author}
        </span>
        <span
          className="size-1 shrink-0 rounded-full bg-[var(--screening-border-strong)]"
          aria-hidden
        />
        <time
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "text-[var(--screening-text-secondary)]",
          )}
          style={notoVar}
        >
          {note.createdAt}
        </time>
      </div>
    </article>
  );
}

export function ClientNotesDrawerContent({
  caseIndex,
  author = "Sam",
  onClose,
}: {
  caseIndex: number;
  author?: string;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(() => initialNotesForCase(caseIndex));
  const [draft, setDraft] = useState("");
  const [pulseNoteId, setPulseNoteId] = useState<string | null>(null);

  useEffect(() => {
    setNotes(initialNotesForCase(caseIndex));
    setDraft("");
    setPulseNoteId(null);
  }, [caseIndex]);

  useEffect(() => {
    if (!pulseNoteId) return;
    const timer = setTimeout(() => setPulseNoteId(null), 3200);
    return () => clearTimeout(timer);
  }, [pulseNoteId]);

  const canSave = draft.trim().length > 0;

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const id = createNoteId();
    setNotes((current) => [
      {
        id,
        body: trimmed,
        author,
        createdAt: formatNoteCreatedAt(),
      },
      ...current,
    ]);
    setDraft("");
    setPulseNoteId(id);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} pulse={note.id === pulseNoteId} />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 pb-0.5">
        <div className="flex w-full min-w-0 flex-col gap-2">
          <p
            className={cn(
              aceTypography(ACE_TYPE.p1SemiBold),
              "m-0 text-[var(--screening-text-primary)]",
            )}
            style={notoVar}
          >
            Add Note
          </p>
          {/* Extra inset so the focus ring isn’t clipped by drawer overflow. */}
          <div className="p-0.5">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a note…"
              aria-label="Add note"
              className={noteFieldClass}
              style={notoVar}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <AceButton type="button" variant="secondary" palette="purple" size="md" onClick={onClose}>
            Close
          </AceButton>
          <AceButton
            type="button"
            variant="primary"
            palette="purple"
            size="md"
            disabled={!canSave}
            onClick={handleSave}
          >
            Save
          </AceButton>
        </div>
      </div>
    </div>
  );
}
