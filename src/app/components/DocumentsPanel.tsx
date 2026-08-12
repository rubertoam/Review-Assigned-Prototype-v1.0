import { useEffect, useState, type ReactNode } from "react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import {
  AceAttachments,
  type AceAttachmentFile,
  type AceAttachmentLink,
} from "@ace-ds/components/organisms/AceAttachments/AceAttachments";
import {
  formatDocumentModifyDate,
  initialDocumentsForMatch,
  type MatchDocumentItem,
} from "../lib/matchDocumentsData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import noDocumentsEmptyImage from "../../assets/client-documents/no-documents-empty.png";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const drawerAccordionClass = "border-[var(--ace-accordion-border)] shadow-none";

const drawerAccordionTitleClass = cn(
  aceTypography(ACE_TYPE.p1SemiBold),
  "text-[var(--screening-text-primary)]",
);

const accordionHeaderIconButtonClass = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
  "hover:bg-[var(--screening-surface-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
);

const metaLineClass = cn(
  aceTypography(ACE_TYPE.p1Regular),
  "m-0 leading-[1.65] text-[var(--screening-text-primary)]",
);

const deleteFooterBtnClass = cn(
  aceTypography(ACE_TYPE.p1Bold),
  "inline-flex items-center justify-center rounded-[var(--dialog-modal-btn-radius)] px-4 py-2",
);

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function DocumentMetaLine({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) {
  return (
    <p className={metaLineClass}>
      <span className="text-[var(--screening-text-muted)]">{label}</span>
      <span className="text-[var(--screening-text-muted)]"> · </span>
      <span>{children}</span>
    </p>
  );
}

function DocumentAccordion({
  document,
  open,
  onOpenChange,
  onDelete,
  onDownload,
}: {
  document: MatchDocumentItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  return (
    <AceAccordion
      title={document.title}
      surface="white"
      dropShadow={false}
      showTag={false}
      showAddIcon={false}
      showDeleteIcon={false}
      showEditIcon={false}
      showMoreIcon={false}
      open={open}
      onOpenChange={onOpenChange}
      className={drawerAccordionClass}
      titleClassName={drawerAccordionTitleClass}
      headerTrailing={
        <>
          <button
            type="button"
            aria-label={`Download ${document.title}`}
            className={accordionHeaderIconButtonClass}
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
          >
            <MaterialSymbol
              name="download"
              size="sm"
              className="text-[var(--ace-accordion-icon)]"
            />
          </button>
          <button
            type="button"
            aria-label={`Delete ${document.title}`}
            className={accordionHeaderIconButtonClass}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <MaterialSymbol
              name="delete"
              size="sm"
              className="text-[var(--ace-error-500)]"
            />
          </button>
        </>
      }
    >
      <div className="flex w-full min-w-0 flex-col gap-1">
        <DocumentMetaLine label="Document Category">{document.category}</DocumentMetaLine>
        <DocumentMetaLine label="Description">{document.description}</DocumentMetaLine>
        <DocumentMetaLine label="Document Path">{document.path}</DocumentMetaLine>
        <DocumentMetaLine label="Is URL">{document.isUrl ? "Yes" : "No"}</DocumentMetaLine>
        <DocumentMetaLine label="Modify Date">{document.modifyDate}</DocumentMetaLine>
        <DocumentMetaLine label="Modify User">{document.modifyUser}</DocumentMetaLine>
      </div>
    </AceAccordion>
  );
}

export interface DocumentsPanelProps {
  row: ScreeningResultRow;
  onBack: () => void;
  modifyUser?: string;
  /** When true, omit Back + title (parent shell provides navigation). */
  hideChrome?: boolean;
}

export function DocumentsPanel({
  row,
  onBack,
  modifyUser = "antonio",
  hideChrome = false,
}: DocumentsPanelProps) {
  const [documents, setDocuments] = useState(() => initialDocumentsForMatch(row.id));
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [draftFiles, setDraftFiles] = useState<AceAttachmentFile[]>([]);
  const [draftLinks, setDraftLinks] = useState<AceAttachmentLink[]>([]);
  const [urlDraft, setUrlDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MatchDocumentItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    setDocuments(initialDocumentsForMatch(row.id));
    setExpandedIds(new Set());
    setUploadOpen(false);
    setDraftFiles([]);
    setDraftLinks([]);
    setUrlDraft("");
    setDeleteTarget(null);
    setDeleteConfirmText("");
  }, [row.id]);

  const hasDocuments = documents.length > 0;
  const allExpanded =
    hasDocuments && documents.every((document) => expandedIds.has(document.id));

  const setDocumentOpen = (documentId: string, open: boolean) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (open) next.add(documentId);
      else next.delete(documentId);
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
      return;
    }
    setExpandedIds(new Set(documents.map((document) => document.id)));
  };

  const openUploadModal = () => {
    setDraftFiles([]);
    setDraftLinks([]);
    setUrlDraft("");
    setUploadOpen(true);
  };

  const closeUploadModal = () => {
    setUploadOpen(false);
    setDraftFiles([]);
    setDraftLinks([]);
    setUrlDraft("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  const confirmDelete = () => {
    if (!deleteTarget || deleteConfirmText !== "delete") return;
    setDocuments((current) => current.filter((item) => item.id !== deleteTarget.id));
    setExpandedIds((current) => {
      const next = new Set(current);
      next.delete(deleteTarget.id);
      return next;
    });
    closeDeleteModal();
  };

  const commitUpload = () => {
    const modifyDate = formatDocumentModifyDate();
    const fromFiles: MatchDocumentItem[] = draftFiles.map((file) => ({
      id: file.id,
      title: file.name,
      category: "Unknown",
      description: "",
      path: file.name,
      isUrl: false,
      modifyDate,
      modifyUser,
    }));
    const fromLinks: MatchDocumentItem[] = draftLinks.map((link) => ({
      id: link.id,
      title: link.url,
      category: "Unknown",
      description: "",
      path: link.url,
      isUrl: true,
      modifyDate,
      modifyUser,
    }));
    if (fromFiles.length > 0 || fromLinks.length > 0) {
      setDocuments((current) => [...fromFiles, ...fromLinks, ...current]);
    }
    closeUploadModal();
  };

  const uploadButton = (
    <AceButton
      type="button"
      variant="primary"
      palette="purple"
      size="md"
      onClick={openUploadModal}
    >
      Upload
    </AceButton>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {hideChrome ? null : (
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
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--screening-surface)] px-4 py-4">
        {hasDocuments ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            {documents.length > 1 ? (
              <div className="flex shrink-0 justify-end">
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className={cn(
                    aceTypography(ACE_TYPE.p1SemiBold),
                    "cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)]",
                    "hover:text-[var(--dialog-modal-primary-hover)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
                  )}
                >
                  {allExpanded ? "Collapse all" : "Expand all"}
                </button>
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {documents.map((document) => (
                  <DocumentAccordion
                    key={document.id}
                    document={document}
                    open={expandedIds.has(document.id)}
                    onOpenChange={(open) => setDocumentOpen(document.id, open)}
                    onDelete={() => {
                      setDeleteConfirmText("");
                      setDeleteTarget(document);
                    }}
                    onDownload={() => {
                      // Prototype: download action wired for later.
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex shrink-0 justify-end">{uploadButton}</div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <img
              src={noDocumentsEmptyImage}
              alt=""
              className="h-auto w-full max-w-[16rem] object-contain"
            />
            <p
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "m-0 max-w-xs text-[var(--ace-neutral-800)]",
              )}
              style={notoVar}
            >
              Please click Upload to add match documents
            </p>
            {uploadButton}
          </div>
        )}
      </div>

      <DialogModal
        open={uploadOpen}
        onClose={closeUploadModal}
        title="Upload Documents"
        size="lg"
        fitContent
        secondaryAction={{ label: "Cancel", onClick: closeUploadModal }}
        primaryAction={{
          label: "Add",
          onClick: commitUpload,
        }}
      >
        <AceAttachments
          files={draftFiles}
          links={draftLinks}
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
            setDraftFiles((current) => [...current, ...next]);
          }}
          onAddUrl={() => {
            const trimmed = urlDraft.trim();
            if (!trimmed) return;
            setDraftLinks((current) => [
              ...current,
              { id: createId("link"), url: trimmed },
            ]);
            setUrlDraft("");
          }}
          onRemoveFile={(id) =>
            setDraftFiles((current) => current.filter((file) => file.id !== id))
          }
          onRemoveLink={(id) =>
            setDraftLinks((current) => current.filter((link) => link.id !== id))
          }
        />
      </DialogModal>

      <DialogModal
        open={deleteTarget != null}
        onClose={closeDeleteModal}
        title="Delete Document"
        description={
          deleteTarget ? (
            <>
              Type <strong className="font-semibold">delete</strong> to permanently remove this
              document: <strong className="font-semibold">{deleteTarget.title}</strong>.
            </>
          ) : null
        }
        size="md"
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-[var(--dialog-modal-footer-btn-gap)]">
            <button
              type="button"
              onClick={closeDeleteModal}
              className={cn(
                deleteFooterBtnClass,
                "border border-solid border-[var(--dialog-modal-outline-border)] bg-[var(--dialog-modal-surface)] text-[var(--dialog-modal-outline-text)] hover:bg-[var(--dialog-modal-outline-hover-bg)]",
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteConfirmText !== "delete"}
              onClick={confirmDelete}
              className={cn(
                deleteFooterBtnClass,
                "bg-[var(--dialog-modal-danger)] text-[var(--dialog-modal-on-primary)] hover:bg-[var(--dialog-modal-danger-hover)]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              Delete
            </button>
          </div>
        }
      >
        <AceInputField
          id="match-document-delete-confirm"
          label="Confirmation"
          value={deleteConfirmText}
          onChange={(event) => setDeleteConfirmText(event.target.value)}
          placeholder="delete"
          autoComplete="off"
          fieldSize="md"
        />
      </DialogModal>
    </div>
  );
}
