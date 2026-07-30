import { useMemo, useState, type ReactNode } from "react";
import { AceTable } from "@ace-ds/components/molecules/AceTable/AceTable";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { AceTableFilterHeader } from "@ace-ds/components/molecules/AceFiltering/AceTableFilterHeader";
import {
  aceFilterChipClearIconClass,
  aceFilterTriggerClass,
} from "@ace-ds/components/molecules/AceFiltering/filterFieldStyles";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  filterWorkLogEntries,
  uniqueWorkLogFilterValues,
  workLogStatusLabel,
  type WorkLogEntry,
  type WorkLogFilterDimension,
} from "../lib/workLogState";
import { ScreeningStatusBadge } from "./ScreeningStatusBadge";
import noDocumentsEmptyImage from "../../assets/client-documents/no-documents-empty.png";
import { cn } from "./ui/utils";

const WORK_LOG_COLUMNS = [
  { key: "origin", header: "Origin" },
  { key: "clientName", header: "Client" },
  { key: "clientId", header: "Client ID" },
  { key: "matchName", header: "Match" },
  { key: "status", header: "Status" },
  { key: "timestamp", header: "Timestamp" },
  { key: "reviewer", header: "Reviewer" },
] as const;

const FILTER_DIMENSIONS: readonly {
  id: WorkLogFilterDimension;
  label: string;
}[] = [
  { id: "origin", label: "Origin" },
  { id: "client", label: "Client" },
  { id: "clientId", label: "Client ID" },
  { id: "match", label: "Match" },
  { id: "status", label: "Status" },
  { id: "timestamp", label: "Timestamp" },
] as const;

function createEmptyValueFilters(): Record<WorkLogFilterDimension, Set<string>> {
  return {
    origin: new Set(),
    client: new Set(),
    clientId: new Set(),
    match: new Set(),
    status: new Set(),
    timestamp: new Set(),
  };
}

const workLogModalShellClass = cn(
  "!flex !h-[calc((100dvh-2rem)*0.75)] !max-h-[calc((100dvh-2rem)*0.75)]",
  "!w-full !max-w-[calc((100vw-2rem)*0.75)]",
);

const cellTextClass = cn(
  aceTypography(ACE_TYPE.p1Regular),
  "text-[var(--screening-text-primary)]",
);

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

function WorkLogEmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
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
        {message}
      </p>
    </div>
  );
}

function WorkLogStatusCell({ status }: { status: string }) {
  const label = workLogStatusLabel(status);
  return <ScreeningStatusBadge status={status}>{label}</ScreeningStatusBadge>;
}

function workLogTextCell(value: string): ReactNode {
  return (
    <span className={cellTextClass} style={notoVar}>
      {value || "—"}
    </span>
  );
}

function workLogTableRows(entries: readonly WorkLogEntry[]): Record<string, ReactNode>[] {
  return entries.map((entry) => ({
    origin: workLogTextCell(entry.origin),
    clientName: workLogTextCell(entry.clientName),
    clientId: workLogTextCell(entry.clientId),
    matchName: workLogTextCell(entry.matchName),
    status: <WorkLogStatusCell status={entry.status} />,
    timestamp: workLogTextCell(entry.timestamp),
    reviewer: workLogTextCell(entry.reviewer),
  }));
}

function filterValueLabel(dimension: WorkLogFilterDimension, value: string): string {
  if (dimension === "status") return workLogStatusLabel(value);
  return value;
}

function dimensionChipLabel(
  dimension: WorkLogFilterDimension,
  selectedValues: ReadonlySet<string>,
): string {
  const group = FILTER_DIMENSIONS.find((item) => item.id === dimension)?.label ?? dimension;
  if (selectedValues.size === 0) return `${group}: All`;
  if (selectedValues.size === 1) {
    const only = [...selectedValues][0]!;
    return `${group}: ${filterValueLabel(dimension, only)}`;
  }
  return `${group}: ${selectedValues.size} selected`;
}

/**
 * Same AceFilterTrigger sizing as the Filters control, plus a clear affordance.
 */
function WorkLogFilterChipMenu({
  dimension,
  label,
  valueItems,
  onClear,
  portalContainer,
}: {
  dimension: WorkLogFilterDimension;
  label: string;
  valueItems: AceDropdownMenuEntry[];
  onClear: () => void;
  portalContainer: HTMLElement | null;
}) {
  const dimensionLabel =
    FILTER_DIMENSIONS.find((item) => item.id === dimension)?.label ?? dimension;

  return (
    <div className="inline-flex max-w-full items-stretch">
      <AceDropdownMenu
        triggerLabel={label}
        triggerMode="filter"
        panelWidth="default"
        align="start"
        portalContainer={portalContainer}
        items={
          valueItems.length > 0
            ? valueItems
            : [{ type: "label", label: "No values available." }]
        }
        className="rounded-r-none"
      />
      <button
        type="button"
        className={cn(
          aceFilterTriggerClass,
          "rounded-l-none border-l-0 px-2",
          "hover:border-transparent",
        )}
        aria-label={`Clear ${dimensionLabel} filter`}
        onClick={onClear}
      >
        <svg className={cn(aceFilterChipClearIconClass, "size-2.5")} viewBox="0 0 10 10" aria-hidden>
          <path d="M5 0C2.235 0 0 2.235 0 5C0 7.765 2.235 10 5 10C7.765 10 10 7.765 10 5C10 2.235 7.765 0 5 0ZM7.5 6.795L6.795 7.5L5 5.705L3.205 7.5L2.5 6.795L4.295 5L2.5 3.205L3.205 2.5L5 4.295L6.795 2.5L7.5 3.205L5.705 5L7.5 6.795Z" />
        </svg>
      </button>
    </div>
  );
}

/** Read-only audit of completed Level 1 decisions for this session. */
export function WorkLogModal({
  open,
  onClose,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  entries: readonly WorkLogEntry[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDimensions, setActiveDimensions] = useState<Set<WorkLogFilterDimension>>(
    () => new Set(),
  );
  const [selectedValues, setSelectedValues] = useState(createEmptyValueFilters);
  const portalContainer = typeof document !== "undefined" ? document.body : null;

  const setDimensionActive = (dimension: WorkLogFilterDimension, checked: boolean) => {
    setActiveDimensions((prev) => {
      const next = new Set(prev);
      if (checked) next.add(dimension);
      else next.delete(dimension);
      return next;
    });
    if (!checked) {
      setSelectedValues((prev) => ({ ...prev, [dimension]: new Set() }));
    }
  };

  const setValueChecked = (
    dimension: WorkLogFilterDimension,
    value: string,
    checked: boolean,
  ) => {
    setSelectedValues((prev) => {
      const nextValues = new Set(prev[dimension]);
      if (checked) nextValues.add(value);
      else nextValues.delete(value);
      return { ...prev, [dimension]: nextValues };
    });
  };

  const clearDimension = (dimension: WorkLogFilterDimension) => {
    setDimensionActive(dimension, false);
  };

  const dimensionMenuItems = useMemo((): AceDropdownMenuEntry[] => {
    return FILTER_DIMENSIONS.map((dimension) => ({
      type: "checkbox" as const,
      id: dimension.id,
      label: dimension.label,
      checked: activeDimensions.has(dimension.id),
      style: "assignment" as const,
      onCheckedChange: (checked: boolean) => setDimensionActive(dimension.id, checked),
    }));
  }, [activeDimensions]);

  const valueItemsByDimension = useMemo(() => {
    const map = {} as Record<WorkLogFilterDimension, AceDropdownMenuEntry[]>;
    for (const dimension of FILTER_DIMENSIONS) {
      const values = uniqueWorkLogFilterValues(entries, dimension.id);
      map[dimension.id] = values.map((value) => ({
        type: "checkbox" as const,
        id: `${dimension.id}:${value}`,
        label: filterValueLabel(dimension.id, value),
        checked: selectedValues[dimension.id].has(value),
        style: "assignment" as const,
        onCheckedChange: (checked: boolean) => setValueChecked(dimension.id, value, checked),
      }));
    }
    return map;
  }, [entries, selectedValues]);

  const filteredEntries = useMemo(
    () => filterWorkLogEntries(entries, selectedValues, searchQuery),
    [entries, selectedValues, searchQuery],
  );

  const rows = workLogTableRows(filteredEntries);
  const hasEntries = entries.length > 0;
  const hasVisibleRows = rows.length > 0;
  const activeDimensionList = FILTER_DIMENSIONS.filter((dimension) =>
    activeDimensions.has(dimension.id),
  );

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title="Work Log"
      size="lg"
      className={workLogModalShellClass}
      bodyClassName={cn(
        "min-h-0 flex-1 overflow-hidden",
        "[&>div]:flex [&>div]:min-h-0 [&>div]:h-full [&>div]:flex-1 [&>div]:flex-col",
      )}
      primaryAction={{
        label: "Close",
        onClick: onClose,
      }}
    >
      {!hasEntries ? (
        <WorkLogEmptyState message="No work has been completed yet." />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="shrink-0">
            <AceTableFilterHeader
              actions={
                <AceDropdownMenu
                  triggerLabel="Filters"
                  triggerMode="filter"
                  align="start"
                  portalContainer={portalContainer}
                  items={dimensionMenuItems}
                />
              }
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClear={() => setSearchQuery("")}
              searchPlaceholder="Search"
              searchAriaLabel="Search"
              chips={
                activeDimensionList.length > 0
                  ? activeDimensionList.map((dimension) => (
                      <WorkLogFilterChipMenu
                        key={dimension.id}
                        dimension={dimension.id}
                        label={dimensionChipLabel(dimension.id, selectedValues[dimension.id])}
                        valueItems={valueItemsByDimension[dimension.id]}
                        onClear={() => clearDimension(dimension.id)}
                        portalContainer={portalContainer}
                      />
                    ))
                  : null
              }
            />
          </div>
          {hasVisibleRows ? (
            <div
              className={cn(
                "min-h-0 min-w-0 flex-1 overflow-auto",
                "rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-subtle)]",
              )}
            >
              <AceTable
                columns={[...WORK_LOG_COLUMNS]}
                rows={rows}
                caption="Work log"
                className="min-w-[48rem] rounded-none border-0"
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto">
              <WorkLogEmptyState message="No work log entries match the current filters." />
            </div>
          )}
        </div>
      )}
    </DialogModal>
  );
}
