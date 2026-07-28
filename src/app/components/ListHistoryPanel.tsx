import { useEffect, useMemo, useState } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import { AceInlineMessage } from "@ace-ds/components/molecules/AceInlineMessage/AceInlineMessage";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import {
  diffListHistoryVersions,
  initialListHistoryVersionsForRow,
  olderListHistoryVersions,
  type ListHistoryVersion,
} from "../lib/listHistoryData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import noDocumentsEmptyImage from "../../assets/client-documents/no-documents-empty.png";
import { ListProfileAllTabView } from "./ListProfileTabContent";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

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
  options: readonly ListHistoryVersion[];
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

export function ListDifferencesModal({
  open,
  onClose,
  versions,
}: {
  open: boolean;
  onClose: () => void;
  versions: readonly ListHistoryVersion[];
}) {
  const [newerId, setNewerId] = useState<string | null>(null);
  const [olderId, setOlderId] = useState<string | null>(null);
  const [changesOnly, setChangesOnly] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initialNewer = versions[0]?.id ?? null;
    setNewerId(initialNewer);
    const older = olderListHistoryVersions(versions, initialNewer);
    setOlderId(older[0]?.id ?? null);
    setChangesOnly(false);
  }, [open, versions]);

  const olderOptions = useMemo(
    () => olderListHistoryVersions(versions, newerId),
    [newerId, versions],
  );

  const newerVersion = versions.find((version) => version.id === newerId) ?? null;
  const olderVersion = olderOptions.find((version) => version.id === olderId) ?? null;

  const diffRows = useMemo(() => {
    if (!newerVersion || !olderVersion) return [];
    return diffListHistoryVersions(newerVersion, olderVersion);
  }, [newerVersion, olderVersion]);

  const visibleDiffRows = useMemo(
    () => (changesOnly ? diffRows.filter((row) => row.changed) : diffRows),
    [changesOnly, diffRows],
  );

  const handleNewerChange = (id: string) => {
    setNewerId(id);
    const older = olderListHistoryVersions(versions, id);
    setOlderId(older[0]?.id ?? null);
  };

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title="List Differences"
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
                List differences are highlighted in Yellow
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
                  <caption className="sr-only">Differences between list history versions</caption>
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
                        <td
                          className={cn(diffCellClass, row.changed && diffHighlightClass)}
                          style={notoVar}
                        >
                          {row.newerValue}
                        </td>
                        <td
                          className={cn(diffCellClass, row.changed && diffHighlightClass)}
                          style={notoVar}
                        >
                          {row.olderValue}
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

export interface ListHistoryPanelProps {
  row: ScreeningResultRow;
  onBack: () => void;
  /** When true, open the differences modal on mount / row change. */
  openDifferencesOnShow?: boolean;
  onDifferencesOpenChange?: (open: boolean) => void;
}

export function ListHistoryPanel({
  row,
  onBack,
  openDifferencesOnShow = false,
  onDifferencesOpenChange,
}: ListHistoryPanelProps) {
  const [versions, setVersions] = useState(() => initialListHistoryVersionsForRow(row));
  const [pageIndex, setPageIndex] = useState(0);
  const [differencesOpen, setDifferencesOpen] = useState(openDifferencesOnShow);

  useEffect(() => {
    setVersions(initialListHistoryVersionsForRow(row));
    setPageIndex(0);
    setDifferencesOpen(openDifferencesOnShow);
  }, [row, openDifferencesOnShow]);

  const setDifferencesOpenSafe = (open: boolean) => {
    setDifferencesOpen(open);
    onDifferencesOpenChange?.(open);
  };

  const safeIndex = Math.min(pageIndex, Math.max(0, versions.length - 1));
  const activeVersion = versions[safeIndex] ?? null;
  const total = versions.length;

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
          List History
        </p>
        <p className="sr-only">Selected match: {row.name}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden bg-[var(--screening-surface)] px-4 py-4">
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
          <p
            className={cn(
              aceTypography(ACE_TYPE.p1Regular),
              "m-0 text-[var(--screening-text-primary)]",
            )}
            style={notoVar}
          >
            Viewing list record
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous list history version"
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
              aria-label="Next list history version"
              disabled={safeIndex >= total - 1}
              onClick={() => setPageIndex((index) => Math.min(total - 1, index + 1))}
              className={pagerIconButtonClass}
            >
              <MaterialSymbol name="keyboard_arrow_right" size="md" className="text-current" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {activeVersion ? (
            <ListProfileAllTabView
              key={activeVersion.id}
              profile={activeVersion.profile}
              leadingAction={
                <button
                  type="button"
                  onClick={() => setDifferencesOpenSafe(true)}
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
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex shrink-0 justify-start">
                <button
                  type="button"
                  onClick={() => setDifferencesOpenSafe(true)}
                  disabled
                  className={cn(
                    aceTypography(ACE_TYPE.p1SemiBold),
                    "cursor-not-allowed rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)] opacity-40",
                  )}
                >
                  View Differences
                </button>
              </div>
              <p
                className={cn(
                  aceTypography(ACE_TYPE.p1Regular),
                  "m-0 text-[var(--ace-neutral-800)]",
                )}
                style={notoVar}
              >
                There is no list history for this record.
              </p>
            </div>
          )}
        </div>
      </div>

      <ListDifferencesModal
        open={differencesOpen}
        onClose={() => setDifferencesOpenSafe(false)}
        versions={versions}
      />
    </div>
  );
}
