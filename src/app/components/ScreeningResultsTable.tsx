import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { Toggle } from "@ace-ds/components/atoms/Toggle/Toggle";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { AceFilterToggleChip } from "@ace-ds/components/molecules/AceFiltering/AceFilterToggleChip";
import { AcePagination } from "@ace-ds/components/molecules/AcePagination/AcePagination";
import {
  screeningStatusFilterLabelClass,
  screeningToolbarIconButtonClass,
} from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import { aceAccordionFixedHeaderClass, aceAccordionPanelFillClass } from "../lib/aceAccordion";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import { ScreeningStatusBadge } from "./ScreeningStatusBadge";
import {
  LEVEL1_DECISION_STATUSES,
  LEVEL1_STATUS_DISPLAY_ORDER,
  LEVEL2_DECISION_STATUSES,
  isLevel1ConfirmedStatus,
  isLevel1InProcessStatus,
  type Level1ScreeningStatus,
  type Level2DecisionStatus,
} from "../lib/reviewDecisionConfig";
import {
  ExpandableFinScanTable,
  durationAccordion,
  easeAccordion,
  type FinScanTableColumn,
} from "./ExpandableFinScanTable";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  getClientRecordForRow,
  getListProfileSummaryForRow,
  isOrganizationRow,
} from "../lib/listProfileData";
import { AceDropdownMenu } from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import {
  caseActionsMenuIconClass,
  screeningRowActionsMenuContentClass,
  screeningRowActionsMenuItemClass,
  screeningRowActionsMenuTriggerClass,
} from "../lib/caseActionsMenuStyles";
import { ListProfileInlineContent } from "./ListProfileInlineContent";
import { MatchSimulatorPanel } from "./MatchSimulatorPanel";
import { DocumentsPanel } from "./DocumentsPanel";
import { ListHistoryPanel } from "./ListHistoryPanel";
import { ScreeningHistoryPanel } from "./ScreeningHistoryPanel";

export { easeAccordion, durationAccordion } from "./ExpandableFinScanTable";

const LIST_PROFILE_ANIMATION_MS = 420;

const ROW_DRILLDOWN_VIEWS = [
  "screening-history",
  "documents",
  "match-simulator",
  "list-history",
] as const;

type RowDrilldownView = (typeof ROW_DRILLDOWN_VIEWS)[number];

const ROW_DRILLDOWN_TRANSLATE: Record<RowDrilldownView, string> = {
  "screening-history": "-translate-x-[20%]",
  documents: "-translate-x-[40%]",
  "match-simulator": "-translate-x-[60%]",
  "list-history": "-translate-x-[80%]",
};

/** Level 1 decision outcomes plus Level 2 terminal statuses. */
export type ScreeningRowStatus = Level1ScreeningStatus | Level2DecisionStatus;

/** L2 terminal statuses (Safe / False Positive). */
export function isLevel2ReviewedRow(
  row: Pick<ScreeningResultRow, "status" | "decisionReviewer">,
): boolean {
  return row.status === "Safe" || row.status === "False Positive";
}

export function isLevel2ReviewedStatus(status: ScreeningRowStatus): boolean {
  return status === "Safe" || status === "False Positive";
}

/** L1 terminal decisions visible to L2 via review history only. */
export function isLevel1ConfirmedRow(
  row: Pick<ScreeningResultRow, "status" | "decisionReviewer">,
): boolean {
  return isLevel1ConfirmedStatus(row.status) && !row.decisionReviewer;
}

/** Shared lavender pill surface (table “New” badge, profile header tags, in‑process tile). */
export const screeningNewPillSurfaceClass =
  "border border-[var(--screening-pill-new-border)] bg-[var(--screening-pill-new-surface)] transition-colors duration-200 ease-out";

export const screeningNewPillLabelClass = cn(
  aceTypography(ACE_TYPE.captionSemiBold),
  "text-[var(--screening-pill-new-label)]",
);

/** Disabled / completed screening rows — ACE neutral 600 (theme-aware). */
export const screeningDisabledTextClass = "text-[var(--ace-button-neutral-600)]";

export const screeningDisabledRowClass = cn(
  "bg-[#f3f4f6] dark:bg-[#2c333a]",
  "[&_td]:italic [&_td_*]:italic",
  "[&_td]:!text-[var(--ace-button-neutral-600)] [&_td_*]:!text-[var(--ace-button-neutral-600)]",
);

export function isDisabledScreeningRow(
  row: ScreeningTableDisplayRow,
  flowVariant: "level-1" | "level-2" = "level-1",
  forceReadOnly = false,
): boolean {
  if (forceReadOnly) return true;
  if (flowVariant === "level-2") return row.readOnlyHistory === true;
  return row.status !== "New";
}

export type CaseListSectionContext = "todo" | "done";

export type ScreeningResultRow = {
  id: string;
  name: string;
  dob: string;
  matchAgeLabel: string;
  matchAgeTone: "fresh" | "warn" | "stale";
  matchScore: number;
  matchTiles: string[];
  status: ScreeningRowStatus;
  /** Reason recorded when the Level 2 analyst submits a decision. */
  decisionReason?: string;
  /** Level 2 analyst who submitted the decision. */
  decisionReviewer?: string;
  /** Level 1 analyst who cleared the match before escalation (Level 2 view). */
  level1Reviewer?: string;
  /** Level 1 reason when the match was cleared without escalation. */
  level1Reason?: string;
  /** Prototype: row is New again after a prior Confirmed Safe decision. */
  reopenedFromConfirmedSafe?: boolean;
  /** Reopened for Level 1 because Level 2 sent it back via Remediate. */
  remediatedFromLevel2?: boolean;
  /** Reason the Level 2 analyst chose when remediating. */
  remediationReason?: string;
};

/** Row shape used inside the table (Level 2 review history adds display overrides). */
export type ScreeningTableDisplayRow = ScreeningResultRow & {
  readOnlyHistory?: boolean;
  /** L1-cleared rows show Safe; L2 Safe decisions show Confirmed Safe. */
  displayStatus?: "Safe" | "Confirmed Safe";
};

/** Level 2 analyst name shown in the Reviewer column for L2 decisions. */
export const LEVEL2_ANALYST_REVIEWER = "Laura";

const CASE_RESULT_COUNTS = [8, 8, 7, 5, 3, 2] as const;

/** Mock Level 1 reviewers per case (aligned with `CASE_RESULT_COUNTS` indices). */
const LEVEL1_CASE_REVIEWERS = [
  "Janet",
  "Laura",
  "Michael",
  "Janet",
  "Chris",
  "Pat",
] as const;

const CASE_VARIANT_NAMES: readonly (readonly string[])[] = [
  ["John Smith", "John A. Smith", "J. Smith", "Smith, John", "Johnny Smith", "Jon P. Smith", "John Smyth", "Smith, Johnathan"],
  ["Mr. Jose A Gonzalez", "Jose Antonio Gonzalez", "J. A. Gonzalez", "Gonzalez, Jose", "Jose A. Gonzales", "J. Gonzalez", "Jose González", "Gonzalez Jose"],
  ["Muammar Qadhafi", "Muammar Gaddafi", "Moammar Qaddafi", "Qadhafi, Muammar", "Kadhafi Muammar", "Al-Qadhafi Muammar", "Muammar Al Qathafi"],
  ["Jane Doe", "J. Doe", "Doe, Jane", "Janet Doe", "Jane D. Oe"],
  ["Bank of Iran", "Bank Melli Iran", "Iranian Banking Corp."],
  ["Bank of Moscow", "Moscow Joint Stock Bank"],
];

const AGE_LABELS = ["4h", "9h", "12h", "18h", "22h", "1d", "2d", "3d"] as const;
const TONE_ROTATION: ScreeningResultRow["matchAgeTone"][] = ["fresh", "fresh", "warn", "warn", "stale", "stale", "stale", "fresh"];

const TILE_ROTATIONS = [
  ["E", "B", "N", "C1", "E", "N", "B"],
  ["E", "N", "C2", "B", "E", "N", "N"],
  ["N", "B", "C1", "E", "N", "B", "E"],
  ["E", "E", "N", "C2", "B", "N", "N"],
  ["N", "C1", "B", "E", "N", "B", "B"],
] as const;

function randomDobForRow(caseIndex: number, rowIndex: number): string {
  const seed = (caseIndex + 1) * 997 + (rowIndex + 1) * 7919;
  const year = 1940 + (seed % 66);
  const month = 1 + (seed % 12);
  const day = 1 + ((seed >> 4) % 28);
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
}

/** ~50% of rows per case — deterministic — show Confirmed Safe → New in history / review panel. */
function reopenedFromConfirmedSafeForRow(caseIndex: number, rowIndex: number): boolean {
  const seed = (caseIndex + 1) * 419 + (rowIndex + 1) * 907;
  return seed % 2 === 0;
}

function level1ReviewerForCase(caseIndex: number): string {
  return LEVEL1_CASE_REVIEWERS[Math.min(caseIndex, LEVEL1_CASE_REVIEWERS.length - 1)];
}

export function getScreeningRowsForCase(caseIndex: number): ScreeningResultRow[] {
  const ci = Math.max(0, Math.min(caseIndex, CASE_RESULT_COUNTS.length - 1));
  const total = CASE_RESULT_COUNTS[ci];
  const names = CASE_VARIANT_NAMES[ci];
  const rows: ScreeningResultRow[] = [];
  for (let i = 0; i < total; i++) {
    const name = names[Math.min(i, names.length - 1)];
    const score = Math.max(22, 93 - i * 7 - (ci % 3) * 2);
    const tiles = TILE_ROTATIONS[i % TILE_ROTATIONS.length];
    const reopenedFromConfirmedSafe = reopenedFromConfirmedSafeForRow(ci, i);
    rows.push({
      id: `c${ci}-${i + 1}`,
      name,
      dob: randomDobForRow(ci, i),
      matchAgeLabel: AGE_LABELS[i % AGE_LABELS.length],
      matchAgeTone: TONE_ROTATION[i % TONE_ROTATION.length],
      matchScore: score,
      matchTiles: [...tiles],
      status: "New",
      ...(reopenedFromConfirmedSafe
        ? {
            reopenedFromConfirmedSafe: true,
            level1Reviewer: level1ReviewerForCase(ci),
            level1Reason: "Confirmed Safe",
          }
        : {}),
    });
  }
  return rows;
}

export function level1ReviewerForCaseIndex(caseIndex: number): string {
  return level1ReviewerForCase(caseIndex);
}

/** Status label as shown in the table status column (used for dynamic filter chips). */
export function tableStatusLabel(row: ScreeningTableDisplayRow): string {
  if (row.displayStatus === "Confirmed Safe") return "Confirmed Safe";
  if (row.displayStatus === "Safe") return "Safe";
  if (isRemediatedActiveRow(row)) return "Remediate";
  return row.status;
}

/** Row was sent back by Level 2 (Remediate) and still awaits Level 1 re-review. */
export function isRemediatedActiveRow(
  row: Pick<ScreeningResultRow, "status" | "remediatedFromLevel2">,
): boolean {
  return Boolean(row.remediatedFromLevel2) && row.status === "New";
}

const STATUS_FILTER_DISPLAY_ORDER: readonly string[] = [
  ...LEVEL1_STATUS_DISPLAY_ORDER,
  "Remediate",
  ...LEVEL2_DECISION_STATUSES.filter((status) => status === "False Positive"),
];

/** True when the current selection will clear all remaining actionable rows for the case. */
export function willCompleteCaseOnSubmit(
  rows: ScreeningResultRow[],
  selectedIds: Set<string>,
  flowVariant: "level-1" | "level-2",
): boolean {
  const pending =
    flowVariant === "level-1"
      ? rows.filter((row) => row.status === "New")
      : rows.filter((row) => isLevel1InProcessStatus(row.status));
  return pending.length > 0 && pending.every((row) => selectedIds.has(row.id));
}

export const MOCK_ROWS: ScreeningResultRow[] = getScreeningRowsForCase(0);

type SortKey = "name" | "country" | "dob" | "matchAge" | "matchScore" | "status" | "reviewer";
type SortDir = "asc" | "desc";

type ScreeningColumnKey =
  | "status"
  | "name"
  | "clientName"
  | "country"
  | "clientCountry"
  | "dob"
  | "clientDob"
  | "matchAge"
  | "matchScore"
  | "listId"
  | "listCategory"
  | "listProfileId"
  | "reviewer"
  | "comments"
  | "matchString"
  | "reason"
  | "matchedNameType"
  | "finscanCategory";

const SCREENING_COLUMN_DEFINITIONS: ReadonlyArray<{
  key: ScreeningColumnKey;
  label: string;
  defaultVisible: boolean;
}> = [
  { key: "status", label: "Status", defaultVisible: true },
  { key: "name", label: "Name", defaultVisible: true },
  { key: "clientName", label: "Client Name", defaultVisible: false },
  { key: "country", label: "Country", defaultVisible: true },
  { key: "clientCountry", label: "Client Country", defaultVisible: false },
  { key: "dob", label: "Date of Birth", defaultVisible: true },
  { key: "clientDob", label: "Client DOB", defaultVisible: false },
  { key: "matchAge", label: "Match Age", defaultVisible: true },
  { key: "matchScore", label: "Match Score", defaultVisible: true },
  { key: "listId", label: "List ID", defaultVisible: true },
  { key: "listCategory", label: "List Category", defaultVisible: true },
  { key: "listProfileId", label: "List Profile ID", defaultVisible: true },
  { key: "reviewer", label: "Reviewer", defaultVisible: true },
  { key: "comments", label: "Comments", defaultVisible: false },
  { key: "matchString", label: "Match String", defaultVisible: false },
  { key: "reason", label: "Reason", defaultVisible: false },
  { key: "matchedNameType", label: "Matched Name Type", defaultVisible: false },
  { key: "finscanCategory", label: "FinScan Category", defaultVisible: false },
];

const DEFAULT_VISIBLE_SCREENING_COLUMNS = new Set<ScreeningColumnKey>(
  SCREENING_COLUMN_DEFINITIONS.filter((column) => column.defaultVisible).map((column) => column.key),
);

const DEFAULT_SCREENING_COLUMN_ORDER: ScreeningColumnKey[] = SCREENING_COLUMN_DEFINITIONS.map(
  (column) => column.key,
);

const SCREENING_COLUMN_LABELS = Object.fromEntries(
  SCREENING_COLUMN_DEFINITIONS.map((column) => [column.key, column.label]),
) as Record<ScreeningColumnKey, string>;

const SCREENING_COLUMN_DRAG_MIME = "text/screening-column-key";

const screeningColumnMenuRowClass = cn(
  "[font:var(--ace-type-paragraph-p1-regular)] [letter-spacing:var(--ace-type-paragraph-p1-regular-tracking)]",
  "flex w-full cursor-pointer select-none items-center gap-1.5 px-[var(--space-3)] py-[var(--space-2)] text-[var(--screening-text-primary)] outline-none",
  "data-[highlighted]:bg-[var(--screening-surface-hover)]",
);

const SCREENING_COLUMN_DRAG_MS = 140;

const screeningColumnDragMotionClass = cn(
  `duration-[${SCREENING_COLUMN_DRAG_MS}ms]`,
  "[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
);

const screeningColumnDropLineClass = cn(
  "pointer-events-none absolute inset-x-2 z-20 h-0.5 rounded-full",
  "bg-[var(--screening-pill-new-border)]",
  "shadow-[0_0_10px_color-mix(in_srgb,var(--screening-primary)_20%,transparent)]",
  "origin-center transition-[opacity,transform]",
  screeningColumnDragMotionClass,
);

const FINSCAN_CATEGORY_ROTATION = ["Sanctions", "PEP", "Financial Crime"] as const;

function reorderScreeningColumnKeys(
  order: ScreeningColumnKey[],
  fromKey: ScreeningColumnKey,
  toKey: ScreeningColumnKey,
  position: "before" | "after",
): ScreeningColumnKey[] {
  if (fromKey === toKey) return order;
  const next = order.filter((key) => key !== fromKey);
  let insertIndex = next.indexOf(toKey);
  if (insertIndex === -1) return order;
  if (position === "after") insertIndex += 1;
  next.splice(insertIndex, 0, fromKey);
  return next;
}

type ColumnDropIndicator = {
  targetKey: ScreeningColumnKey;
  position: "before" | "after";
} | null;

function ScreeningColumnReorderMenuItem({
  columnKey,
  label,
  checked,
  disabled,
  draggedColumnKey,
  dropIndicator,
  onCheckedChange,
  onReorder,
  onDropIndicatorChange,
  onDraggedColumnKeyChange,
  onItemRef,
}: {
  columnKey: ScreeningColumnKey;
  label: string;
  checked: boolean;
  disabled?: boolean;
  draggedColumnKey: ScreeningColumnKey | null;
  dropIndicator: ColumnDropIndicator;
  onCheckedChange: (checked: boolean) => void;
  onReorder: (
    fromKey: ScreeningColumnKey,
    toKey: ScreeningColumnKey,
    position: "before" | "after",
  ) => void;
  onDropIndicatorChange: (indicator: ColumnDropIndicator) => void;
  onDraggedColumnKeyChange: (key: ScreeningColumnKey | null) => void;
  onItemRef: (key: ScreeningColumnKey, node: HTMLElement | null) => void;
}) {
  const isDragging = draggedColumnKey === columnKey;
  const isDragSessionActive = draggedColumnKey !== null;

  return (
    <DropdownMenuPrimitive.Item
      ref={(node) => onItemRef(columnKey, node)}
      data-slot="dropdown-menu-toggle-item"
      disabled={disabled}
      aria-label={label}
      className={cn(
        screeningColumnMenuRowClass,
        "group/column-row relative",
        isDragSessionActive && cn("transition-[opacity,transform]", screeningColumnDragMotionClass),
        isDragging && "z-10 scale-[0.99] opacity-55",
        !isDragging && isDragSessionActive && "opacity-95",
      )}
      onSelect={(event) => {
        event.preventDefault();
        if (!disabled) onCheckedChange(!checked);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (draggedColumnKey === columnKey) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const position = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
        onDropIndicatorChange({ targetKey: columnKey, position });
      }}
      onDrop={(event) => {
        event.preventDefault();
        const fromKey = event.dataTransfer.getData(SCREENING_COLUMN_DRAG_MIME) as ScreeningColumnKey;
        if (fromKey && dropIndicator) {
          onReorder(fromKey, dropIndicator.targetKey, dropIndicator.position);
        }
        onDropIndicatorChange(null);
        onDraggedColumnKeyChange(null);
      }}
    >
      <Toggle
        size="sm"
        checked={checked}
        disabled={disabled}
        tabIndex={-1}
        className="pointer-events-none"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <button
        type="button"
        draggable
        aria-label={`Reorder ${label}`}
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded text-[var(--screening-icon-muted)]",
          "cursor-grab opacity-0 active:cursor-grabbing",
          "transition-opacity",
          screeningColumnDragMotionClass,
          "group-hover/column-row:opacity-100 focus-visible:opacity-100",
          isDragging && "opacity-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
        )}
        onDragStart={(event) => {
          event.dataTransfer.setData(SCREENING_COLUMN_DRAG_MIME, columnKey);
          event.dataTransfer.effectAllowed = "move";
          event.stopPropagation();
          onDraggedColumnKeyChange(columnKey);
        }}
        onDragEnd={() => {
          onDropIndicatorChange(null);
          onDraggedColumnKeyChange(null);
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <MaterialSymbol name="drag_handle" size="sm" className="size-3.5" />
      </button>
    </DropdownMenuPrimitive.Item>
  );
}

export function scoreIsHighRisk(score: number): boolean {
  return score >= 85;
}

export function tileSoftStyle(code: string): { bg: string; fg: string; border: string } {
  const upper = code.toUpperCase();
  if (upper === "E") return { bg: "#fdeaea", fg: "#9e2a2a", border: "rgba(194,40,40,0.12)" };
  if (upper === "N") return { bg: "#e8f4ea", fg: "#2d6a3e", border: "rgba(46,125,50,0.12)" };
  if (upper === "C1" || upper === "C") return { bg: "#fff4e8", fg: "#b35c00", border: "rgba(230,126,0,0.12)" };
  if (upper === "C2") return { bg: "#fff9e6", fg: "#9a6b00", border: "rgba(249,168,37,0.15)" };
  if (upper === "B") return { bg: "#f0f1f3", fg: "#5c6370", border: "rgba(106,114,130,0.15)" };
  return { bg: "#f0f1f3", fg: "#5c6370", border: "rgba(106,114,130,0.15)" };
}

/** Match-string tiles — same markup as the screening results table column. */
export function MatchStringTiles({
  tiles,
  className,
  size = "default",
}: {
  tiles: string[];
  className?: string;
  size?: "default" | "lg";
}) {
  const tileSizeClass =
    size === "lg"
      ? "h-[28px] min-w-[28px] px-1.5 text-[12.5px]"
      : "h-[22px] min-w-[22px] px-1 text-[10px]";

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {tiles.map((t, i) => {
        const s = tileSoftStyle(t);
        return (
          <span
            key={`${t}-${i}`}
            title={t}
            className={cn(
              "inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded border border-solid font-semibold leading-none",
              tileSizeClass,
            )}
            style={{
              backgroundColor: s.bg,
              color: s.fg,
              borderColor: s.border,
            }}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}

function showMatchAgeStaleIndicator(tone: ScreeningResultRow["matchAgeTone"]): boolean {
  return tone === "stale";
}

function parseAgeForSort(label: string): number {
  const m = label.match(/^(\d+(?:\.\d+)?)\s*(h|d|w|m|y)?$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = (m[2] || "h").toLowerCase();
  const mult =
    u === "h" ? 1 : u === "d" ? 24 : u === "w" ? 24 * 7 : u === "m" ? 24 * 30 : u === "y" ? 24 * 365 : 1;
  return n * mult;
}

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function matchAttributeLabel(code: string): string {
  const upper = code.toUpperCase();
  if (upper === "E") return "EQUAL";
  if (upper === "C1" || upper === "C") return "VERY CLOSE";
  if (upper === "C2") return "CLOSE";
  if (upper === "B") return "BLANK";
  if (upper === "N") return "NOT EQUAL";
  return upper;
}

export type SimulatorRunResultRow = {
  id: string;
  tile: string;
  matchField: string;
  clientData: string;
  listData: string;
};

export function buildSimulatorRunRows(row: ScreeningResultRow): SimulatorRunResultRow[] {
  const sampleClient = ["SMITH", "JOHN", "", "", "", ""];
  const sampleList = ["SMITHY", "JOHN", "", "", "", ""];
  return row.matchTiles.map((tile, i) => ({
    id: `${row.id}-run-${i}`,
    tile,
    matchField: `Significant Name ${i + 1}`,
    clientData: sampleClient[i] ?? "",
    listData: sampleList[i] ?? "",
  }));
}

const RUN_RESULTS_COLUMNS: FinScanTableColumn<SimulatorRunResultRow>[] = [
  {
    key: "matchField",
    label: "Match Field",
    cellClassName: "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
    render: (r) => r.matchField,
  },
  {
    key: "clientData",
    label: "Client Data",
    cellClassName: "text-[#464c59] dark:text-[#9fadbc]",
    render: (r) => r.clientData || "\u00a0",
  },
  {
    key: "listData",
    label: "List Data",
    cellClassName: "text-[#464c59] dark:text-[#9fadbc]",
    render: (r) => r.listData || "\u00a0",
  },
  {
    key: "matchAttribute",
    label: "Match Attribute",
    render: (r) => {
      const soft = tileSoftStyle(r.tile);
      return (
        <span
          className="inline-flex w-fit items-center rounded-[4px] border border-solid px-2 py-1 font-['Noto_Sans:Bold',sans-serif] text-[10px] font-bold leading-none tracking-wide"
          style={{
            backgroundColor: soft.bg,
            color: soft.fg,
            borderColor: soft.border,
          }}
        >
          {matchAttributeLabel(r.tile)}
        </span>
      );
    },
  },
];

export type NamePatternTableRow = {
  id: string;
  rowLabel: string;
  cells: string[];
  attributeTiles: string[];
  kind: "client" | "list";
};

function compactMatchTiles(tiles: string[], tight = false) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center", tight ? "gap-0.5" : "gap-1.5")}>
      {tiles.map((t, i) => {
        const s = tileSoftStyle(t);
        return (
          <span
            key={`${t}-${i}`}
            title={t}
            className={cn(
              "inline-flex items-center justify-center rounded border border-solid font-semibold leading-none",
              tight ? "size-3.5 text-[9px]" : "size-4 text-[10px]",
            )}
            style={{
              backgroundColor: s.bg,
              color: s.fg,
              borderColor: s.border,
            }}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}

function padNamePatternCells(arr: string[], len: number): string[] {
  const out = [...arr];
  while (out.length < len) out.push("");
  return out.slice(0, len);
}

export function buildNamePatternTableRows(row: ScreeningResultRow): NamePatternTableRow[] {
  const colCount = Math.max(3, row.matchTiles.length);
  const clientCells = padNamePatternCells(["SMITH", "JOHN", "", "", ""], colCount);
  const listCells = padNamePatternCells(["SMITH", "JOHN", "JAMES", "", ""], colCount);
  const clientAttrs = padNamePatternCells(row.matchTiles.map(String), colCount);
  const listAttrs = padNamePatternCells(["E", "B", "C2", "C1", "N"], colCount);

  return [
    {
      id: `${row.id}-np-client`,
      rowLabel: "Client Name",
      cells: clientCells,
      attributeTiles: clientAttrs,
      kind: "client",
    },
    {
      id: `${row.id}-np-list`,
      rowLabel: "List Name",
      cells: listCells,
      attributeTiles: listAttrs,
      kind: "list",
    },
  ];
}

export type NamePatternTableSize = "compact" | "comfortable";

function buildNamePatternColumns(
  colCount: number,
  size: NamePatternTableSize = "compact",
): FinScanTableColumn<NamePatternTableRow>[] {
  const comfortable = size === "comfortable";
  const cols: FinScanTableColumn<NamePatternTableRow>[] = [
    {
      key: "rowLabel",
      label: "",
      headerClassName: comfortable ? "w-[10%]" : "w-[76px] max-w-[76px]",
      cellClassName: cn(
        "font-medium text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
        comfortable ? "text-[13px]" : "text-[11px]",
      ),
      render: (r) => r.rowLabel,
    },
  ];

  for (let i = 0; i < colCount; i++) {
    const index = i;
    cols.push({
      key: `significant-name-${index + 1}`,
      label: comfortable ? `Significant Name ${index + 1}` : `Name ${index + 1}`,
      headerClassName: comfortable
        ? "text-center"
        : "text-center min-w-[48px] max-w-[64px]",
      cellClassName: cn(
        "text-center text-[#464c59] dark:text-[#9fadbc]",
        comfortable ? "text-[13px]" : "text-[11px]",
      ),
      render: (r) => {
        const cell = r.cells[index] ?? "";
        const highlight = r.kind === "list" && cell !== "";
        return (
          <span
            className={cn(
              "inline-flex w-full items-center justify-center",
              comfortable ? "min-h-[28px] px-1" : "min-h-[20px] px-0.5",
              highlight && "bg-[#c9e5bd] dark:bg-[#3d5a35]",
            )}
          >
            {cell || "\u00a0"}
          </span>
        );
      },
    });
  }

  cols.push({
    key: "matchAttributes",
    label: comfortable ? "Match Attributes" : "Match Attr.",
    headerClassName: comfortable ? "w-[14%] text-center" : "text-center min-w-[72px]",
    cellClassName: "text-center",
    render: (r) => compactMatchTiles(r.attributeTiles, !comfortable),
  });

  return cols;
}

export type ReferenceDataFieldRow = {
  id: string;
  label: string;
  value: string;
};

const REFERENCE_DATA_FIELD_COLUMNS: FinScanTableColumn<ReferenceDataFieldRow>[] = [
  {
    key: "label",
    label: "Label",
    headerClassName: "w-[38%]",
    cellClassName:
      "font-['Noto_Sans:SemiBold',sans-serif] font-semibold text-[#464c59] dark:text-[#9fadbc]",
    render: (r) => r.label,
  },
  {
    key: "field",
    label: "Field",
    cellClassName: "text-[#23262c] dark:text-[#b6c2cf] break-words",
    render: (r) => r.value,
  },
];

/** Match Simulator Reference Data — label / field rows (no expand). */
export function SimulatorReferenceDataTable({
  rows,
  caption,
}: {
  rows: ReferenceDataFieldRow[];
  caption: string;
}) {
  return (
    <ExpandableFinScanTable
      rows={rows}
      columns={REFERENCE_DATA_FIELD_COLUMNS}
      caption={caption}
      expandable={false}
      density="compact"
      minWidth="w-full"
      tableClassName="table-fixed"
      scrollX={false}
      className="overflow-hidden rounded-[4px] border border-[#e4e6ea] bg-white dark:border-[#38414a] dark:bg-[#22272b]"
    />
  );
}

/** Match Simulator “Name Patterns” — static table (compact in drawer, comfortable in modal). */
export function SimulatorNamePatternsTable({
  rows,
  size = "compact",
}: {
  rows: NamePatternTableRow[];
  size?: NamePatternTableSize;
}) {
  const colCount = rows[0]?.cells.length ?? 3;
  const columns = useMemo(() => buildNamePatternColumns(colCount, size), [colCount, size]);
  const comfortable = size === "comfortable";

  return (
    <ExpandableFinScanTable
      rows={rows}
      columns={columns}
      caption="Match simulator name patterns"
      expandable={false}
      density={comfortable ? "default" : "compact"}
      minWidth="w-full"
      tableClassName={comfortable ? "table-fixed" : undefined}
      scrollX={!comfortable}
      className="rounded-[4px] border border-[#e4e6ea] dark:border-[#38414a]"
      getRowClassName={(r) =>
        r.kind === "list" ? "bg-[#fafafb] dark:bg-[#1d2125]" : undefined
      }
    />
  );
}

/** Match Simulator “Run Results” — shared ExpandableFinScanTable (no sort, no striping). */
export function SimulatorRunResultsTable({ rows }: { rows: SimulatorRunResultRow[] }) {
  return (
    <ExpandableFinScanTable
      rows={rows}
      columns={RUN_RESULTS_COLUMNS}
      caption="Match simulator run results"
      minWidth="min-w-[520px]"
      className="border border-[#e4e6ea] dark:border-[#38414a]"
      renderExpandedContent={(r) => (
        <p
          className="m-0 font-['Noto_Sans:Regular',sans-serif] text-[13px] not-italic text-[#464c59] dark:text-[#9fadbc]"
          style={notoVar}
        >
          Attribute detail for {r.matchField} (prototype placeholder).
        </p>
      )}
    />
  );
}


interface ScreeningResultsTableProps {
  rows?: ScreeningResultRow[];
  title?: string;
  /** Level 2 shows escalated-only work queue plus optional L1 review history. */
  flowVariant?: "level-1" | "level-2";
  /** Which case-list bucket is active — scopes visible rows (todo vs sent-away). */
  caseListSection?: CaseListSectionContext;
  /** Optional root classes (e.g. `w-full`). Table body scroll is internal to the component; avoid `flex-1` on the root so the closed accordion does not stretch. */
  className?: string;
  /** When both are passed, row selection is controlled by the parent (e.g. task bar). */
  selectedIds?: Set<string>;
  onSelectedIdsChange?: Dispatch<SetStateAction<Set<string>>>;
  /** Clears a single row to the chosen decision status from the table's Quick Clear column. */
  onQuickClearRow?: (rowId: string, status: ScreeningRowStatus) => void;
  /** Case is locked by another analyst — view-only, no selection or actions. */
  readOnly?: boolean;
}

/** Per-row Quick Clear dropdown — resolves a single match to a decision status from the table. */
function ScreeningRowQuickClear({
  disabled,
  flowVariant,
  onSelect,
  variant = "icon",
}: {
  disabled: boolean;
  flowVariant: "level-1" | "level-2";
  onSelect: (status: ScreeningRowStatus) => void;
  /** `icon` saves space inside table rows; `field` is the labelled trigger for the expanded row. */
  variant?: "icon" | "field";
}) {
  const options =
    flowVariant === "level-2" ? LEVEL2_DECISION_STATUSES : LEVEL1_DECISION_STATUSES;

  if (variant === "field") {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <AceDropdownMenu
          triggerLabel="Quick Clear"
          triggerMode="field"
          size="sm"
          align="end"
          showChevron
          disabled={disabled}
          className="shrink-0 font-['Noto_Sans:Regular',sans-serif] font-normal text-[var(--screening-primary)]"
          items={options.map((status) => ({
            type: "item" as const,
            label: status,
            onSelect: () => onSelect(status as ScreeningRowStatus),
          }))}
        />
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Quick Clear"
                disabled={disabled}
                className={cn(
                  screeningToolbarIconButtonClass,
                  disabled &&
                    "cursor-not-allowed border-[#cfd2d9] bg-[#f5f6f8] text-[#949baa] opacity-60 dark:border-[#38414a] dark:bg-[#2c333a] dark:text-[#6a7285]",
                )}
              >
                <MaterialSymbol name="flash_on" size="md" weight={300} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            hideArrow
            className={cn(
              aceTypography(ACE_TYPE.captionSemiBold),
              "border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-[var(--ace-drop-shadow-xs)]",
            )}
          >
            Quick Clear
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-[12rem]">
          <DropdownMenuLabel>Quick Clear</DropdownMenuLabel>
          {options.map((status) => (
            <DropdownMenuItem
              key={status}
              onSelect={() => onSelect(status as ScreeningRowStatus)}
            >
              {status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function reviewerLabelForRow(row: ScreeningTableDisplayRow): string {
  if (isLevel2ReviewedRow(row) || row.displayStatus === "Confirmed Safe") {
    return row.decisionReviewer ?? LEVEL2_ANALYST_REVIEWER;
  }
  if (isLevel1ConfirmedRow(row)) {
    return row.level1Reviewer ?? "";
  }
  return "";
}

function reasonLabelForRow(row: ScreeningTableDisplayRow): string {
  return row.decisionReason ?? row.level1Reason ?? "";
}

function commentLabelForRow(row: ScreeningTableDisplayRow): string {
  if (row.decisionReason) return row.decisionReason;
  if (row.level1Reason) return row.level1Reason;
  if (row.status === "New") return "";
  return "Escalated for secondary review.";
}

function matchedNameTypeForRow(row: ScreeningTableDisplayRow): string {
  return /bank|corp|ltd|inc\.?/i.test(row.name) ? "Entity" : "Individual";
}

function finscanCategoryForRow(row: ScreeningTableDisplayRow): string {
  const match = row.id.match(/^c(\d+)-(\d+)$/);
  const rowIndex = match ? Math.max(0, Number(match[2]) - 1) : 0;
  return FINSCAN_CATEGORY_ROTATION[rowIndex % FINSCAN_CATEGORY_ROTATION.length];
}

function mapLevel1ConfirmedDisplayRow(r: ScreeningResultRow): ScreeningTableDisplayRow {
  return {
    ...r,
    readOnlyHistory: true,
    ...(r.status === "Confirmed Safe" ? { displayStatus: "Confirmed Safe" as const } : {}),
  };
}

function mapLevel2ReviewedDisplayRow(r: ScreeningResultRow): ScreeningTableDisplayRow {
  return {
    ...r,
    readOnlyHistory: true,
    ...(r.status === "Safe" ? { displayStatus: "Confirmed Safe" as const } : {}),
  };
}

function buildLevel1DisplayRows(
  rows: ScreeningResultRow[],
  showReviewHistory: boolean,
): ScreeningTableDisplayRow[] {
  const active = rows.filter((r) => r.status === "New");
  if (!showReviewHistory) return active;
  const history = rows
    .filter((r) => r.status !== "New")
    .map((r): ScreeningTableDisplayRow => ({
      ...r,
      readOnlyHistory: true,
      ...(r.status === "Confirmed Safe" ? { displayStatus: "Confirmed Safe" as const } : {}),
    }));
  return [...active, ...history];
}

/** Level 1 "Sent to Level 2" case-list view — only rows that left L1 for L2 (never New). */
function buildLevel1SentToLevel2DisplayRows(
  rows: ScreeningResultRow[],
): ScreeningTableDisplayRow[] {
  return rows
    .filter((r) => isLevel1InProcessStatus(r.status) || isLevel2ReviewedRow(r))
    .map((r): ScreeningTableDisplayRow => {
      if (isLevel2ReviewedRow(r)) return mapLevel2ReviewedDisplayRow(r);
      return { ...r, readOnlyHistory: true };
    });
}

function buildLevel2DisplayRows(
  rows: ScreeningResultRow[],
  showReviewHistory: boolean,
  caseComplete: boolean,
  caseListSection: CaseListSectionContext = "todo",
): ScreeningTableDisplayRow[] {
  const mapHistoryRow = (r: ScreeningResultRow): ScreeningTableDisplayRow => {
    if (isLevel2ReviewedRow(r)) return mapLevel2ReviewedDisplayRow(r);
    if (isLevel1ConfirmedRow(r)) return mapLevel1ConfirmedDisplayRow(r);
    return { ...r, readOnlyHistory: true };
  };

  /** Level 2 never surfaces rows reopened as New on Level 1. */
  const l2Rows = rows.filter((r) => r.status !== "New");

  if (caseListSection === "done") {
    return l2Rows.filter((r) => isLevel2ReviewedRow(r)).map(mapHistoryRow);
  }

  if (caseComplete) {
    return l2Rows.map(mapHistoryRow);
  }

  const active = l2Rows.filter((r) => isLevel1InProcessStatus(r.status));
  if (!showReviewHistory) return active;

  const history = l2Rows
    .filter((r) => isLevel1ConfirmedRow(r) || isLevel2ReviewedRow(r))
    .map(mapHistoryRow);
  return [...active, ...history];
}

/** Case has screening results waiting in the Level 2 queue (L1 in-process). */
export function caseHasLevel2QueueWork(rows: ScreeningResultRow[]): boolean {
  return rows.some((r) => isLevel1InProcessStatus(r.status));
}

/** Case had Level 2 queue work and every in-process row has been cleared by L2. */
export function caseIsLevel2Done(rows: ScreeningResultRow[]): boolean {
  if (caseHasLevel2QueueWork(rows)) return false;
  return rows.some((r) => isLevel2ReviewedRow(r));
}

/** Any Level 2 queue activity on the case (in-process or L2-reviewed). */
export function caseHasLevel2Activity(rows: ScreeningResultRow[]): boolean {
  return rows.some((r) => isLevel1InProcessStatus(r.status) || isLevel2ReviewedRow(r));
}

/** True when the case work queue is cleared (L1: no "New"; L2: no L1 in-process rows). */
function ScreeningRowActionsMenu({
  row,
  onOpenDrilldown,
}: {
  row: ScreeningTableDisplayRow;
  onOpenDrilldown: (row: ScreeningTableDisplayRow, view: RowDrilldownView) => void;
  readOnly?: boolean;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${row.name}`}
          onClick={(e) => e.stopPropagation()}
          className={screeningRowActionsMenuTriggerClass}
        >
          <MaterialSymbol
            name="more_horiz"
            size="md"
            weight={300}
            className={caseActionsMenuIconClass}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        variant="compact"
        className={screeningRowActionsMenuContentClass}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          className={screeningRowActionsMenuItemClass}
          onSelect={() => onOpenDrilldown(row, "screening-history")}
        >
          Screening History
        </DropdownMenuItem>
        <DropdownMenuItem
          className={screeningRowActionsMenuItemClass}
          onSelect={() => onOpenDrilldown(row, "documents")}
        >
          Documents
        </DropdownMenuItem>
        <DropdownMenuItem
          className={screeningRowActionsMenuItemClass}
          onSelect={() => onOpenDrilldown(row, "match-simulator")}
        >
          Match Simulator
        </DropdownMenuItem>
        <DropdownMenuItem
          className={screeningRowActionsMenuItemClass}
          onSelect={() => onOpenDrilldown(row, "list-history")}
        >
          List History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function isCaseReviewComplete(
  rows: ScreeningResultRow[],
  flowVariant: "level-1" | "level-2" = "level-1",
): boolean {
  if (rows.length === 0) return false;
  if (flowVariant === "level-2") {
    return !caseHasLevel2QueueWork(rows);
  }
  return rows.every((r) => r.status !== "New");
}

/** True when every screening result for the case has been reviewed (no "New" rows). */
export function isCaseScreeningComplete(rows: ScreeningResultRow[]): boolean {
  return isCaseReviewComplete(rows, "level-1");
}

export function ScreeningResultsTable({
  rows = MOCK_ROWS,
  title = "Matches",
  flowVariant = "level-1",
  caseListSection = "todo",
  className,
  selectedIds: selectedIdsProp,
  onSelectedIdsChange,
  onQuickClearRow,
  readOnly = false,
}: ScreeningResultsTableProps) {
  const isLevel2 = flowVariant === "level-2";
  /** Empty set = no filter (show all). Otherwise rows must match one of the selected status labels. */
  const [statusFilters, setStatusFilters] = useState<Set<string>>(() => new Set());
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drilldownRow, setDrilldownRow] = useState<ScreeningTableDisplayRow | null>(null);
  const [drilldownView, setDrilldownView] = useState<RowDrilldownView | null>(null);
  const [drilldownVisible, setDrilldownVisible] = useState(false);
  const drilldownCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(() => new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(() => new Set());
  const isSelectionControlled =
    selectedIdsProp !== undefined && onSelectedIdsChange !== undefined;
  const selectedIds = isSelectionControlled ? selectedIdsProp : internalSelectedIds;
  const setSelectedIds = useCallback(
    (action: SetStateAction<Set<string>>) => {
      if (isSelectionControlled) {
        onSelectedIdsChange!(action);
      } else {
        setInternalSelectedIds(action);
      }
    },
    [isSelectionControlled, onSelectedIdsChange],
  );
  const [sectionCollapsed, setSectionCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Set<ScreeningColumnKey>>(
    () => new Set(DEFAULT_VISIBLE_SCREENING_COLUMNS),
  );
  const [columnOrder, setColumnOrder] = useState<ScreeningColumnKey[]>(
    () => [...DEFAULT_SCREENING_COLUMN_ORDER],
  );
  const [columnDropIndicator, setColumnDropIndicator] = useState<ColumnDropIndicator>(null);
  const [draggedColumnKey, setDraggedColumnKey] = useState<ScreeningColumnKey | null>(null);
  const [columnDropLineTop, setColumnDropLineTop] = useState<number | null>(null);
  const columnListRef = useRef<HTMLDivElement>(null);
  const columnItemRefs = useRef(new Map<ScreeningColumnKey, HTMLElement>());
  const [paginationMenuPortal, setPaginationMenuPortal] = useState<HTMLElement | null>(null);

  const registerColumnMenuItemRef = useCallback((key: ScreeningColumnKey, node: HTMLElement | null) => {
    if (node) columnItemRefs.current.set(key, node);
    else columnItemRefs.current.delete(key);
  }, []);

  useEffect(() => {
    setPaginationMenuPortal(document.body);
  }, []);

  const clearDrilldownCloseTimer = useCallback(() => {
    if (drilldownCloseTimerRef.current !== null) {
      clearTimeout(drilldownCloseTimerRef.current);
      drilldownCloseTimerRef.current = null;
    }
  }, []);

  const openRowDrilldown = useCallback(
    (row: ScreeningTableDisplayRow, view: RowDrilldownView) => {
      clearDrilldownCloseTimer();
      setDrilldownRow(row);
      setDrilldownView(view);
      requestAnimationFrame(() => setDrilldownVisible(true));
    },
    [clearDrilldownCloseTimer],
  );

  const closeRowDrilldown = useCallback(() => {
    clearDrilldownCloseTimer();
    setDrilldownVisible(false);
    drilldownCloseTimerRef.current = setTimeout(() => {
      drilldownCloseTimerRef.current = null;
      setDrilldownRow(null);
      setDrilldownView(null);
    }, LIST_PROFILE_ANIMATION_MS);
  }, [clearDrilldownCloseTimer]);

  const expandListProfileRow = useCallback((row: ScreeningTableDisplayRow) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      next.add(row.id);
      return next;
    });
  }, []);

  useEffect(() => () => clearDrilldownCloseTimer(), [clearDrilldownCloseTimer]);

  const isCaseComplete = useMemo(
    () => isCaseReviewComplete(rows, flowVariant),
    [rows, flowVariant],
  );

  /** Stable per case — row ids do not change when statuses update after review submit. */
  const caseRowIdsKey = useMemo(
    () => rows.map((r) => r.id).sort().join("\0"),
    [rows],
  );

  useEffect(() => {
    // Level 1 shows the "sent to Level 2" history by default (analyst can hide it);
    // Level 2 keeps history collapsed until requested.
    setShowReviewHistory(!isLevel2);
    setStatusFilters(new Set());
    setSearchQuery("");
    setPage(1);
    clearDrilldownCloseTimer();
    setDrilldownVisible(false);
    setDrilldownRow(null);
    setDrilldownView(null);
    setExpandedRowIds(new Set());
  }, [caseRowIdsKey, isLevel2, clearDrilldownCloseTimer]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilters]);

  const hasReviewHistory = useMemo(() => {
    if (isLevel2) {
      return rows.some((r) => isLevel1ConfirmedRow(r) || isLevel2ReviewedRow(r));
    }
    return rows.some((r) => r.status !== "New");
  }, [isLevel2, rows]);

  const level2ActiveRows = useMemo(
    () => (isLevel2 ? rows.filter((r) => isLevel1InProcessStatus(r.status)) : []),
    [isLevel2, rows],
  );

  /** Done cases always show full history; open cases use the toggle. */
  const viewingDoneCaseListSection = caseListSection === "done";
  const effectiveShowReviewHistory =
    isCaseComplete || showReviewHistory || viewingDoneCaseListSection;

  const baseRows = useMemo((): ScreeningTableDisplayRow[] => {
    if (isLevel2) {
      return buildLevel2DisplayRows(
        rows,
        effectiveShowReviewHistory,
        isCaseComplete,
        caseListSection,
      );
    }
    if (caseListSection === "done") {
      return buildLevel1SentToLevel2DisplayRows(rows);
    }
    return buildLevel1DisplayRows(rows, effectiveShowReviewHistory);
  }, [isLevel2, rows, effectiveShowReviewHistory, isCaseComplete, caseListSection]);

  const showReviewHistoryToggle = !isCaseComplete && !viewingDoneCaseListSection;

  // Chips = one per status label in the current table view. Multi-select: OR semantics. Empty selection = show all rows.
  const statusChips = useMemo(() => {
    const set = new Set<string>();
    baseRows.forEach((row) => set.add(tableStatusLabel(row)));
    const ordered = STATUS_FILTER_DISPLAY_ORDER.filter((status) => set.has(status));
    const extras = [...set].filter((status) => !STATUS_FILTER_DISPLAY_ORDER.includes(status)).sort();
    return [...ordered, ...extras];
  }, [baseRows]);

  const historyToggleDisabled = !hasReviewHistory;

  const columnMenuOptions = useMemo(() => {
    const available = new Set(
      SCREENING_COLUMN_DEFINITIONS.filter(
        (column) => column.key !== "reviewer" || (isLevel2 && isCaseComplete),
      ).map((column) => column.key),
    );
    return columnOrder
      .filter((key) => available.has(key))
      .map((key) => ({ key, label: SCREENING_COLUMN_LABELS[key] }));
  }, [columnOrder, isLevel2, isCaseComplete]);

  useLayoutEffect(() => {
    if (!columnDropIndicator || !draggedColumnKey || !columnListRef.current) {
      setColumnDropLineTop(null);
      return;
    }
    const item = columnItemRefs.current.get(columnDropIndicator.targetKey);
    if (!item) {
      setColumnDropLineTop(null);
      return;
    }
    const listTop = columnListRef.current.getBoundingClientRect().top;
    const itemRect = item.getBoundingClientRect();
    const relativeTop = itemRect.top - listTop;
    setColumnDropLineTop(
      columnDropIndicator.position === "before"
        ? relativeTop
        : relativeTop + itemRect.height,
    );
  }, [columnDropIndicator, draggedColumnKey, columnMenuOptions]);

  const toggleColumnVisibility = useCallback((key: ScreeningColumnKey, visible: boolean) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (visible) {
        next.add(key);
        return next;
      }
      if (next.size <= 1) return prev;
      next.delete(key);
      return next;
    });
  }, []);

  const reorderColumns = useCallback(
    (fromKey: ScreeningColumnKey, toKey: ScreeningColumnKey, position: "before" | "after") => {
      setColumnOrder((prev) => reorderScreeningColumnKeys(prev, fromKey, toKey, position));
    },
    [],
  );

  const showStatusFilter = statusChips.length > 1 || statusFilters.size > 0;

  const toggleStatusFilter = useCallback(
    (status: string) => {
      setStatusFilters((prev) => {
        const next = new Set(prev);
        if (next.has(status)) next.delete(status);
        else next.add(status);
        return next;
      });
      if (status === "New") return;
      if (isLevel2) {
        if (!isLevel1InProcessStatus(status)) {
          setShowReviewHistory(true);
        }
      } else {
        setShowReviewHistory(true);
      }
    },
    [isLevel2],
  );

  useEffect(() => {
    setStatusFilters((prev) => {
      const allowed = new Set<string>(statusChips);
      const next = new Set<string>();
      prev.forEach((status) => {
        if (allowed.has(status)) next.add(status);
      });
      if (next.size === prev.size && [...prev].every((status) => next.has(status))) {
        return prev;
      }
      return next;
    });
  }, [statusChips]);

  const filteredRows = useMemo(() => {
    if (statusFilters.size === 0) return baseRows;
    return baseRows.filter((row) => statusFilters.has(tableStatusLabel(row)));
  }, [baseRows, statusFilters]);

  const searchFilteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return filteredRows;
    return filteredRows.filter((row) => {
      const listSummary = getListProfileSummaryForRow(row);
      const haystack = [
        row.name,
        row.status,
        row.displayStatus ?? "",
        row.decisionReason ?? "",
        row.decisionReviewer ?? "",
        row.level1Reason ?? "",
        row.level1Reviewer ?? "",
        row.dob,
        row.matchAgeLabel,
        String(row.matchScore),
        listSummary.listCategory,
        listSummary.listId,
        listSummary.listProfileId,
        listSummary.country,
        ...row.matchTiles,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filteredRows, searchQuery]);

  const sortedRows = useMemo(() => {
    const list = [...searchFilteredRows];
    if (!sortKey) return list;
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "country":
          cmp = getListProfileSummaryForRow(a).country.localeCompare(
            getListProfileSummaryForRow(b).country,
          );
          break;
        case "dob":
          cmp = a.dob.localeCompare(b.dob);
          break;
        case "matchAge":
          cmp = parseAgeForSort(a.matchAgeLabel) - parseAgeForSort(b.matchAgeLabel);
          break;
        case "matchScore":
          cmp = a.matchScore - b.matchScore;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "reviewer":
          cmp = reviewerLabelForRow(a).localeCompare(reviewerLabelForRow(b));
          break;
        default:
          break;
      }
      return cmp * dir;
    });
    return list;
  }, [searchFilteredRows, sortKey, sortDir]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedRows.length / pageSize)),
    [sortedRows.length, pageSize],
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  const selectionRowsSignature = useMemo(
    () => sortedRows.map((r) => `${r.id}:${r.status}`).join(","),
    [sortedRows],
  );

  useEffect(() => {
    const allowActionable = new Set(
      sortedRows
        .filter((r) =>
          isLevel2
            ? !r.readOnlyHistory && isLevel1InProcessStatus(r.status)
            : r.status === "New",
        )
        .map((r) => r.id),
    );
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (allowActionable.has(id)) next.add(id);
      });
      return next;
    });
  }, [selectionRowsSignature, setSelectedIds, isLevel2]);

  const selectedRef = useRef(selectedIds);
  const filterRef = useRef(statusFilters);
  selectedRef.current = selectedIds;
  filterRef.current = statusFilters;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedRef.current.size > 0) {
        e.preventDefault();
        setSelectedIds(new Set());
        return;
      }
      if (filterRef.current.size > 0) {
        e.preventDefault();
        setStatusFilters(new Set());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const reviewedCount = useMemo(() => {
    if (isLevel2) {
      return rows.filter((r) => isLevel2ReviewedRow(r)).length;
    }
    return rows.filter((r) => r.status !== "New").length;
  }, [isLevel2, rows]);
  const totalCount = useMemo(() => {
    if (isLevel2) {
      return rows.filter(
        (r) => isLevel1InProcessStatus(r.status) || isLevel2ReviewedRow(r),
      ).length;
    }
    return rows.length;
  }, [isLevel2, rows]);
  const progress = totalCount === 0 ? 0 : (reviewedCount / totalCount) * 100;

  const selectionMode = selectedIds.size > 0;

  const actionableRows = useMemo(
    () =>
      readOnly
        ? []
        : sortedRows.filter((r) =>
            isLevel2 ? !r.readOnlyHistory && isLevel1InProcessStatus(r.status) : r.status === "New",
          ),
    [sortedRows, isLevel2, readOnly],
  );

  const allVisibleSelected =
    actionableRows.length > 0 && actionableRows.every((r) => selectedIds.has(r.id));
  const someVisibleSelected = actionableRows.some((r) => selectedIds.has(r.id));

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const onHeaderSelectAllChange = (value: boolean | "indeterminate") => {
    if (actionableRows.length === 0) return;
    if (value === true) {
      setSelectedIds(new Set(actionableRows.map((r) => r.id)));
      return;
    }
    if (value === false) {
      setSelectedIds(new Set());
    }
  };

  const toggleRowSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const headerCheckboxState: boolean | "indeterminate" =
    someVisibleSelected && !allVisibleSelected ? "indeterminate" : allVisibleSelected;

  const screeningColumns: FinScanTableColumn<ScreeningTableDisplayRow>[] = useMemo(() => {
    const secondaryTextClass = "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap";
    const emptySecondary = <span className="text-[#949baa] dark:text-[#6a7285]">—</span>;

    const byKey: Record<ScreeningColumnKey, FinScanTableColumn<ScreeningTableDisplayRow>> = {
      status: {
        key: "status",
        label: "Status",
        sortKey: "status",
        headerClassName: "whitespace-nowrap",
        cellClassName: "whitespace-nowrap align-middle",
        render: (row) => {
          if (row.displayStatus === "Confirmed Safe") {
            return <ScreeningStatusBadge status="Confirmed Safe" />;
          }
          if (row.displayStatus === "Safe") {
            return <ScreeningStatusBadge status="Safe" />;
          }
          if (isRemediatedActiveRow(row)) {
            return <ScreeningStatusBadge status="Remediate" />;
          }
          return <ScreeningStatusBadge status={row.status} />;
        },
      },
      name: {
        key: "name",
        label: "Name",
        sortKey: "name",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#23262c] dark:text-[#b6c2cf] whitespace-nowrap",
        render: (row) => row.name,
      },
      clientName: {
        key: "clientName",
        label: "Client Name",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => getClientRecordForRow(row).name,
      },
      country: {
        key: "country",
        label: "Country",
        sortKey: "country",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => getListProfileSummaryForRow(row).country,
      },
      clientCountry: {
        key: "clientCountry",
        label: "Client Country",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => getClientRecordForRow(row).countryLabel,
      },
      dob: {
        key: "dob",
        label: "Date of Birth",
        sortKey: "dob",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => (isOrganizationRow(row) ? emptySecondary : row.dob),
      },
      clientDob: {
        key: "clientDob",
        label: "Client DOB",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) =>
          isOrganizationRow(row) ? emptySecondary : getClientRecordForRow(row).dob ?? emptySecondary,
      },
      matchAge: {
        key: "matchAge",
        label: "Match Age",
        sortKey: "matchAge",
        headerClassName: "whitespace-nowrap",
        cellClassName: "whitespace-nowrap",
        render: (row) => (
          <span className="inline-flex items-center gap-2 text-[#464c59] dark:text-[#9fadbc]">
            {showMatchAgeStaleIndicator(row.matchAgeTone) ? (
              <span className="size-2 shrink-0 rounded-full bg-[#c62828]" aria-hidden />
            ) : null}
            {row.matchAgeLabel}
          </span>
        ),
      },
      matchScore: {
        key: "matchScore",
        label: "Match Score",
        sortKey: "matchScore",
        headerClassName: "whitespace-nowrap",
        cellClassName:
          "font-['Noto_Sans:SemiBold',sans-serif] font-semibold tabular-nums whitespace-nowrap",
        render: (row) => (
          <span
            className={cn(
              isDisabledScreeningRow(row, flowVariant)
                ? screeningDisabledTextClass
                : scoreIsHighRisk(row.matchScore)
                  ? "text-[#c62828] dark:text-[#f48a8a]"
                  : "text-[#23262c] dark:text-[#b6c2cf]",
            )}
          >
            {row.matchScore}
          </span>
        ),
      },
      listId: {
        key: "listId",
        label: "List ID",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => getListProfileSummaryForRow(row).listId,
      },
      listCategory: {
        key: "listCategory",
        label: "List Category",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => getListProfileSummaryForRow(row).listCategory,
      },
      listProfileId: {
        key: "listProfileId",
        label: "List Profile ID",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc] tabular-nums whitespace-nowrap",
        render: (row) => getListProfileSummaryForRow(row).listProfileId,
      },
      reviewer: {
        key: "reviewer",
        label: "Reviewer",
        sortKey: "reviewer",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => {
          const reviewer = reviewerLabelForRow(row);
          if (!reviewer) return emptySecondary;
          return reviewer;
        },
      },
      comments: {
        key: "comments",
        label: "Comments",
        headerClassName: "whitespace-nowrap",
        cellClassName: "max-w-[14rem] truncate text-[#464c59] dark:text-[#9fadbc]",
        render: (row) => {
          const comment = commentLabelForRow(row);
          if (!comment) return emptySecondary;
          return comment;
        },
      },
      matchString: {
        key: "matchString",
        label: "Match String",
        headerClassName: "whitespace-nowrap",
        cellClassName: "whitespace-nowrap",
        render: (row) => <MatchStringTiles tiles={row.matchTiles} />,
      },
      reason: {
        key: "reason",
        label: "Reason",
        headerClassName: "whitespace-nowrap",
        cellClassName: "max-w-[12rem] truncate text-[#464c59] dark:text-[#9fadbc]",
        render: (row) => {
          const reason = reasonLabelForRow(row);
          if (!reason) return emptySecondary;
          return reason;
        },
      },
      matchedNameType: {
        key: "matchedNameType",
        label: "Matched Name Type",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => matchedNameTypeForRow(row),
      },
      finscanCategory: {
        key: "finscanCategory",
        label: "FinScan Category",
        headerClassName: "whitespace-nowrap",
        cellClassName: secondaryTextClass,
        render: (row) => finscanCategoryForRow(row),
      },
    };

    return columnOrder
      .filter((key) => key !== "reviewer" || (isLevel2 && isCaseComplete))
      .filter((key) => visibleColumns.has(key))
      .map((key) => byKey[key]);
  }, [isLevel2, isCaseComplete, flowVariant, visibleColumns, columnOrder]);

  const screeningEmptyState = (
    <>
      <p className="m-0 mb-3 font-['Noto_Sans:Regular',sans-serif] text-[14px] text-[#464c59] dark:text-[#9fadbc]" style={notoVar}>
        {rows.length === 0
          ? "No screening results to display."
          : searchQuery.trim()
            ? "No results match your search."
            : isLevel2 &&
                level2ActiveRows.length === 0 &&
                !effectiveShowReviewHistory &&
                hasReviewHistory
              ? "No results awaiting Level 2 review. Show review history to see Level 1 decisions."
              : isLevel2 &&
                  level2ActiveRows.length === 0 &&
                  !hasReviewHistory
                ? "No results awaiting Level 2 review. Level 1 must move matches out of New before they appear here."
              : !isLevel2 && rows.some((r) => r.status !== "New") && !effectiveShowReviewHistory
                ? "All screening results have been reviewed. Show review history to see completed items."
                : statusFilters.size > 0
                ? "No results match the current filter."
                : "No results to display."}
      </p>
      {searchQuery.trim() && rows.length > 0 ? (
        <button
          type="button"
          className="rounded px-1 font-['Noto_Sans:SemiBold',sans-serif] text-[14px] text-[#523eb9] underline underline-offset-2 decoration-[#523eb9]/40 transition-colors duration-200 ease-out hover:decoration-[#523eb9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35"
          style={notoVar}
          onClick={() => setSearchQuery("")}
        >
          Clear search
        </button>
      ) : statusFilters.size > 0 && rows.length > 0 ? (
        <button
          type="button"
          className="rounded px-1 font-['Noto_Sans:SemiBold',sans-serif] text-[14px] text-[#523eb9] underline underline-offset-2 decoration-[#523eb9]/40 transition-colors duration-200 ease-out hover:decoration-[#523eb9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35"
          style={notoVar}
          onClick={() => setStatusFilters(new Set())}
        >
          Clear filter
        </button>
      ) : null}
    </>
  );

  const tableHeaderTrailing = (
    <div className="flex shrink-0 items-center gap-3" onClick={(e) => e.stopPropagation()}>
      {isCaseComplete ? (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e8f4ea] dark:bg-[#2a302c]"
            aria-hidden
          >
            <MaterialSymbol name="check" size="sm" className="text-[#87b531]" />
          </span>
          <span
            className={cn(
              aceTypography(ACE_TYPE.p1SemiBold),
              "whitespace-nowrap text-[#2d6a3e] dark:text-[#87b531]",
            )}
            style={notoVar}
          >
            Review complete
          </span>
        </div>
      ) : (
        <>
          <span
            className={cn(
              aceTypography(ACE_TYPE.p1Regular),
              "hidden whitespace-nowrap text-sm text-[var(--screening-text-secondary)] sm:inline",
            )}
          >
            {reviewedCount} of {totalCount} Reviewed
          </span>
          <div
            className="h-[var(--screening-progress-height)] w-[var(--screening-progress-width)] overflow-hidden rounded-full border border-[var(--screening-border-soft)] bg-[var(--screening-progress-track)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-valuenow={reviewedCount}
            aria-label={`Review progress: ${reviewedCount} of ${totalCount} reviewed`}
          >
            <div
              className="h-full rounded-full bg-[var(--screening-progress-fill)] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}
    </div>
  );

  const screeningAccordionOpen = !sectionCollapsed;

  return (
    <AceAccordion
      className={cn(
        "flex w-full flex-col border-[var(--screening-border-strong)]",
        screeningAccordionOpen ? "min-h-0 flex-initial" : "shrink-0",
        aceAccordionFixedHeaderClass,
        aceDropShadowXsClass,
        screeningAccordionOpen && aceAccordionPanelFillClass,
        className,
      )}
      surface="white"
      dropShadow
      showTag={false}
      showAddIcon={false}
      showDeleteIcon={false}
      showEditIcon={false}
      showMoreIcon={false}
      open={screeningAccordionOpen}
      onOpenChange={(next) => setSectionCollapsed(!next)}
      title={title}
      titleClassName={cn(
        aceTypography(ACE_TYPE.h6SmallSemiBold),
        "truncate leading-[1.5] text-[var(--screening-text-primary)]",
      )}
      headerTrailing={tableHeaderTrailing}
      contentPadding={false}
    >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
              <div
                className={cn(
                  "flex min-h-0 w-[500%] shrink-0 transition-transform will-change-transform",
                  durationAccordion,
                  easeAccordion,
                  !drilldownVisible
                    ? "translate-x-0"
                    : drilldownView
                      ? ROW_DRILLDOWN_TRANSLATE[drilldownView]
                      : "translate-x-0",
                )}
              >
                <div
                  className="flex min-h-0 w-1/5 min-w-0 flex-col overflow-hidden self-stretch"
                  aria-hidden={drilldownVisible}
                >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="shrink-0 border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3">
              <div className="flex flex-nowrap items-center justify-between gap-3">
                {showStatusFilter ? (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <span className={screeningStatusFilterLabelClass}>Filter by</span>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {statusChips.map((st) => (
                        <AceFilterToggleChip
                          key={st}
                          label={st}
                          pressed={statusFilters.has(st)}
                          onClick={() => toggleStatusFilter(st)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1" aria-hidden />
                )}
                <div className="flex shrink-0 flex-nowrap items-center gap-3">
                  <DropdownMenu
                    onOpenChange={(open) => {
                      if (!open) {
                        setColumnDropIndicator(null);
                        setDraggedColumnKey(null);
                        setColumnDropLineTop(null);
                      }
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Show or hide columns"
                            className={screeningToolbarIconButtonClass}
                          >
                            <MaterialSymbol name="view_list" size="md" weight={300} />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        hideArrow
                        className={cn(
                          aceTypography(ACE_TYPE.captionSemiBold),
                          "border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-[var(--ace-drop-shadow-xs)]",
                        )}
                      >
                        Columns
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[15rem]"
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                          setColumnDropIndicator(null);
                          setColumnDropLineTop(null);
                        }
                      }}
                    >
                      <DropdownMenuLabel>Columns</DropdownMenuLabel>
                      <div ref={columnListRef} className="relative">
                        {columnDropLineTop !== null ? (
                          <span
                            aria-hidden
                            className={cn(
                              screeningColumnDropLineClass,
                              draggedColumnKey ? "scale-x-100 opacity-100" : "scale-x-[0.98] opacity-0",
                            )}
                            style={{ top: columnDropLineTop }}
                          />
                        ) : null}
                        {columnMenuOptions.map((column) => (
                          <ScreeningColumnReorderMenuItem
                            key={column.key}
                            columnKey={column.key}
                            label={column.label}
                            checked={visibleColumns.has(column.key)}
                            disabled={visibleColumns.has(column.key) && visibleColumns.size <= 1}
                            draggedColumnKey={draggedColumnKey}
                            dropIndicator={columnDropIndicator}
                            onCheckedChange={(checked) => toggleColumnVisibility(column.key, checked)}
                            onReorder={reorderColumns}
                            onDropIndicatorChange={setColumnDropIndicator}
                            onDraggedColumnKeyChange={setDraggedColumnKey}
                            onItemRef={registerColumnMenuItemRef}
                          />
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {showReviewHistoryToggle ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <button
                            type="button"
                            disabled={historyToggleDisabled}
                            aria-expanded={showReviewHistory}
                            aria-label={
                              historyToggleDisabled
                                ? "There is no history to show"
                                : showReviewHistory
                                  ? "Hide"
                                  : "Show"
                            }
                            onClick={() => setShowReviewHistory((o) => !o)}
                            className={cn(
                              screeningToolbarIconButtonClass,
                              historyToggleDisabled &&
                                "cursor-not-allowed border-[#cfd2d9] bg-[#f5f6f8] text-[#949baa] opacity-60 dark:border-[#38414a] dark:bg-[#2c333a] dark:text-[#6a7285]",
                            )}
                          >
                            {showReviewHistory && !historyToggleDisabled ? (
                              <MaterialSymbol name="visibility_off" size="md" weight={300} />
                            ) : (
                              <MaterialSymbol name="visibility" size="md" weight={300} />
                            )}
                          </button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        hideArrow
                        className={cn(
                          aceTypography(ACE_TYPE.captionSemiBold),
                          "border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-[var(--ace-drop-shadow-xs)]",
                        )}
                      >
                        {historyToggleDisabled
                          ? "There is no history to show."
                          : showReviewHistory
                            ? "Hide"
                            : "Show"}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  <AceInputField
                    fieldSize="sm"
                    icon="left"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search screening results"
                    className="w-[12rem] shrink-0 bg-[var(--screening-surface)]"
                  />
                </div>
              </div>
            </div>
            <ExpandableFinScanTable
              rows={paginatedRows}
              columns={screeningColumns}
              caption={`${title}, ${sortedRows.length} ${sortedRows.length === 1 ? "row" : "rows"}${statusFilters.size > 0 ? `, filtered by ${[...statusFilters].sort((a, b) => a.localeCompare(b)).join(", ")}` : ""}`}
              className="shrink-0"
              scrollY={false}
              tableLayout="auto"
              minWidth="min-w-full"
              expandable
              showExpandAll
              expandedIds={expandedRowIds}
              onExpandedIdsChange={setExpandedRowIds}
              expandTooltips={{
                expandRow: { open: "Open List Profile", close: "Close List Profile" },
                expandAll: { show: "Show All", hide: "Hide All" },
              }}
              expandedContentClassName="bg-[var(--screening-surface-muted)]"
              renderExpandedContent={(row) => (
                <ListProfileInlineContent
                  row={row}
                  className="ml-10 border-l-2 border-[#523eb9]/25 pl-6"
                />
              )}
              sort={{
                sortKey,
                sortDir,
                onToggleSort: (key) => toggleSort(key as SortKey),
              }}
              selection={{
                selectedIds,
                isSelectable: (row) =>
                  readOnly
                    ? false
                    : isLevel2
                      ? !row.readOnlyHistory && isLevel1InProcessStatus(row.status)
                      : row.status === "New",
                onToggleRow: toggleRowSelect,
                onHeaderSelectAll: onHeaderSelectAllChange,
                headerCheckboxState,
                actionableCount: actionableRows.length,
              }}
              trailingColumn={{
                render: (row) => (
                  <ScreeningRowActionsMenu
                    row={row}
                    onOpenDrilldown={openRowDrilldown}
                    readOnly={readOnly}
                  />
                ),
              }}
              getRowClassName={(row) => {
                const rowDone = isDisabledScreeningRow(row, flowVariant, readOnly);
                const selected = selectedIds.has(row.id);
                return cn(
                  rowDone && screeningDisabledRowClass,
                  !rowDone &&
                    "bg-white dark:bg-[#22272b] hover:bg-[#f3f4f6] dark:hover:bg-[#2c333a] hover:shadow-[inset_2px_0_0_0_rgba(82,62,185,0.2)]",
                  selected && !rowDone && "bg-[#f4f1fc]/60 dark:bg-[#38414a]/45",
                );
              }}
              emptyState={sortedRows.length === 0 ? screeningEmptyState : undefined}
            />
            <div className="shrink-0 border-t border-[var(--screening-border-strong)] bg-white dark:bg-[#22272b] px-4 py-3">
              <AcePagination
                totalItems={sortedRows.length}
                page={page}
                pageSize={pageSize}
                portalContainer={paginationMenuPortal}
                onPageChange={setPage}
                onPageSizeChange={(nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPage(1);
                }}
              />
            </div>
            </div>
                </div>
                <div
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={!drilldownVisible || drilldownView !== "screening-history"}
                >
                  {drilldownRow && drilldownView === "screening-history" ? (
                    <ScreeningHistoryPanel row={drilldownRow} onBack={closeRowDrilldown} />
                  ) : null}
                </div>
                <div
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={!drilldownVisible || drilldownView !== "documents"}
                >
                  {drilldownRow && drilldownView === "documents" ? (
                    <DocumentsPanel row={drilldownRow} onBack={closeRowDrilldown} />
                  ) : null}
                </div>
                <div
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={!drilldownVisible || drilldownView !== "match-simulator"}
                >
                  {drilldownRow && drilldownView === "match-simulator" ? (
                    <MatchSimulatorPanel row={drilldownRow} onBack={closeRowDrilldown} />
                  ) : null}
                </div>
                <div
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={!drilldownVisible || drilldownView !== "list-history"}
                >
                  {drilldownRow && drilldownView === "list-history" ? (
                    <ListHistoryPanel row={drilldownRow} onBack={closeRowDrilldown} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
    </AceAccordion>
  );
}
