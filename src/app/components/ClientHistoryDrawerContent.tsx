import { useEffect, useMemo, useState } from "react";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { AceTable } from "@ace-ds/components/molecules/AceTable/AceTable";
import { AceInlineMessage } from "@ace-ds/components/molecules/AceInlineMessage/AceInlineMessage";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import {
  diffClientHistoryVersions,
  initialHistoryVersionsForCase,
  olderHistoryVersions,
  type ClientHistoryVersion,
} from "../lib/clientHistoryData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { renderDiffHighlightedText } from "../lib/textDiffHighlight";
import noDocumentsEmptyImage from "../../assets/client-documents/no-documents-empty.png";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** Wide enough for Field + two version columns; fixed height so empty state matches data view. */
const differencesModalClass = cn(
  "!flex !h-[min(85vh,calc(100dvh-2rem))] !max-h-[min(85vh,calc(100dvh-2rem))]",
  "!w-[min(96vw,90rem)] !max-w-[min(96vw,90rem)]",
);

const pagerIconButtonClass = cn(
  "inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border-0 bg-transparent text-[var(--screening-text-secondary)] transition-colors",
  "hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--screening-text-secondary)]",
);

const diffHighlightClass = "bg-[var(--ace-notice-100)]";

const diffCellClass = cn(
  "whitespace-nowrap px-[var(--space-3)] py-[var(--space-3)] align-middle",
  aceTypography(ACE_TYPE.p1Regular),
  "text-[var(--screening-text-primary)]",
);

function HistoryVersionSelect({
  label,
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string | null;
  options: readonly ClientHistoryVersion[];
  placeholder: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  const items = useMemo((): AceDropdownMenuEntry[] => {
    return options.map((version) => ({
      type: "item" as const,
      label: version.modifiedLabel,
      highlighted: version.id === value,
      onSelect: () => onChange(version.id),
    }));
  }, [onChange, options, value]);

  const selectedLabel =
    options.find((version) => version.id === value)?.modifiedLabel ?? placeholder;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p
        className={cn(aceTypography(ACE_TYPE.labelBold), "m-0 text-[var(--screening-text-primary)]")}
        style={notoVar}
      >
        {label}
      </p>
      <AceDropdownMenu
        triggerLabel={selectedLabel}
        triggerMode="field"
        size="sm"
        panelWidth="wide"
        align="start"
        disabled={disabled || options.length === 0}
        className={cn(
          "min-w-0 !w-full !max-w-full font-['Noto_Sans:Regular',sans-serif] font-normal",
          (disabled || options.length === 0 || !value) &&
            "text-[var(--screening-text-muted)]",
        )}
        items={items}
      />
    </div>
  );
}

function ClientHistoryDifferencesModal({
  open,
  onClose,
  versions,
}: {
  open: boolean;
  onClose: () => void;
  versions: readonly ClientHistoryVersion[];
}) {
  const [newerId, setNewerId] = useState<string | null>(null);
  const [olderId, setOlderId] = useState<string | null>(null);
  const [changesOnly, setChangesOnly] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initialNewer = versions[0]?.id ?? null;
    setNewerId(initialNewer);
    const older = olderHistoryVersions(versions, initialNewer);
    setOlderId(older[0]?.id ?? null);
    setChangesOnly(false);
  }, [open, versions]);

  const olderOptions = useMemo(
    () => olderHistoryVersions(versions, newerId),
    [newerId, versions],
  );

  const newerVersion = versions.find((version) => version.id === newerId) ?? null;
  const olderVersion = olderOptions.find((version) => version.id === olderId) ?? null;

  const diffRows = useMemo(() => {
    if (!newerVersion || !olderVersion) return [];
    return diffClientHistoryVersions(newerVersion, olderVersion);
  }, [newerVersion, olderVersion]);

  const visibleDiffRows = useMemo(
    () => (changesOnly ? diffRows.filter((row) => row.changed) : diffRows),
    [changesOnly, diffRows],
  );

  const handleNewerChange = (id: string) => {
    setNewerId(id);
    const older = olderHistoryVersions(versions, id);
    setOlderId(older[0]?.id ?? null);
  };

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title="Client Differences"
      size="lg"
      primaryAction={{ label: "Close", onClick: onClose }}
      className={differencesModalClass}
      bodyClassName="[&>div]:flex [&>div]:min-h-0 [&>div]:flex-1 [&>div]:flex-col"
    >
      <div className="flex w-full shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <HistoryVersionSelect
          label="Newer Version"
          value={newerId}
          options={versions}
          placeholder="Select version"
          onChange={handleNewerChange}
        />
        <HistoryVersionSelect
          label="Older Version"
          value={olderId}
          options={olderOptions}
          placeholder="There is no prior history"
          disabled={olderOptions.length === 0}
          onChange={setOlderId}
        />
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col">
        {newerVersion && olderVersion ? (
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <AceInlineMessage tone="info" className="!w-fit max-w-full">
                Client differences are highlighted in Yellow
              </AceInlineMessage>
              <AceButton
                type="button"
                variant="tertiary"
                palette="purple"
                size="sm"
                onClick={() => setChangesOnly((value) => !value)}
                aria-pressed={changesOnly}
              >
                {changesOnly ? "Show all fields" : "View changes only"}
              </AceButton>
            </div>
            <div className="w-full overflow-x-auto rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-subtle)]">
              {visibleDiffRows.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">Differences between client history versions</caption>
                  <thead className="sticky top-0 z-[1] border-b border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface-muted)]">
                    <tr className="h-8">
                      {["Field", "Newer Version", "Older Version"].map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-[var(--space-3)] py-[var(--space-1)] align-middle"
                        >
                          <span
                            className={cn(
                              aceTypography(ACE_TYPE.labelBold),
                              "uppercase text-[var(--screening-text-muted)]",
                            )}
                          >
                            {header}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDiffRows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-solid border-[var(--screening-border-row)] bg-[var(--screening-surface)] last:border-b-0"
                      >
                        <td
                          className={cn(
                            "whitespace-nowrap px-[var(--space-3)] py-[var(--space-3)] align-middle",
                            aceTypography(ACE_TYPE.p1Bold),
                            "w-[1%] text-[var(--screening-text-primary)]",
                          )}
                          style={notoVar}
                        >
                          {row.label}
                        </td>
                        <td className={diffCellClass} style={notoVar}>
                          {row.changed
                            ? renderDiffHighlightedText(
                                row.newerValue,
                                row.olderValue,
                                diffHighlightClass,
                              )
                            : row.newerValue}
                        </td>
                        <td className={diffCellClass} style={notoVar}>
                          {row.changed
                            ? renderDiffHighlightedText(
                                row.olderValue,
                                row.newerValue,
                                diffHighlightClass,
                              )
                            : row.olderValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p
                  className={cn(
                    aceTypography(ACE_TYPE.p1Regular),
                    "m-0 px-[var(--space-3)] py-[var(--space-4)] text-[var(--screening-text-muted)]",
                  )}
                  style={notoVar}
                >
                  No field changes between these versions.
                </p>
              )}
            </div>
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
              There is no prior history to compare
            </p>
          </div>
        )}
      </div>
    </DialogModal>
  );
}

export function ClientHistoryDrawerContent({
  caseIndex,
  onClose,
}: {
  caseIndex: number;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState(() => initialHistoryVersionsForCase(caseIndex));
  const [pageIndex, setPageIndex] = useState(0);
  const [differencesOpen, setDifferencesOpen] = useState(false);

  useEffect(() => {
    setVersions(initialHistoryVersionsForCase(caseIndex));
    setPageIndex(0);
    setDifferencesOpen(false);
  }, [caseIndex]);

  const safeIndex = Math.min(pageIndex, Math.max(0, versions.length - 1));
  const activeVersion = versions[safeIndex] ?? null;
  const total = versions.length;

  const tableData = useMemo(() => {
    const columns = [
      { key: "field", header: "Field" },
      { key: "value", header: "Value" },
    ];
    const rows =
      activeVersion?.fields.map((field) => ({
        field: field.label,
        value: field.value,
      })) ?? [];
    return { columns, rows };
  }, [activeVersion]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <p
            className={cn(
              aceTypography(ACE_TYPE.p1Regular),
              "m-0 text-[var(--screening-text-primary)]",
            )}
            style={notoVar}
          >
            Viewing client record
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous client history version"
              disabled={safeIndex <= 0}
              onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
              className={pagerIconButtonClass}
            >
              <MaterialSymbol name="keyboard_arrow_left" size="md" className="text-current" />
            </button>
            <span
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "min-w-[3.5rem] text-center tabular-nums text-[var(--screening-text-primary)]",
              )}
              style={notoVar}
              aria-live="polite"
            >
              {total === 0 ? "0 of 0" : `${safeIndex + 1} of ${total}`}
            </span>
            <button
              type="button"
              aria-label="Next client history version"
              disabled={safeIndex >= total - 1}
              onClick={() => setPageIndex((index) => Math.min(total - 1, index + 1))}
              className={pagerIconButtonClass}
            >
              <MaterialSymbol name="keyboard_arrow_right" size="md" className="text-current" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDifferencesOpen(true)}
          disabled={total === 0}
          className={cn(
            aceTypography(ACE_TYPE.p1SemiBold),
            "cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)]",
            "hover:text-[var(--dialog-modal-primary-hover)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          View Differences
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeVersion ? (
          <AceTable
            columns={tableData.columns}
            rows={tableData.rows}
            caption="Client history record"
          />
        ) : (
          <p
            className={cn(
              aceTypography(ACE_TYPE.p1Regular),
              "m-0 text-[var(--ace-neutral-800)]",
            )}
            style={notoVar}
          >
            There is no client history for this record.
          </p>
        )}
      </div>

      <div className="flex shrink-0 justify-end">
        <AceButton type="button" variant="primary" palette="purple" size="md" onClick={onClose}>
          Close
        </AceButton>
      </div>

      <ClientHistoryDifferencesModal
        open={differencesOpen}
        onClose={() => setDifferencesOpen(false)}
        versions={versions}
      />
    </div>
  );
}
