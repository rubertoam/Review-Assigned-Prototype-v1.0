import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Eye, EyeOff, List } from "lucide-react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { MatchSimulatorContent } from "./MatchSimulatorDrawerContent";
import { aceAccordionFixedHeaderClass } from "../lib/aceAccordion";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
  ExpandableFinScanTable,
  durationAccordion,
  easeAccordion,
  type FinScanTableColumn,
} from "./ExpandableFinScanTable";

export { easeAccordion, durationAccordion } from "./ExpandableFinScanTable";

export type ScreeningRowStatus = "New" | "Escalated";

const STATUS_FILTER_ORDER: ScreeningRowStatus[] = ["New", "Escalated"];

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
  return flowVariant === "level-2" ? row.readOnlyHistory === true : row.status === "Escalated";
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
};

/** Row shape used inside the table (Level 2 review history adds display overrides). */
export type ScreeningTableDisplayRow = ScreeningResultRow & {
  readOnlyHistory?: boolean;
  displayStatus?: "Safe";
};

const CASE_RESULT_COUNTS = [8, 8, 7, 5, 3, 2] as const;

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

function rowStatusForIndex(index: number, total: number, caseIndex: number): ScreeningRowStatus {
  if (caseIndex === 4 && total === 3) {
    return index === 2 ? "Escalated" : "New";
  }
  if (caseIndex === 1 && total === 8) {
    return index === 0 ? "New" : "Escalated";
  }
  if (caseIndex === 2 && total === 7) {
    return index < 2 ? "New" : "Escalated";
  }
  if (total >= 3 && index >= total - 3) return "Escalated";
  if (total < 3 && index === total - 1) return "Escalated";
  return "New";
}

function dobForCase(caseIndex: number): string {
  const dobs = ["03/23/1978", "04/11/1985", "06/07/1942", "09/14/1992", "—", "—"];
  return dobs[Math.min(caseIndex, dobs.length - 1)];
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
      status: rowStatusForIndex(i, total, ci),
    });
  }
  return rows;
}

export const MOCK_ROWS: ScreeningResultRow[] = getScreeningRowsForCase(0);

type SortKey = "name" | "dob" | "matchAge" | "matchScore" | "status";
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
export function MatchStringTiles({ tiles, className }: { tiles: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {tiles.map((t, i) => {
        const s = tileSoftStyle(t);
        return (
          <span
            key={`${t}-${i}`}
            title={t}
            className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded border border-solid px-0.5 text-[10px] font-semibold leading-none"
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

function ageDotClass(tone: ScreeningResultRow["matchAgeTone"]): string {
  if (tone === "fresh") return "bg-[#2e7d32]";
  if (tone === "warn") return "bg-[#ef6c00]";
  return "bg-[#c62828]";
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

function safeStatusPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a5d6a7] bg-[#e8f4ea] pl-1.5 pr-2.5 py-1 transition-colors duration-200 ease-out">
      <span className="size-2 shrink-0 rounded-full bg-[#2e7d32]" />
      <span
        className="font-['Noto_Sans:SemiBold',sans-serif] text-[12px] text-[#2d6a3e]"
        style={notoVar}
      >
        Safe
      </span>
    </span>
  );
}

function buildLevel2DisplayRows(
  rows: ScreeningResultRow[],
  showReviewHistory: boolean,
): ScreeningTableDisplayRow[] {
  const active = rows.filter((r) => r.status === "Escalated");
  if (!showReviewHistory) return active;
  const history = rows
    .filter((r) => r.status === "New")
    .map(
      (r): ScreeningTableDisplayRow => ({
        ...r,
        readOnlyHistory: true,
        displayStatus: "Safe",
      }),
    );
  return [...active, ...history];
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
  /** Empty set = no filter (show all). Otherwise rows must match one of the selected statuses. */
  const [statusFilters, setStatusFilters] = useState<Set<ScreeningRowStatus>>(() => new Set());
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    if (isLevel2) setShowReviewHistory(false);
  }, [isLevel2, rows]);

  const level2ActiveRows = useMemo(
    () => (isLevel2 ? rows.filter((r) => r.status === "Escalated") : []),
    [isLevel2, rows],
  );

  const baseRows = useMemo((): ScreeningTableDisplayRow[] => {
    if (isLevel2) return buildLevel2DisplayRows(rows, showReviewHistory);
    return rows;
  }, [isLevel2, rows, showReviewHistory]);

  // Chips = one per status present in `rows`. Multi-select: OR semantics. Empty selection = show all rows.
  const statusChips = useMemo(() => {
    if (isLevel2) return [];
    const set = new Set<ScreeningRowStatus>();
    rows.forEach((r) => set.add(r.status));
    return STATUS_FILTER_ORDER.filter((status) => set.has(status));
  }, [isLevel2, rows]);

  const filteredRows = useMemo(() => {
    if (isLevel2) return baseRows;
    if (statusFilters.size === 0) return baseRows;
    return baseRows.filter((r) => statusFilters.has(r.status));
  }, [isLevel2, baseRows, statusFilters]);

  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    if (!sortKey) return list;
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
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
        default:
          break;
      }
      return cmp * dir;
    });
    return list;
  }, [filteredRows, sortKey, sortDir]);

  const selectionRowsSignature = useMemo(
    () => sortedRows.map((r) => `${r.id}:${r.status}`).join(","),
    [sortedRows],
  );

  useEffect(() => {
    const allow = new Set(sortedRows.map((r) => r.id));
    const allowSelectable = new Set(
      sortedRows
        .filter((r) =>
          isLevel2
            ? !r.readOnlyHistory && r.status === "Escalated"
            : r.status === "New",
        )
        .map((r) => r.id),
    );
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (allowSelectable.has(id)) next.add(id);
      });
      return next;
    });
    setExpandedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (allow.has(id)) next.add(id);
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
    if (isLevel2) return 0;
    return rows.filter((r) => r.status === "Escalated").length;
  }, [isLevel2, rows]);
  const totalCount = isLevel2 ? level2ActiveRows.length : rows.length;
  const progress = totalCount === 0 ? 0 : (reviewedCount / totalCount) * 100;

  const selectionMode = selectedIds.size > 0;

  const actionableRows = useMemo(
    () =>
      sortedRows.filter((r) =>
        isLevel2 ? !r.readOnlyHistory && r.status === "Escalated" : r.status === "New",
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

  const screeningColumns: FinScanTableColumn<ScreeningTableDisplayRow>[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        sortKey: "status",
        cellClassName: "whitespace-nowrap",
        render: (row) => {
          if (row.displayStatus === "Safe") return safeStatusPill();
          if (row.status === "New") {
            return (
              <span className={cn("inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1", screeningNewPillSurfaceClass)}>
                <span className="size-2 shrink-0 rounded-full bg-[#523eb9]" />
                <span className={screeningNewPillLabelClass} style={notoVar}>
                  New
                </span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ffcc80] bg-[#fff4e8] pl-1.5 pr-2.5 py-1 transition-colors duration-200 ease-out">
              <span className="size-2 rounded-full bg-[#ef6c00]" />
              <span
                className="font-['Noto_Sans:SemiBold',sans-serif] text-[12px] text-[#e65100]"
                style={notoVar}
              >
                Escalated
              </span>
            </span>
          );
        },
      },
      {
        key: "name",
        label: "Name",
        sortKey: "name",
        cellClassName: "text-[#23262c] dark:text-[#b6c2cf]",
        render: (row) => row.name,
      },
      {
        key: "dob",
        label: "Date of Birth",
        sortKey: "dob",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap",
        render: (row) => row.dob,
      },
      {
        key: "matchAge",
        label: "Match Age",
        sortKey: "matchAge",
        cellClassName: "whitespace-nowrap",
        render: (row) => (
          <span className="inline-flex items-center gap-2 text-[#464c59] dark:text-[#9fadbc]">
            <span className={cn("size-2 shrink-0 rounded-full", ageDotClass(row.matchAgeTone))} />
            {row.matchAgeLabel}
          </span>
        ),
      },
      {
        key: "matchScore",
        label: "Match Score",
        sortKey: "matchScore",
        cellClassName: "font-['Noto_Sans:SemiBold',sans-serif] font-semibold tabular-nums",
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
        key: "listCategory",
        label: "List Category",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc]",
        render: () => null,
      },
      {
        key: "listId",
        label: "List ID",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc]",
        render: () => null,
      },
      {
        key: "listProfileId",
        label: "List Profile ID",
        cellClassName: "text-[#464c59] dark:text-[#9fadbc]",
        render: () => null,
      },
    ],
    [isLevel2, flowVariant],
  );

  const screeningEmptyState = (
    <>
      <p className="m-0 mb-3 font-['Noto_Sans:Regular',sans-serif] text-[14px] text-[#464c59] dark:text-[#9fadbc]" style={notoVar}>
        {rows.length === 0
          ? "No screening results to display."
          : statusFilters.size > 0
            ? "No results match the current filter."
            : "No results to display."}
      </p>
      {statusFilters.size > 0 && rows.length > 0 ? (
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
            {isLevel2 || statusChips.length > 0 ? (
            <div className="shrink-0 border-b border-[#cfd2d9] dark:border-[#38414a] bg-[#fafafb] dark:bg-[#1d2125] px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {!isLevel2 ? (
                  <>
                    <span
                      className="font-['Noto_Sans:SemiBold',sans-serif] text-[14px] text-[#23262c] dark:text-[#b6c2cf] shrink-0"
                      style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                    >
                      Filter by
                    </span>
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      {statusChips.map((st) => {
                        const active = statusFilters.has(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() =>
                              setStatusFilters((prev) => {
                                const next = new Set(prev);
                                if (next.has(st)) next.delete(st);
                                else next.add(st);
                                return next;
                              })
                            }
                            className={cn(
                              "cursor-pointer rounded-[4px] px-3.5 py-1.5 text-[13px] font-['Noto_Sans:SemiBold',sans-serif] font-semibold transition-all duration-200 ease-out border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#22272b]",
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
                  </>
                ) : null}
                {isLevel2 ? (
                  <div className="ms-auto flex min-w-0 max-w-full flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-expanded={showReviewHistory}
                      aria-label={showReviewHistory ? "Hide review history" : "Show review history"}
                      onClick={() => setShowReviewHistory((o) => !o)}
                      className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[#cfd2d9] dark:border-[#38414a] bg-white dark:bg-[#22272b] text-[#464c59] dark:text-[#9fadbc] transition-colors duration-200 ease-out hover:border-[#949baa] hover:bg-[#eff0f2] dark:hover:bg-[#2c333a] hover:text-[#23262c] dark:hover:text-[#b6c2cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#22272b]"
                    >
                      {showReviewHistory ? (
                        <EyeOff className="size-4" strokeWidth={2} aria-hidden />
                      ) : (
                        <Eye className="size-4" strokeWidth={2} aria-hidden />
                      )}
                    </button>
                    <span
                      className="font-['Noto_Sans:SemiBold',sans-serif] text-[13px] text-[#23262c] dark:text-[#b6c2cf] shrink-0"
                      style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                    >
                      {showReviewHistory ? "Hide review history" : "Show review history"}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            ) : null}
            <ExpandableFinScanTable
              rows={sortedRows}
              columns={screeningColumns}
              caption={`${title}, ${sortedRows.length} ${sortedRows.length === 1 ? "row" : "rows"}${statusFilters.size > 0 ? `, filtered by ${[...statusFilters].sort((a, b) => a.localeCompare(b)).join(", ")}` : ""}`}
              minWidth="min-w-[960px]"
              showExpandAll={false}
              expandedIds={expandedIds}
              onExpandedIdsChange={setExpandedIds}
              sort={{
                sortKey,
                sortDir,
                onToggleSort: (key) => toggleSort(key as SortKey),
              }}
              selection={{
                selectedIds,
                isSelectable: (row) =>
                  isLevel2
                    ? !row.readOnlyHistory && row.status === "Escalated"
                    : row.status === "New",
                onToggleRow: toggleRowSelect,
                onHeaderSelectAll: onHeaderSelectAllChange,
                headerCheckboxState,
                actionableCount: actionableRows.length,
              }}
              trailingColumn={{
                render: () => (
                  <span
                    aria-hidden
                    className="inline-flex size-8 items-center justify-center rounded-[4px] border border-[#cfd2d9] dark:border-[#38414a] bg-white dark:bg-[#22272b] text-[#523eb9] opacity-0 pointer-events-none transition-all duration-200 ease-out group-hover/row:opacity-100"
                  >
                    <List className="size-4 shrink-0" strokeWidth={2} />
                  </span>
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
              renderExpandedContent={(row) => (
                <MatchSimulatorContent key={row.id} row={row} layout="inline" />
              )}
            />
          </div>
    </AceAccordion>
  );
}
