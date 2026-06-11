import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ArrowDown, ArrowDownUp, ArrowUp, ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { cn } from "./ui/utils";

/** Smooth open/close for accordions and expandable rows (Material-style deceleration). */
export const easeAccordion = "[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]";
export const durationAccordion = "duration-[420ms]";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const headerLabelBase =
  "font-['Noto_Sans:Bold',sans-serif] font-bold uppercase tracking-wide text-[#6a7285] dark:text-[#8696a7]";
const headerLabelClass = cn(headerLabelBase, "text-[12px]");
const headerLabelCompactClass = cn(headerLabelBase, "text-[10px] leading-tight");

const expandBtnClass =
  "inline-flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded p-1 transition-colors duration-200 ease-out hover:bg-[#eff0f2] dark:hover:bg-[#2c333a] text-[#23262c] dark:text-[#b6c2cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#22272b]";

const chevronClass = cn("size-[18px]", durationAccordion, easeAccordion, "transition-transform");

const expandColClass = "w-[34px] px-0 align-middle";
const selectColClass = "w-7 px-0 align-middle";
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
      <span className={cn(checkboxPadWrapClass, visible ? "opacity-100" : "opacity-0 group-hover/row:opacity-100")}>
        {children}
      </span>
    </div>
  );
}

const checkboxClass =
  "h-4 w-4 shrink-0 cursor-pointer rounded-[3px] border-[#523eb9] border bg-white dark:bg-[#22272b] text-white transition-all duration-200 ease-out data-[state=checked]:bg-[#523eb9] data-[state=checked]:border-[#523eb9] data-[state=indeterminate]:bg-[#523eb9] data-[state=indeterminate]:border-[#523eb9] focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 [&_svg]:size-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:border-[#cfd2d9] dark:disabled:border-[#454c59] disabled:data-[state=checked]:bg-[#d4d6db] disabled:data-[state=checked]:border-[#cfd2d9] disabled:data-[state=indeterminate]:bg-[#d4d6db] disabled:data-[state=indeterminate]:border-[#cfd2d9]";

const checkboxPadWrapClass =
  "inline-flex items-center justify-center rounded p-0.5 transition-opacity duration-200 ease-out";

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
  /** When false, hides horizontal scroll on the table wrapper (use with table-fixed + w-full). */
  scrollX?: boolean;
  /** When false, rows do not expand (checkbox-only leading column if selection is set). */
  expandable?: boolean;
  /** Per-row expand control; non-expandable rows keep the column but hide the control. */
  isRowExpandable?: (row: T) => boolean;
  expandedIds?: Set<string>;
  onExpandedIdsChange?: Dispatch<SetStateAction<Set<string>>>;
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
  scrollX = true,
  expandedIds: expandedIdsProp,
  onExpandedIdsChange,
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

  return (
    <div
      className={cn(
        "min-h-0 min-w-0 overflow-y-auto scroll-smooth",
        scrollX ? "overflow-x-auto" : "overflow-x-hidden",
        className,
      )}
    >
      <table
        className={cn("w-full table-fixed border-collapse text-left", minWidth, tableClassName)}
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
        <thead className="sticky top-0 z-[1] border-b border-[#cfd2d9] bg-[#fafafb] shadow-[0_1px_0_rgba(207,210,217,0.6)] dark:border-[#38414a] dark:bg-[#1d2125] dark:shadow-[0_1px_0_rgba(0,0,0,0.45)]">
          <tr className={headerRowH}>
            {showExpandCol ? (
              <th scope="col" className={cn(expandColClass, leadingHeaderPad(isCompact))}>
                <div className="flex items-center justify-center">
                  {expandable && showExpandAll ? (
                  <button
                    type="button"
                    className={expandBtnClass}
                    aria-label={allVisibleExpanded ? "Collapse all rows" : "Expand all rows"}
                    onClick={toggleExpandAll}
                  >
                    {allVisibleExpanded ? (
                      <ChevronDown className={chevronClass} />
                    ) : (
                      <ChevronRight className={chevronClass} />
                    )}
                  </button>
                ) : null}
                </div>
                <span className="sr-only">Expand rows</span>
              </th>
            ) : null}
            {showSelectionCol ? (
              <th scope="col" className={cn(selectColClass, leadingHeaderPad(isCompact))}>
                <SelectCheckboxCell>
                  <Checkbox
                    className={checkboxClass}
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
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 -mx-1 transition-colors duration-200 ease-out hover:bg-[#eff0f2] dark:hover:bg-[#2c333a] text-[#23262c] dark:text-[#b6c2cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#22272b]"
                  >
                    <span className={headerLabel} style={notoVar}>
                      {col.label}
                    </span>
                    {sort.sortKey === col.sortKey ? (
                      sort.sortDir === "asc" ? (
                        <ArrowUp className="size-4 shrink-0 text-[#523eb9] transition-transform duration-200 ease-out" strokeWidth={2} />
                      ) : (
                        <ArrowDown className="size-4 shrink-0 text-[#523eb9] transition-transform duration-200 ease-out" strokeWidth={2} />
                      )
                    ) : (
                      <ArrowDownUp className="size-4 shrink-0 text-[#949baa] transition-colors duration-200 ease-out" strokeWidth={2} />
                    )}
                  </button>
                ) : (
                  <span className={headerLabel} style={notoVar} title={col.label}>
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
                      {rowExpandable ? (
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
                        {expanded ? (
                          <ChevronDown className={chevronClass} />
                        ) : (
                          <ChevronRight className={chevronClass} />
                        )}
                      </button>
                    ) : null}
                    </div>
                  </td>
                ) : null}
                {showSelectionCol ? (
                  <td className={cn(selectColClass, leadingBodyPad(isCompact))}>
                    <SelectCheckboxCell visible={showControls}>
                      <Checkbox
                        className={checkboxClass}
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
                  <td
                    className={cn(
                      "w-10 px-1 align-middle",
                      isCompact ? "py-1.5" : "py-3",
                    )}
                  >
                    {trailingColumn.render(row)}
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
                  <td colSpan={colSpan} className="p-0 align-top">
                    <div
                      className={cn(
                        "grid overflow-hidden transition-[grid-template-rows]",
                        durationAccordion,
                        easeAccordion,
                        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div
                          className={cn(
                            "bg-white dark:bg-[#1d2125]",
                            isCompact ? "px-3 py-2" : "px-4 py-3",
                          )}
                        >
                          {renderExpandedContent?.(row)}
                        </div>
                      </div>
                    </div>
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
