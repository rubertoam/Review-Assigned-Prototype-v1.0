import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Check, Eye, EyeOff, MoreVertical } from "lucide-react";
import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { aceAccordionFixedHeaderClass } from "../lib/aceAccordion";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
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
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getListProfileSummaryForRow } from "../lib/listProfileData";
import {
  caseActionsMenuIconClass,
  screeningRowActionsMenuContentClass,
  screeningRowActionsMenuItemClass,
  screeningRowActionsMenuTriggerClass,
} from "../lib/caseActionsMenuStyles";
import { ListProfilePanel } from "./ListProfilePanel";
import { MatchSimulatorPanel } from "./MatchSimulatorPanel";
import { ScreeningDrilldownPlaceholderPanel } from "./ScreeningDrilldownPlaceholderPanel";

export { easeAccordion, durationAccordion } from "./ExpandableFinScanTable";

const LIST_PROFILE_ANIMATION_MS = 420;

const ROW_DRILLDOWN_VIEWS = [
  "screening-history",
  "documents",
  "list-profile",
  "match-simulator",
] as const;

type RowDrilldownView = (typeof ROW_DRILLDOWN_VIEWS)[number];

const ROW_DRILLDOWN_TRANSLATE: Record<RowDrilldownView, string> = {
  "screening-history": "-translate-x-[20%]",
  documents: "-translate-x-[40%]",
  "list-profile": "-translate-x-[60%]",
  "match-simulator": "-translate-x-[80%]",
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
): boolean {
  if (flowVariant === "level-2") return row.readOnlyHistory === true;
  return row.status !== "New";
}

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

function dobForCase(caseIndex: number): string {
  const dobs = ["03/23/1978", "04/11/1985", "06/07/1942", "09/14/1992", "—", "—"];
  return dobs[Math.min(caseIndex, dobs.length - 1)];
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
    rows.push({
      id: `c${ci}-${i + 1}`,
      name,
      dob: dobForCase(ci),
      matchAgeLabel: AGE_LABELS[i % AGE_LABELS.length],
      matchAgeTone: TONE_ROTATION[i % TONE_ROTATION.length],
      matchScore: score,
      matchTiles: [...tiles],
      status: "New",
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
  return row.status;
}

const STATUS_FILTER_DISPLAY_ORDER: readonly string[] = [
  ...LEVEL1_STATUS_DISPLAY_ORDER,
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
  /** Optional root classes (e.g. `w-full`). Table body scroll is internal to the component; avoid `flex-1` on the root so the closed accordion does not stretch. */
  className?: string;
  /** When both are passed, row selection is controlled by the parent (e.g. task bar). */
  selectedIds?: Set<string>;
  onSelectedIdsChange?: Dispatch<SetStateAction<Set<string>>>;
}

const statusPillShellClass =
  "inline-flex w-fit max-w-none shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-1.5 pr-2 py-1 transition-colors duration-200 ease-out";

const statusPillLabelClass =
  "shrink-0 whitespace-nowrap font-['Noto_Sans:SemiBold',sans-serif] text-[11px] leading-none sm:text-[12px]";

function safeStatusPill(label = "Safe") {
  return (
    <span
      className={cn(
        statusPillShellClass,
        "border border-[#a5d6a7] bg-[#e8f4ea]",
      )}
    >
      <span className="size-2 shrink-0 rounded-full bg-[#2e7d32]" />
      <span className={cn(statusPillLabelClass, "text-[#2d6a3e]")} style={notoVar}>
        {label}
      </span>
    </span>
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

const STATUS_PILL_STYLES: Record<
  string,
  { border: string; bg: string; dot: string; text: string }
> = {
  New: {
    border: "border-[var(--screening-pill-new-border)]",
    bg: "bg-[var(--screening-pill-new-surface)]",
    dot: "bg-[#523eb9]",
    text: "text-[var(--screening-pill-new-label)]",
  },
  "Confirmed Safe": {
    border: "border-[#a5d6a7]",
    bg: "bg-[#e8f4ea]",
    dot: "bg-[#2e7d32]",
    text: "text-[#2d6a3e]",
  },
  Escalate: {
    border: "border-[#ffcc80]",
    bg: "bg-[#fff4e8]",
    dot: "bg-[#ef6c00]",
    text: "text-[#e65100]",
  },
  "Flag for EDD": {
    border: "border-[#ffe082]",
    bg: "bg-[#fff8e1]",
    dot: "bg-[#f9a825]",
    text: "text-[#f57f17]",
  },
  "Research (Internal)": {
    border: "border-[#90caf9]",
    bg: "bg-[#e3f2fd]",
    dot: "bg-[#1976d2]",
    text: "text-[#1565c0]",
  },
  "Research (External)": {
    border: "border-[#80cbc4]",
    bg: "bg-[#e0f2f1]",
    dot: "bg-[#00897b]",
    text: "text-[#00695c]",
  },
  "Route to Supervisor": {
    border: "border-[#ce93d8]",
    bg: "bg-[#f3e5f5]",
    dot: "bg-[#8e24aa]",
    text: "text-[#6a1b9a]",
  },
  Safe: {
    border: "border-[#a5d6a7]",
    bg: "bg-[#e8f4ea]",
    dot: "bg-[#2e7d32]",
    text: "text-[#2d6a3e]",
  },
  "False Positive": {
    border: "border-[#cfd2d9]",
    bg: "bg-[#f5f6f8]",
    dot: "bg-[#6a7285]",
    text: "text-[#464c59]",
  },
};

function statusPill(status: ScreeningRowStatus) {
  if (status === "New") {
    return (
      <span className={cn(statusPillShellClass, screeningNewPillSurfaceClass)}>
        <span className="size-2 shrink-0 rounded-full bg-[#523eb9]" />
        <span className={cn(statusPillLabelClass, screeningNewPillLabelClass)} style={notoVar}>
          New
        </span>
      </span>
    );
  }
  const style = STATUS_PILL_STYLES[status] ?? STATUS_PILL_STYLES.Escalate;
  return (
    <span
      className={cn(
        statusPillShellClass,
        "border",
        style.border,
        style.bg,
      )}
      title={status}
    >
      <span className={cn("size-2 shrink-0 rounded-full", style.dot)} />
      <span className={cn(statusPillLabelClass, style.text)} style={notoVar}>
        {status}
      </span>
    </span>
  );
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

function buildLevel2DisplayRows(
  rows: ScreeningResultRow[],
  showReviewHistory: boolean,
  caseComplete: boolean,
): ScreeningTableDisplayRow[] {
  const mapHistoryRow = (r: ScreeningResultRow): ScreeningTableDisplayRow => {
    if (isLevel2ReviewedRow(r)) return mapLevel2ReviewedDisplayRow(r);
    if (isLevel1ConfirmedRow(r)) return mapLevel1ConfirmedDisplayRow(r);
    return { ...r, readOnlyHistory: true };
  };

  if (caseComplete) {
    return rows
      .filter((r) => r.status !== "New")
      .map(mapHistoryRow);
  }

  const active = rows.filter((r) => isLevel1InProcessStatus(r.status));
  if (!showReviewHistory) return active;

  const history = rows
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
          <MoreVertical className={caseActionsMenuIconClass} strokeWidth={2} aria-hidden />
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
          onSelect={() => onOpenDrilldown(row, "list-profile")}
        >
          List Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className={screeningRowActionsMenuItemClass}
          onSelect={() => onOpenDrilldown(row, "match-simulator")}
        >
          Match Simulator
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
  title = "Screening Results",
  flowVariant = "level-1",
  className,
  selectedIds: selectedIdsProp,
  onSelectedIdsChange,
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
    setShowReviewHistory(false);
    setStatusFilters(new Set());
    setSearchQuery("");
    clearDrilldownCloseTimer();
    setDrilldownVisible(false);
    setDrilldownRow(null);
    setDrilldownView(null);
  }, [caseRowIdsKey, clearDrilldownCloseTimer]);

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
  const effectiveShowReviewHistory = isCaseComplete || showReviewHistory;

  const baseRows = useMemo((): ScreeningTableDisplayRow[] => {
    if (isLevel2) return buildLevel2DisplayRows(rows, effectiveShowReviewHistory, isCaseComplete);
    return buildLevel1DisplayRows(rows, effectiveShowReviewHistory);
  }, [isLevel2, rows, effectiveShowReviewHistory, isCaseComplete]);

  const showReviewHistoryToggle = !isCaseComplete;

  // Chips = one per status label in the current table view. Multi-select: OR semantics. Empty selection = show all rows.
  const statusChips = useMemo(() => {
    const set = new Set<string>();
    baseRows.forEach((row) => set.add(tableStatusLabel(row)));
    const ordered = STATUS_FILTER_DISPLAY_ORDER.filter((status) => set.has(status));
    const extras = [...set].filter((status) => !STATUS_FILTER_DISPLAY_ORDER.includes(status)).sort();
    return [...ordered, ...extras];
  }, [baseRows]);

  const historyToggleDisabled = !hasReviewHistory && !showReviewHistory;

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
      sortedRows.filter((r) =>
        isLevel2 ? !r.readOnlyHistory && isLevel1InProcessStatus(r.status) : r.status === "New",
      ),
    [sortedRows, isLevel2],
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

  const level2ReviewerColumn: FinScanTableColumn<ScreeningTableDisplayRow> = useMemo(
    () => ({
      key: "reviewer",
      label: "Reviewer",
      sortKey: "reviewer",
      headerClassName: "whitespace-nowrap",
      cellClassName: "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
      render: (row) => {
        const reviewer = reviewerLabelForRow(row);
        if (!reviewer) {
          return <span className="text-[#949baa] dark:text-[#6a7285]">—</span>;
        }
        return reviewer;
      },
    }),
    [],
  );

  const screeningColumns: FinScanTableColumn<ScreeningTableDisplayRow>[] = useMemo(
    () => {
      const statusColumn: FinScanTableColumn<ScreeningTableDisplayRow> = {
        key: "status",
        label: "Status",
        sortKey: "status",
        headerClassName: "whitespace-nowrap",
        cellClassName: "whitespace-nowrap align-middle",
        render: (row) => {
          if (row.displayStatus === "Confirmed Safe") return safeStatusPill("Confirmed Safe");
          if (row.displayStatus === "Safe") return safeStatusPill();
          return statusPill(row.status);
        },
      };
      const tailColumns: FinScanTableColumn<ScreeningTableDisplayRow>[] = [
      {
        key: "name",
        label: "Name",
        sortKey: "name",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#23262c] dark:text-[#b6c2cf] whitespace-nowrap",
        render: (row) => row.name,
      },
      {
        key: "country",
        label: "Country",
        sortKey: "country",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
        render: (row) => getListProfileSummaryForRow(row).country,
      },
      {
        key: "dob",
        label: "Date of Birth",
        sortKey: "dob",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
        render: (row) => row.dob,
      },
      {
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
      {
        key: "matchScore",
        label: "Match Score",
        sortKey: "matchScore",
        headerClassName: "whitespace-nowrap",
        cellClassName: "font-['Noto_Sans:SemiBold',sans-serif] font-semibold tabular-nums whitespace-nowrap",
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
      {
        key: "listId",
        label: "List ID",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
        render: (row) => getListProfileSummaryForRow(row).listId,
      },
      {
        key: "listCategory",
        label: "List Category",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
        render: (row) => getListProfileSummaryForRow(row).listCategory,
      },
      {
        key: "listProfileId",
        label: "List Profile ID",
        headerClassName: "whitespace-nowrap",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc] tabular-nums whitespace-nowrap",
        render: (row) => getListProfileSummaryForRow(row).listProfileId,
      },
    ];

      if (isLevel2 && isCaseComplete) {
        return [statusColumn, ...tailColumns, level2ReviewerColumn];
      }
      return [statusColumn, ...tailColumns];
    },
    [isLevel2, isCaseComplete, flowVariant, level2ReviewerColumn],
  );

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
            <Check className="size-3 stroke-[3] text-[#87b531]" />
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

  return (
    <AceAccordion
      className={cn(
        "flex w-full shrink-0 flex-col border-[var(--screening-border-strong)]",
        aceAccordionFixedHeaderClass,
        aceDropShadowXsClass,
        className,
      )}
      surface="white"
      dropShadow
      showTag={false}
      showAddIcon={false}
      showDeleteIcon={false}
      showEditIcon={false}
      showMoreIcon={false}
      open={!sectionCollapsed}
      onOpenChange={(next) => setSectionCollapsed(!next)}
      title={title}
      titleClassName={cn(
        aceTypography(ACE_TYPE.h6SmallSemiBold),
        "truncate leading-[1.5] text-[var(--screening-text-primary)]",
      )}
      headerTrailing={tableHeaderTrailing}
      contentPadding={false}
    >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-h-[calc(100dvh-14rem)]">
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
              <div
                className={cn(
                  "flex h-full w-[500%] shrink-0 transition-transform will-change-transform",
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
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={drilldownVisible}
                >
            <div className="shrink-0 border-b border-[#cfd2d9] dark:border-[#38414a] bg-[#fafafb] dark:bg-[#1d2125] px-4 py-3">
              <div className="flex flex-nowrap items-center justify-between gap-3">
                {showStatusFilter ? (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <span
                      className="font-['Noto_Sans:SemiBold',sans-serif] text-[14px] text-[#23262c] dark:text-[#b6c2cf] shrink-0"
                      style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                    >
                      Filter by
                    </span>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {statusChips.map((st) => {
                        const active = statusFilters.has(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => toggleStatusFilter(st)}
                            className={cn(
                              "inline-flex w-fit shrink-0 cursor-pointer whitespace-nowrap rounded-[4px] px-3.5 py-1.5 text-[13px] font-['Noto_Sans:SemiBold',sans-serif] font-semibold transition-all duration-200 ease-out border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#22272b]",
                              active
                                ? "bg-[#efeef9] border-[#523eb9] text-[#523eb9] hover:bg-[#e4dff3] hover:border-[#4334a3] dark:bg-[#2a2540] dark:border-[#7c6bc4] dark:text-[#dcd7e8] dark:hover:bg-[#352f4d] dark:hover:border-[#9b8ed4]"
                                : "bg-white dark:bg-[#22272b] border-[#cfd2d9] dark:border-[#38414a] text-[#23262c] dark:text-[#b6c2cf] hover:border-[#949baa] hover:bg-[#f5f6f8] dark:hover:border-[#5c6773] dark:hover:bg-[#2c333a]",
                            )}
                            style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1" aria-hidden />
                )}
                <div className="flex shrink-0 flex-nowrap items-center gap-3">
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
                              "inline-flex size-8 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#22272b]",
                              historyToggleDisabled
                                ? "cursor-not-allowed border-[#cfd2d9] bg-[#f5f6f8] text-[#949baa] opacity-60 dark:border-[#38414a] dark:bg-[#2c333a] dark:text-[#6a7285]"
                                : "cursor-pointer border-[#cfd2d9] bg-white text-[#464c59] hover:border-[#949baa] hover:bg-[#eff0f2] hover:text-[#23262c] dark:border-[#38414a] dark:bg-[#22272b] dark:text-[#9fadbc] dark:hover:border-[#5c6773] dark:hover:bg-[#2c333a] dark:hover:text-[#b6c2cf]",
                            )}
                          >
                            {showReviewHistory ? (
                              <EyeOff className="size-4" strokeWidth={2} aria-hidden />
                            ) : (
                              <Eye className="size-4" strokeWidth={2} aria-hidden />
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
                    className="w-[12rem] shrink-0"
                  />
                </div>
              </div>
            </div>
            <ExpandableFinScanTable
              rows={sortedRows}
              columns={screeningColumns}
              caption={`${title}, ${sortedRows.length} ${sortedRows.length === 1 ? "row" : "rows"}${statusFilters.size > 0 ? `, filtered by ${[...statusFilters].sort((a, b) => a.localeCompare(b)).join(", ")}` : ""}`}
              className="min-h-0 min-w-0 flex-1"
              tableLayout="auto"
              minWidth="min-w-full"
              expandable={false}
              showExpandAll={false}
              sort={{
                sortKey,
                sortDir,
                onToggleSort: (key) => toggleSort(key as SortKey),
              }}
              selection={{
                selectedIds,
                isSelectable: (row) =>
                  isLevel2
                    ? !row.readOnlyHistory && isLevel1InProcessStatus(row.status)
                    : row.status === "New",
                onToggleRow: toggleRowSelect,
                onHeaderSelectAll: onHeaderSelectAllChange,
                headerCheckboxState,
                actionableCount: actionableRows.length,
              }}
              trailingColumn={{
                render: (row) => (
                  <ScreeningRowActionsMenu row={row} onOpenDrilldown={openRowDrilldown} />
                ),
              }}
              getRowClassName={(row) => {
                const rowDone = isDisabledScreeningRow(row, flowVariant);
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
                </div>
                <div
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={!drilldownVisible || drilldownView !== "screening-history"}
                >
                  {drilldownRow && drilldownView === "screening-history" ? (
                    <ScreeningDrilldownPlaceholderPanel
                      row={drilldownRow}
                      title="Screening History"
                      description="Screening history for this match will appear here."
                      onBack={closeRowDrilldown}
                    />
                  ) : null}
                </div>
                <div
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={!drilldownVisible || drilldownView !== "documents"}
                >
                  {drilldownRow && drilldownView === "documents" ? (
                    <ScreeningDrilldownPlaceholderPanel
                      row={drilldownRow}
                      title="Documents"
                      description="Documents related to this match will appear here."
                      onBack={closeRowDrilldown}
                    />
                  ) : null}
                </div>
                <div
                  className="flex h-full min-h-0 w-1/5 min-w-0 flex-col overflow-hidden"
                  aria-hidden={!drilldownVisible || drilldownView !== "list-profile"}
                >
                  {drilldownRow && drilldownView === "list-profile" ? (
                    <ListProfilePanel row={drilldownRow} onBack={closeRowDrilldown} />
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
              </div>
            </div>
          </div>
    </AceAccordion>
  );
}
