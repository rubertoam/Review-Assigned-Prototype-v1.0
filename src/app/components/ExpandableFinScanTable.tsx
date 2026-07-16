import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceChevronIconClass } from "@ace-ds/lib/aceChevron";
import {
  screeningTableHeaderLabelClass,
  screeningTableHeaderSortButtonClass,
} from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableHeader";
import { Checkbox } from "@ace-ds/components/atoms/Checkbox/Checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { AceGridExpandPanel } from "./AceGridExpandPanel";
import { cn } from "./ui/utils";

/** Smooth open/close — same tokens as ACE `AceAccordion`. */
export const easeAccordion = "[transition-timing-function:var(--ace-accordion-ease)]";
export const durationAccordion = "duration-[var(--ace-accordion-duration)]";

const headerLabelClass = screeningTableHeaderLabelClass;
const headerLabelCompactClass = cn(screeningTableHeaderLabelClass, "text-[10px] leading-tight");
const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** Sort glyphs — `sm` keeps swap_vert optically aligned with header labels. */
const sortIconIdleClass = "shrink-0 text-[var(--screening-icon-muted)] leading-none";
const sortIconActiveClass = "shrink-0 text-[var(--screening-primary)] leading-none";

const expandBtnClass = cn(
  "inline-flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded p-1 transition-colors duration-200 ease-out",
  "text-[var(--screening-text-primary)] hover:bg-[var(--screening-surface-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
);

function ExpandChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center transition-transform",
        durationAccordion,
        easeAccordion,
        expanded ? "rotate-0" : "-rotate-90",
      )}
      aria-hidden
    >
      <MaterialSymbol name="keyboard_arrow_down" size="md" className={aceChevronIconClass} />
    </span>
  );
}

const expandColClass = "w-[34px] px-0 align-middle";
const selectColClass = "w-9 px-0 align-middle";
const leadingHeaderPad = (isCompact: boolean) => (isCompact ? "py-0.5" : "py-1");
const leadingBodyPad = (isCompact: boolean) => (isCompact ? "py-1.5" : "py-3");

function SelectCheckboxCell({
  children,
  visible = true,
}: {
  children: ReactNode;
  visible?: boolean;
}) {
  return (
    <div className="flex items-center justify-center">
      <span
        className={cn(
          checkboxPadWrapClass,
          visible ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
        )}
      >
        {children}
      </span>
    </div>
  );
}

const checkboxPadWrapClass =
  "inline-flex items-center justify-center rounded p-[var(--space-1)] transition-opacity duration-200 ease-out";

export type FinScanTableColumn<T> = {
  key: string;
  label: string;
  sortKey?: string;
  /** Width hint for `<col>` (e.g. `w-[11rem]`). Helps `table-fixed` layouts on narrow viewports. */
  colClassName?: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => ReactNode;
};

export type FinScanTableSortConfig = {
  sortKey: string | null;
  sortDir: "asc" | "desc";
  onToggleSort: (key: string) => void;
};

export type FinScanTableSelectionConfig<T extends { id: string }> = {
  selectedIds: Set<string>;
  isSelectable: (row: T) => boolean;
  onToggleRow: (id: string, checked: boolean) => void;
  onHeaderSelectAll: (value: boolean | "indeterminate") => void;
  headerCheckboxState: boolean | "indeterminate";
  actionableCount: number;
};

export type ExpandableFinScanTableProps<T extends { id: string }> = {
  rows: T[];
  columns: FinScanTableColumn<T>[];
  caption: string;
  minWidth?: string;
  sort?: FinScanTableSortConfig;
  selection?: FinScanTableSelectionConfig<T>;
  trailingColumn?: {
    render: (row: T) => ReactNode;
  };
  /** When false, hides the header “expand all / collapse all” control. */
  showExpandAll?: boolean;
  /** Tighter cell padding for narrow panels (e.g. simulator drawer). */
  density?: "default" | "compact";
  renderExpandedContent?: (row: T) => ReactNode;
  emptyState?: ReactNode;
  getRowClassName?: (row: T) => string | undefined;
  className?: string;
  tableClassName?: string;
  /** `auto` sizes columns to content; `fixed` uses `<col>` width hints (default). */
  tableLayout?: "fixed" | "auto";
  /** When false, hides horizontal scroll on the table wrapper (use with table-fixed + w-full). */
  scrollX?: boolean;
  /** When false, vertical scroll is delegated to a parent (table grows to full content height). */
  scrollY?: boolean;
  /** When false, rows do not expand (checkbox-only leading column if selection is set). */
  expandable?: boolean;
  /** Per-row expand control; non-expandable rows keep the column but hide the control. */
  isRowExpandable?: (row: T) => boolean;
  expandedContentClassName?: string;
  expandedIds?: Set<string>;
  onExpandedIdsChange?: Dispatch<SetStateAction<Set<string>>>;
  /** Optional hover labels for expand controls (e.g. screening list profile). */
  expandTooltips?: {
    expandRow: { open: string; close: string };
    expandAll: { show: string; hide: string };
  };
};

export function ExpandableFinScanTable<T extends { id: string }>({
  rows,
  columns,
  caption,
  minWidth = "min-w-[520px]",
  sort,
  selection,
  trailingColumn,
  expandable = true,
  isRowExpandable,
  showExpandAll = true,
  density = "default",
  renderExpandedContent,
  emptyState,
  getRowClassName,
  className,
  tableClassName,
  tableLayout = "fixed",
  scrollX = true,
  scrollY = true,
  expandedIds: expandedIdsProp,
  onExpandedIdsChange,
  expandTooltips,
  expandedContentClassName,
}: ExpandableFinScanTableProps<T>) {
  const isCompact = density === "compact";
  const cellPad = isCompact ? "px-2 py-1.5" : "px-3 py-3";
  const headerPad = isCompact ? "px-2 py-0.5" : "px-3 py-1";
  const headerRowH = isCompact ? "h-7" : "h-8";
  const bodyText = isCompact ? "text-[12px]" : "text-[14px]";
  const headerLabel = isCompact ? headerLabelCompactClass : headerLabelClass;
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(new Set());
  const isExpandControlled = expandedIdsProp !== undefined && onExpandedIdsChange !== undefined;
  const expandedIds = isExpandControlled ? expandedIdsProp : internalExpandedIds;
  const setExpandedIds = useCallback(
    (action: SetStateAction<Set<string>>) => {
      if (isExpandControlled) onExpandedIdsChange!(action);
      else setInternalExpandedIds(action);
    },
    [isExpandControlled, onExpandedIdsChange],
  );

  const selectionMode = selection != null && selection.selectedIds.size > 0;

  const canExpandRow = useCallback(
    (row: T) => expandable && (isRowExpandable?.(row) ?? true),
    [expandable, isRowExpandable],
  );

  const expandableRowIds = useMemo(
    () => rows.filter((r) => canExpandRow(r)).map((r) => r.id),
    [rows, canExpandRow],
  );

  const allVisibleExpanded =
    expandableRowIds.length > 0 &&
    expandableRowIds.every((id) => expandedIds.has(id));

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleExpandAll = () => {
    if (allVisibleExpanded) {
      setExpandedIds(new Set());
      return;
    }
    setExpandedIds(new Set(expandableRowIds));
  };

  const showExpandCol = expandable;
  const showSelectionCol = selection != null;
  const leadingColCount = (showExpandCol ? 1 : 0) + (showSelectionCol ? 1 : 0);
  const colSpan = leadingColCount + columns.length + (trailingColumn ? 1 : 0);

  const renderExpandAllButton = () => {
    const button = (
      <button
        type="button"
        className={expandBtnClass}
        aria-label={allVisibleExpanded ? "Collapse all rows" : "Expand all rows"}
        onClick={toggleExpandAll}
      >
        <ExpandChevronIcon expanded={allVisibleExpanded} />
      </button>
    );

    if (!expandTooltips) return button;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="top"
          hideArrow
          className="border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-sm"
        >
          {allVisibleExpanded ? expandTooltips.expandAll.hide : expandTooltips.expandAll.show}
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderExpandRowButton = (row: T, expanded: boolean, showControls: boolean) => {
    const button = (
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse row" : "Expand row"}
        onClick={() => toggleExpanded(row.id)}
        className={cn(
          expandBtnClass,
          expanded || showControls
            ? "opacity-100"
            : "opacity-0 pointer-events-none group-hover/row:opacity-100 group-hover/row:pointer-events-auto",
        )}
      >
        <ExpandChevronIcon expanded={expanded} />
      </button>
    );

    if (!expandTooltips) return button;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="top"
          hideArrow
          className="border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-sm"
        >
          {expanded ? expandTooltips.expandRow.close : expandTooltips.expandRow.open}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      className={cn(
        "min-h-0 min-w-0",
        scrollY ? "overflow-y-auto scroll-smooth" : "overflow-y-visible",
        scrollX ? "overflow-x-auto" : "overflow-x-hidden",
        className,
      )}
    >
      <table
        className={cn(
          "w-full border-collapse text-left",
          tableLayout === "fixed" ? "table-fixed" : "table-auto",
          minWidth,
          tableClassName,
        )}
        aria-label={caption}
      >
        <caption className="sr-only">{caption}</caption>
        <colgroup>
          {showExpandCol ? <col className="w-[34px]" /> : null}
          {showSelectionCol ? <col className="w-7" /> : null}
          {columns.map((col) => (
            <col key={col.key} className={col.colClassName} />
          ))}
          {trailingColumn ? <col className="w-10" /> : null}
        </colgroup>
        <thead className="sticky top-0 z-[1] border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface-muted)] shadow-[var(--screening-shadow-thead)]">
          <tr className={headerRowH}>
            {showExpandCol ? (
              <th scope="col" className={cn(expandColClass, leadingHeaderPad(isCompact))}>
                <div className="flex items-center justify-center">
                  {expandable && showExpandAll ? renderExpandAllButton() : null}
                </div>
                <span className="sr-only">Expand rows</span>
              </th>
            ) : null}
            {showSelectionCol ? (
              <th scope="col" className={cn(selectColClass, leadingHeaderPad(isCompact))}>
                <SelectCheckboxCell>
                  <Checkbox
                    size="md"
                    checked={selection.headerCheckboxState}
                    disabled={selection.actionableCount === 0}
                    onCheckedChange={selection.onHeaderSelectAll}
                    aria-label={
                      selection.actionableCount === 0
                        ? "No selectable results"
                        : selection.headerCheckboxState === true
                          ? "Deselect all results"
                          : "Select all results"
                    }
                  />
                </SelectCheckboxCell>
                <span className="sr-only">Select rows</span>
              </th>
            ) : null}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(headerPad, "align-middle", col.headerClassName)}
                aria-sort={
                  sort && col.sortKey && sort.sortKey === col.sortKey
                    ? sort.sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                {sort && col.sortKey ? (
                  <button
                    type="button"
                    onClick={() => sort.onToggleSort(col.sortKey!)}
                    className={cn(screeningTableHeaderSortButtonClass, "gap-1")}
                  >
                    <span className={headerLabel}>{col.label}</span>
                    {sort.sortKey === col.sortKey ? (
                      sort.sortDir === "asc" ? (
                        <MaterialSymbol name="arrow_upward" size="sm" className={sortIconActiveClass} />
                      ) : (
                        <MaterialSymbol name="arrow_downward" size="sm" className={sortIconActiveClass} />
                      )
                    ) : (
                      <MaterialSymbol name="swap_vert" size="sm" className={sortIconIdleClass} />
                    )}
                  </button>
                ) : (
                  <span className={headerLabel} title={col.label}>
                    {col.label}
                  </span>
                )}
              </th>
            ))}
            {trailingColumn ? <th scope="col" className="w-10 p-0 align-middle" aria-hidden /> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && emptyState ? (
            <tr>
              <td colSpan={colSpan} className="px-6 py-16 text-center">
                {emptyState}
              </td>
            </tr>
          ) : null}
          {rows.map((row) => {
            const rowExpandable = canExpandRow(row);
            const expanded = rowExpandable && expandedIds.has(row.id);
            const selected = selection?.selectedIds.has(row.id) ?? false;
            const selectable = selection?.isSelectable(row) ?? false;
            const showControls = selectionMode || expanded;
            const customRowClass = getRowClassName?.(row);

            const rowCells = (
              <>
                {showExpandCol ? (
                  <td className={cn(expandColClass, leadingBodyPad(isCompact))}>
                    <div className="flex items-center justify-center">
                      {rowExpandable ? renderExpandRowButton(row, expanded, showControls) : null}
                    </div>
                  </td>
                ) : null}
                {showSelectionCol ? (
                  <td className={cn(selectColClass, leadingBodyPad(isCompact))}>
                    <SelectCheckboxCell visible={showControls}>
                      <Checkbox
                        size="md"
                        checked={selected}
                        disabled={!selectable}
                        onCheckedChange={(v) => {
                          if (selectable) selection.onToggleRow(row.id, v === true);
                        }}
                        aria-label={
                          selectable ? `Select row ${row.id}` : `Row ${row.id} (not selectable)`
                        }
                      />
                    </SelectCheckboxCell>
                  </td>
                ) : null}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      cellPad,
                      "font-['Noto_Sans:Regular',sans-serif]",
                      bodyText,
                      col.cellClassName,
                    )}
                    style={notoVar}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {trailingColumn ? (
                  <td className="h-px w-10 py-0 pl-0 pr-3 align-middle">
                    <div className="flex h-full min-h-10 w-full items-center justify-center">
                      {trailingColumn.render(row)}
                    </div>
                  </td>
                ) : null}
              </>
            );

            if (!rowExpandable) {
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "group/row border-b border-[#eff0f2] dark:border-[#333a42]",
                    customRowClass ??
                      "bg-white dark:bg-[#22272b]",
                  )}
                >
                  {rowCells}
                </tr>
              );
            }

            return (
              <Fragment key={row.id}>
                <tr
                  aria-selected={selection && selected && selectable ? true : undefined}
                  className={cn(
                    "group/row border-b border-[#eff0f2] transition-[background-color,box-shadow] duration-200 ease-out dark:border-[#333a42]",
                    customRowClass ??
                      "bg-white hover:bg-[#f3f4f6] hover:shadow-[inset_2px_0_0_0_rgba(82,62,185,0.2)] dark:bg-[#22272b] dark:hover:bg-[#2c333a]",
                  )}
                >
                  {rowCells}
                </tr>
                <tr className="border-b border-[#eff0f2] border-t-0 dark:border-[#333a42]">
                  <td colSpan={colSpan} className="w-full p-0 align-top">
                    <AceGridExpandPanel
                      open={expanded}
                      contentClassName={cn(
                        "bg-white dark:bg-[#1d2125]",
                        isCompact ? "px-3 py-2" : "px-4 py-3",
                        expandedContentClassName,
                      )}
                    >
                      {renderExpandedContent?.(row)}
                    </AceGridExpandPanel>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
