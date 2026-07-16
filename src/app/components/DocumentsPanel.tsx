import { useEffect, useState } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  AceAttachments,
  type AceAttachmentFile,
  type AceAttachmentLink,
} from "@ace-ds/components/organisms/AceAttachments/AceAttachments";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface DocumentsPanelProps {
  row: ScreeningResultRow;
  onBack: () => void;
}

export function DocumentsPanel({ row, onBack }: DocumentsPanelProps) {
  const [files, setFiles] = useState<AceAttachmentFile[]>([]);
  const [links, setLinks] = useState<AceAttachmentLink[]>([]);
  const [urlDraft, setUrlDraft] = useState("");

  useEffect(() => {
    setFiles([]);
    setLinks([]);
    setUrlDraft("");
  }, [row.id]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 bg-[var(--screening-surface)] px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "mb-3 inline-flex cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)] transition-colors",
            "hover:text-[var(--dialog-modal-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
          )}
        >
          <MaterialSymbol name="keyboard_arrow_left" size="md" />
          <span
            className={cn(aceTypography(ACE_TYPE.p1Bold), "text-[var(--screening-primary)]")}
            style={notoVar}
          >
            Back to List
          </span>
        </button>
        <p
          className={cn(aceTypography(ACE_TYPE.p1SemiBold), "text-[var(--screening-text-primary)]")}
          style={notoVar}
        >
          Documents
        </p>
        <p className="sr-only">Selected match: {row.name}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--screening-surface)] px-4 py-4">
        <AceAttachments
          files={files}
          links={links}
          urlDraft={urlDraft}
          onUrlDraftChange={setUrlDraft}
          onFilesSelected={(fileList) => {
            const next = Array.from(fileList).map((file) => ({
              id: createId("upload"),
              name: file.name,
              status: "complete" as const,
              sizeLabel: file.size
                ? `${Math.max(1, Math.round(file.size / (1024 * 1024)))}mb`
                : undefined,
            }));
            setFiles((current) => [...current, ...next]);
          }}
          onAddUrl={() => {
            const trimmed = urlDraft.trim();
            if (!trimmed) return;
            setLinks((current) => [...current, { id: createId("link"), url: trimmed }]);
            setUrlDraft("");
          }}
          onRemoveFile={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
          onRemoveLink={(id) => setLinks((current) => current.filter((link) => link.id !== id))}
        />
      </div>
    </div>
  );
}
