import { useEffect, useId, useMemo, useState } from "react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { aceAccordionFixedHeaderClass } from "../lib/aceAccordion";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { AceTabs, aceTabButtonId } from "./ui/ace-tabs";import type { ScreeningResultRow } from "./ScreeningResultsTable";
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

const SIMULATOR_VIEW_TABS = [
  { id: "run-results", label: "Run Results" },
  { id: "reference-data", label: "Reference Data" },
  { id: "edit-distance", label: "Edit Distance" },
  { id: "name-patterns", label: "Name Patterns" },
] as const;

type SimulatorView = (typeof SIMULATOR_VIEW_TABS)[number]["id"];
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

interface MatchSimulatorContentProps {
  row: ScreeningResultRow;
  layout?: "modal" | "inline";
}

function MatchSummaryHeader({
  row,
  size = "default",
  className,
}: {
  row: ScreeningResultRow;
  size?: "default" | "lg";
  className?: string;
}) {
  const scoreTextClass = size === "lg" ? "text-[17.5px]" : "text-[14px]";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <span
          className={cn(
            "shrink-0 font-['Noto_Sans:SemiBold',sans-serif] tabular-nums",
            scoreTextClass,
            scoreIsHighRisk(row.matchScore)
              ? "text-[#c62828] dark:text-[#f48a8a]"
              : "text-[#23262c] dark:text-[#b6c2cf]",
          )}
          style={noto}
        >
          {row.matchScore}
        </span>
      <MatchStringTiles tiles={row.matchTiles} size={size === "lg" ? "lg" : "default"} />
    </div>
  );
}

function MatchSimulatorIdentityHeader({
  row,
  size = "default",
}: {
  row: ScreeningResultRow;
  size?: "default" | "lg";
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2 text-center">
      <h2
        className={cn(
          aceTypography(ACE_TYPE.h2SemiBold),
          "text-[var(--screening-text-primary)]",
        )}
        style={noto}
      >
        {row.name}
      </h2>
      <MatchSummaryHeader row={row} size={size} className="justify-center" />
    </div>
  );
}

export function MatchSimulatorContent({
  row,
  layout = "inline",
}: MatchSimulatorContentProps) {
  const [phase, setPhase] = useState<SimulatorPhase>("intro");
  const [view, setView] = useState<SimulatorView>("run-results");
  const tabPrefix = useId();
  const isInline = layout === "inline";

  useEffect(() => {
    setPhase("intro");
    setView("run-results");
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
        {isInline ? (
          <MatchSimulatorIdentityHeader row={row} size={phase === "intro" ? "lg" : "default"} />
        ) : phase !== "intro" ? (
          <MatchSummaryHeader row={row} className="shrink-0 flex-wrap" />
        ) : null}

        <div className={cn("flex flex-col", isInline ? "gap-4" : "min-h-0 flex-1")}>
        {phase === "intro" ? (
          <section
            className={cn(
              "flex flex-col items-center justify-center gap-6 rounded-[4px]",
              isInline ? "px-2 py-4" : "min-h-[320px] flex-1 gap-8 px-4 py-6",
            )}
          >
            <div className="flex flex-col items-center gap-4">
              {!isInline ? (
                <MatchSummaryHeader row={row} size="lg" className="justify-center" />
              ) : null}
              <p
                className="font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
                style={noto}
              >
                Learn more about this match!
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setPhase("results");
              }}
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
            <AceTabs
              items={[...SIMULATOR_VIEW_TABS]}
              value={view}
              onValueChange={(id) => setView(id as SimulatorView)}
              idPrefix={tabPrefix}
              aria-label="Match simulator result views"
            />

            <div
              role="tabpanel"
              id={`${tabPrefix}-panel-${view}`}
              aria-labelledby={aceTabButtonId(tabPrefix, view)}
              className={cn(isInline ? "max-h-[420px] overflow-y-auto" : "min-h-0 flex-1 overflow-y-auto")}
            >
              {view === "run-results" ? (
                <SimulatorRunResultsTable rows={runRows} />
              ) : view === "reference-data" ? (
                <ReferenceDataView row={row} />
              ) : view === "edit-distance" ? (
                <EditDistanceView />
              ) : view === "name-patterns" ? (
                <NamePatternsView row={row} tableSize={isInline ? "compact" : "comfortable"} />
              ) : null}
            </div>
          </section>        )}
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
