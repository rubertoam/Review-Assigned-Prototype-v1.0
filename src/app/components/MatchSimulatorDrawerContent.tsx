import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { aceAccordionFixedHeaderClass } from "../lib/aceAccordion";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import type { ScreeningResultRow } from "./ScreeningResultsTable";
import {
  MatchStringTiles,
  SimulatorNamePatternsTable,
  SimulatorReferenceDataTable,
  SimulatorRunResultsTable,
  buildNamePatternTableRows,
  buildSimulatorRunRows,
  scoreIsHighRisk,
  type ReferenceDataFieldRow,
} from "./ScreeningResultsTable";
import { cn } from "./ui/utils";
import matchSimulatorIntro from "../../assets/match-simulator-intro.svg";

const SIMULATOR_VIEWS = [
  "Run Results",
  "Reference Data",
  "Edit Distance",
  "Name Patterns",
] as const;

type SimulatorView = (typeof SIMULATOR_VIEWS)[number];

type SimulatorPhase = "intro" | "results";

function splitDisplayName(name: string): { given: string; family: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return { given: parts[0] ?? "", family: "" };
  return { given: parts[0], family: parts.slice(1).join(" ") };
}

function buildReferenceData(row: ScreeningResultRow) {
  const { given, family } = splitDisplayName(row.name);
  const clientParsed = row.name.toUpperCase();
  const listInput = family
    ? `${given.charAt(0).toUpperCase()}${given.slice(1).toLowerCase()}y ${family}y`
    : `${row.name}y`;
  const listParsed = family
    ? `${given.toUpperCase()}NY ${family.toUpperCase()}Y`
    : row.name.toUpperCase();

  return {
    client: {
      inputName: row.name,
      parsedName: clientParsed,
      ignored: "James",
    },
    list: {
      parsedName: listParsed,
      ignored: "N/A",
      inputName: listInput,
    },
    aliases: [
      { token: given || "John", badge: "1 alias found", detail: "Jonny" },
      { token: family || "Smith", badge: "None", detail: null },
    ],
  };
}

function buildClientDataRows(
  client: ReturnType<typeof buildReferenceData>["client"],
): ReferenceDataFieldRow[] {
  return [
    { id: "client-input-name", label: "Input Name", value: client.inputName },
    { id: "client-parsed-name", label: "Parsed Name", value: client.parsedName },
    { id: "client-ignored", label: "Ignored", value: client.ignored },
  ];
}

function buildListDataRows(list: ReturnType<typeof buildReferenceData>["list"]): ReferenceDataFieldRow[] {
  return [
    { id: "list-parsed-name", label: "Parsed Name", value: list.parsedName },
    { id: "list-ignored", label: "Ignored", value: list.ignored },
    { id: "list-input-name", label: "Input Name", value: list.inputName },
  ];
}

function ReferenceDataTableSection({
  title,
  rows,
  caption,
}: {
  title: string;
  rows: ReferenceDataFieldRow[];
  caption: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="font-['Noto_Sans:Bold',sans-serif] text-[13px] font-bold uppercase tracking-[0.03em] leading-[1.4] text-[#23262c] dark:text-[#b6c2cf]"
        style={noto}
      >
        {title}
      </p>
      <SimulatorReferenceDataTable rows={rows} caption={caption} />
    </div>
  );
}

function AliasAccordionRow({
  token,
  badge,
  detail,
}: {
  token: string;
  badge: string;
  detail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const hasDetail = detail != null && badge !== "None";

  return (
    <AceAccordion
      title={token}
      tagLabel={badge}
      showTag
      showAddIcon={false}
      showDeleteIcon={false}
      showEditIcon={false}
      showMoreIcon={false}
      surface="white"
      open={hasDetail ? open : false}
      onOpenChange={hasDetail ? setOpen : undefined}
      className={cn(aceAccordionFixedHeaderClass, !hasDetail && "pointer-events-none")}
      titleClassName={cn(
        aceTypography(ACE_TYPE.p1SemiBold),
        "text-[var(--screening-text-primary)]",
      )}
    >
      {hasDetail ? (
        <p
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "m-0 text-[var(--screening-text-secondary)]",
          )}
        >
          {detail}
        </p>
      ) : null}
    </AceAccordion>
  );
}

function ReferenceDataView({ row }: { row: ScreeningResultRow }) {
  const ref = useMemo(() => buildReferenceData(row), [row]);
  const clientRows = useMemo(() => buildClientDataRows(ref.client), [ref.client]);
  const listRows = useMemo(() => buildListDataRows(ref.list), [ref.list]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <ReferenceDataTableSection
          title="Client Data"
          rows={clientRows}
          caption="Match simulator client reference data"
        />
        <ReferenceDataTableSection
          title="List Data"
          rows={listRows}
          caption="Match simulator list reference data"
        />
      </div>

      <p
        className="border-b border-[#e4e6ea] pb-2 font-['Noto_Sans:Bold',sans-serif] text-[13px] font-bold uppercase tracking-[0.03em] leading-[1.4] text-[#23262c] dark:border-[#38414a] dark:text-[#b6c2cf]"
        style={noto}
      >
        Alias Match
      </p>

      <div className="flex flex-col gap-3">
        {ref.aliases.map((alias) => (
          <AliasAccordionRow
            key={alias.token}
            token={alias.token}
            badge={alias.badge}
            detail={alias.detail}
          />
        ))}
      </div>
    </div>
  );
}

function EditDistanceLine({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <p
      className="font-['Noto_Sans:Regular',sans-serif] text-[14px] leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
      style={noto}
    >
      <span>{`${label} · `}</span>
      <span className={cn("text-[#6a7285] dark:text-[#8696a7]", valueClassName)}>{value}</span>
    </p>
  );
}

function NamePatternsMetaLine({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <p
      className="font-['Noto_Sans:Regular',sans-serif] text-[12px] leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
      style={noto}
    >
      <span>{`${label} · `}</span>
      <span className={cn("text-[#6a7285] dark:text-[#8696a7]", valueClassName)}>{value}</span>
    </p>
  );
}

function NamePatternsView({
  row,
  tableSize = "compact",
}: {
  row: ScreeningResultRow;
  tableSize?: "compact" | "comfortable";
}) {
  const tableRows = useMemo(() => buildNamePatternTableRows(row), [row]);
  const [showMorePatterns, setShowMorePatterns] = useState(false);
  const comfortable = tableSize === "comfortable";

  return (
    <div className={cn("flex flex-col", comfortable ? "gap-4" : "gap-3")}>
      <SimulatorNamePatternsTable rows={tableRows} size={tableSize} />

      <AceAccordion
        title="Show additional candidate patterns"
        showTag={false}
        showAddIcon={false}
        showDeleteIcon={false}
        showEditIcon={false}
        showMoreIcon={false}
        surface="gray"
        open={showMorePatterns}
        onOpenChange={setShowMorePatterns}
        titleClassName={cn(
          aceTypography(ACE_TYPE.p1Regular),
          "text-sm text-[var(--screening-primary)]",
        )}
        className={cn("border-[var(--screening-border-soft)]", aceAccordionFixedHeaderClass)}
      >
        <p
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "m-0 text-xs text-[var(--screening-text-secondary)]",
          )}
        >
          Additional candidate patterns (prototype placeholder).
        </p>
      </AceAccordion>

      <div className="flex flex-col gap-2 pt-1">
        <p
          className="py-2 font-['Noto_Sans:Bold',sans-serif] text-[12px] font-bold leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
          style={noto}
        >
          6+ Name Elements Matching
        </p>
        <div className="flex flex-col gap-2">
          <NamePatternsMetaLine label="List 6+ Name Elements" value="N/A" />
          <NamePatternsMetaLine label="Client 6+ Name Elements" value="N/A" />
          <NamePatternsMetaLine label="Multiple Match Type" value="Best" />
          <NamePatternsMetaLine label="Treat Extra Entries as Blank" value="On" />
          <NamePatternsMetaLine label="Order Matters" value="On" />
          <p className="font-['Noto_Sans:Regular',sans-serif] text-[12px] leading-[1.65] text-[#464c59] dark:text-[#9fadbc]" style={noto}>
            <span>Assigned Match Attribute · </span>
            <span className="font-bold text-[#66b345] dark:text-[#7bc96f]">EQUAL</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SimulatorAttribution() {
  return (
    <p
      className="min-w-0 shrink text-left font-['Noto_Sans:Regular',sans-serif] text-[14px] leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
      style={noto}
    >
      Data provided by the <span className="font-semibold text-[#7868cd]">Match Simulator</span>
    </p>
  );
}

function EditDistanceView() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <p
        className="font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
        style={noto}
      >
        Edit Distance Threshold
      </p>
      <div className="flex flex-col gap-2">
        <EditDistanceLine label="Edit Distance Threshold" value="1" />
        <EditDistanceLine
          label="Search Extension Type"
          value="Enabled (Allow one initial extension for two tokens)"
        />
        <EditDistanceLine
          label="Threshold Met"
          value="YES"
          valueClassName="font-semibold text-[#66b345] dark:text-[#7bc96f]"
        />
      </div>
      <AceAccordion
        title="Show More"
        showTag={false}
        showAddIcon={false}
        showDeleteIcon={false}
        showEditIcon={false}
        showMoreIcon={false}
        surface="gray"
        open={showMore}
        onOpenChange={setShowMore}
        titleClassName={cn(
          aceTypography(ACE_TYPE.p1Regular),
          "text-[var(--screening-primary)]",
        )}
        className={cn("border-[var(--screening-border-soft)]", aceAccordionFixedHeaderClass)}
      >
        <div className="flex flex-col gap-2">
          <EditDistanceLine label="Distance Score" value="0.82" />
          <EditDistanceLine label="Token Count" value="2" />
        </div>
      </AceAccordion>
    </div>
  );
}

const headerTitleClass =
  "font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[#23262c] dark:text-[#b6c2cf] text-[20px] whitespace-nowrap";

const noto = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const simulatorViewTriggerClass = cn(
  "inline-flex w-[12.5rem] shrink-0 items-center justify-between gap-[var(--space-2)] rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-[var(--ace-button-px-sm)] py-[var(--ace-button-py-sm)] text-xs font-semibold leading-[1.65] text-[var(--screening-text-primary)] outline-none transition-colors [font-family:var(--font-screening)]",
  "hover:bg-[var(--screening-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
  "data-[state=open]:bg-[var(--screening-surface-hover)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--screening-primary-ring)] data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-[var(--screening-primary-ring-offset)]",
);

function SimulatorViewDropdown({
  view,
  onViewChange,
}: {
  view: SimulatorView;
  onViewChange: (view: SimulatorView) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={simulatorViewTriggerClass}>
        <span className="min-w-0 flex-1 truncate text-left">{view}</span>
        <ChevronDown className="ml-auto size-4 shrink-0 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        variant="primary"
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {SIMULATOR_VIEWS.map((option) => (
          <DropdownMenuItem
            key={option}
            className={cn(
              option === view &&
                "bg-[var(--screening-surface-hover)] [&>span:first-child]:bg-[var(--ace-dropdown-menu-primary)]",
            )}
            onSelect={() => onViewChange(option)}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MatchSimulatorContentProps {
  row: ScreeningResultRow;
  layout?: "modal" | "inline";
}

export function MatchSimulatorContent({
  row,
  layout = "inline",
}: MatchSimulatorContentProps) {
  const [phase, setPhase] = useState<SimulatorPhase>("intro");
  const [view, setView] = useState<SimulatorView>("Run Results");
  const isInline = layout === "inline";

  useEffect(() => {
    setPhase("intro");
    setView("Run Results");
  }, [row.id]);

  const runRows = useMemo(() => buildSimulatorRunRows(row), [row]);

  return (
    <div
      className={cn(
        "flex flex-col",
        isInline ? "gap-4 overflow-visible" : "h-full min-h-0 flex-1 overflow-hidden",
      )}
    >
      {!isInline ? (
        <div className="flex shrink-0 items-center justify-between gap-3 bg-white px-5 py-4 dark:bg-[#22272b]">
          <p className={headerTitleClass} style={noto}>
            Match Simulator
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col",
          isInline ? "gap-4 overflow-visible" : "min-h-0 flex-1 gap-6 overflow-hidden p-6",
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span
            className={cn(
              "shrink-0 font-['Noto_Sans:SemiBold',sans-serif] text-[14px] tabular-nums",
              scoreIsHighRisk(row.matchScore)
                ? "text-[#c62828] dark:text-[#f48a8a]"
                : "text-[#23262c] dark:text-[#b6c2cf]",
            )}
            style={noto}
          >
            {row.matchScore}
          </span>
          <MatchStringTiles tiles={row.matchTiles} />
        </div>

        <div className={cn("flex flex-col", isInline ? "gap-4" : "min-h-0 flex-1")}>
        {phase === "intro" ? (
          <section
            className={cn(
              "flex flex-col items-center justify-center gap-6 rounded-[4px]",
              isInline ? "px-2 py-4" : "min-h-[320px] flex-1 gap-8 px-4 py-6",
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <img
                src={matchSimulatorIntro}
                alt=""
                className={cn(
                  "max-w-full object-contain",
                  isInline ? "h-[120px] w-[150px]" : "h-[199px] w-[248px]",
                )}
              />
              <p
                className="font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
                style={noto}
              >
                Learn more about this match!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPhase("results")}
              className="cursor-pointer rounded-[4px] bg-[#3d2e8a] px-4 py-2 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-white transition-colors hover:bg-[#523eb9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/40 focus-visible:ring-offset-2"
              style={noto}
            >
              Simulate Match
            </button>
          </section>
        ) : (
          <section
            className={cn(
              "flex flex-col gap-4 rounded-[4px]",
              isInline ? "" : "min-h-0 flex-1 gap-5",
            )}
          >
            <div className="shrink-0 self-start p-0.5">
              <SimulatorViewDropdown view={view} onViewChange={setView} />
            </div>

            <div className={cn(isInline ? "max-h-[420px] overflow-y-auto" : "min-h-0 flex-1 overflow-y-auto")}>
              {view === "Run Results" ? (
                <SimulatorRunResultsTable rows={runRows} />
              ) : view === "Reference Data" ? (
                <ReferenceDataView row={row} />
              ) : view === "Edit Distance" ? (
                <EditDistanceView />
              ) : view === "Name Patterns" ? (
                <NamePatternsView row={row} tableSize={isInline ? "compact" : "comfortable"} />
              ) : null}
            </div>
          </section>
        )}
        </div>

        {phase === "results" ? (
          <footer className="flex shrink-0 items-center pt-1">
            <SimulatorAttribution />
          </footer>
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use MatchSimulatorContent in expanded table rows. */
export function MatchSimulatorDrawerContent({ row }: { row: ScreeningResultRow; onClose: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <MatchSimulatorContent row={row} layout="modal" />
    </div>
  );
}
