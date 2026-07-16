import { Fragment, useCallback, useMemo, useState } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { AceTable } from "@ace-ds/components/molecules/AceTable/AceTable";
import {
  getGeneralProfileViewForRow,
  type ListProfileData,
  type ListProfileDataTable,
  type ListProfileGeneralField,
} from "../lib/listProfileData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { LIST_PROFILE_ACCORDION_TABS } from "../lib/listProfileTabs";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** ACE table without muted header / surface fills on rows. */
const listProfileAceTableClass = cn(
  "rounded-none border-0",
  "[&_thead]:bg-transparent",
  "[&_tbody_tr]:bg-transparent",
);

function toAceTableData(table: ListProfileDataTable) {
  const columns = table.columns.map((header, index) => ({
    key: `col-${index}`,
    header,
  }));
  const rows = table.rows.map((cells) =>
    Object.fromEntries(cells.map((cell, index) => [`col-${index}`, cell])),
  );
  return { columns, rows };
}

export function ListProfileGeneralTable({ fields }: { fields: ListProfileGeneralField[] }) {
  const { columns, rows } = toAceTableData({
    columns: ["Field", "Value"],
    rows: fields.map((field) => [field.label, field.value]),
  });

  return (
    <AceTable
      columns={columns}
      rows={rows}
      caption="General profile information"
      className={cn(
        listProfileAceTableClass,
        "[&_thead]:sr-only",
        "[&_td:first-child]:[font:var(--ace-type-paragraph-p1-bold)]",
        "[&_td:first-child]:[letter-spacing:var(--ace-type-paragraph-p1-bold-tracking)]",
        "[&_td:first-child]:w-[38%]",
      )}
    />
  );
}

const listProfileAccordionClass = "border-[var(--ace-accordion-border)] shadow-none";
const listProfileAccordionTitleClass = cn(
  aceTypography(ACE_TYPE.p1SemiBold),
  "text-[var(--screening-text-primary)]",
);

function GeneralMatchCheck() {
  return (
    <span
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#2e7d32]"
      aria-hidden
    >
      <MaterialSymbol name="check" size="sm" className="text-white" />
    </span>
  );
}

const generalHeaderCellClass = cn(
  aceTypography(ACE_TYPE.p1Bold),
  "text-[var(--screening-text-primary)]",
);
const generalLabelCellClass = cn(
  aceTypography(ACE_TYPE.p1Regular),
  "text-[var(--screening-text-secondary)]",
);
const generalValueCellClass = cn(
  aceTypography(ACE_TYPE.p1Regular),
  "text-[var(--screening-text-primary)]",
);

/** Expanded-row General tab: client-vs-list comparison + collapsible list metadata. */
export function GeneralProfileComparison({ row }: { row: ScreeningResultRow }) {
  const { comparison, more } = useMemo(() => getGeneralProfileViewForRow(row), [row]);
  const [moreOpen, setMoreOpen] = useState(false);

  const renderValue = (value: string | null, field: { kind: "text" | "boolean" }) => {
    if (field.kind === "boolean") {
      return value === "Yes" ? (
        <GeneralMatchCheck />
      ) : (
        <span className="text-[var(--screening-text-secondary)]">—</span>
      );
    }
    return value && value !== "—" ? (
      value
    ) : (
      <span className="text-[var(--screening-text-secondary)]">—</span>
    );
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div
        className="grid w-fit grid-cols-[auto_auto_auto] items-center gap-x-12 gap-y-1.5"
        style={notoVar}
      >
        <span className={generalHeaderCellClass}>Field</span>
        <span className={generalHeaderCellClass}>Client Record</span>
        <span className={generalHeaderCellClass}>List Record</span>
        {comparison.map((field) => (
          <Fragment key={field.field}>
            <span className={generalLabelCellClass}>{field.field}</span>
            <span className={generalValueCellClass}>{renderValue(field.client, field)}</span>
            <span className={generalValueCellClass}>{renderValue(field.list, field)}</span>
          </Fragment>
        ))}
      </div>

      <AceAccordion
        title="More"
        surface="white"
        dropShadow={false}
        showTag={false}
        showAddIcon={false}
        showDeleteIcon={false}
        showEditIcon={false}
        showMoreIcon={false}
        open={moreOpen}
        onOpenChange={setMoreOpen}
        className={cn(listProfileAccordionClass, "w-full max-w-md")}
        titleClassName={listProfileAccordionTitleClass}
      >
        <div className="flex flex-col gap-2">
          {more.map((item) => (
            <div
              key={item.label}
              className={cn(aceTypography(ACE_TYPE.p1Regular), "text-[var(--screening-text-primary)]")}
              style={notoVar}
            >
              <span className="text-[var(--screening-text-secondary)]">{item.label}:</span>{" "}
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </AceAccordion>
    </div>
  );
}

function listProfileSectionContent(profile: ListProfileData, sectionId: (typeof LIST_PROFILE_ACCORDION_TABS)[number]["id"]) {
  switch (sectionId) {
    case "general":
      return <ListProfileGeneralTable fields={profile.general} />;
    case "addresses":
      return <ListProfileDataTableView table={profile.addresses} caption="Address records" />;
    case "dates":
      return <ListProfileDataTableView table={profile.dates} caption="Date records" />;
    case "id-numbers":
      return <ListProfileDataTableView table={profile.idNumbers} caption="Identification numbers" />;
    case "person":
      return <ListProfileDataTableView table={profile.person} caption="Person records" />;
    case "tracking":
      return <ListProfileDataTableView table={profile.tracking} caption="Tracking information" />;
    default:
      return null;
  }
}

export function ListProfileAllTabView({ profile }: { profile: ListProfileData }) {
  const sectionIds = useMemo(
    () => LIST_PROFILE_ACCORDION_TABS.map((section) => section.id),
    [],
  );
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set());

  const allExpanded = sectionIds.length > 0 && sectionIds.every((id) => openSections.has(id));

  const setSectionOpen = useCallback((sectionId: string, open: boolean) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (open) next.add(sectionId);
      else next.delete(sectionId);
      return next;
    });
  }, []);

  const toggleAllSections = useCallback(() => {
    setOpenSections(allExpanded ? new Set() : new Set(sectionIds));
  }, [allExpanded, sectionIds]);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex shrink-0 justify-end">
        <button
          type="button"
          className={cn(
            aceTypography(ACE_TYPE.p1SemiBold),
            "shrink-0 cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)] transition-colors",
            "hover:text-[var(--dialog-modal-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
          )}
          style={notoVar}
          aria-label={allExpanded ? "Collapse all sections" : "Expand all sections"}
          onClick={toggleAllSections}
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {LIST_PROFILE_ACCORDION_TABS.map((section) => (
          <AceAccordion
            key={section.id}
            title={section.label}
            surface="white"
            dropShadow={false}
            showTag={false}
            showAddIcon={false}
            showDeleteIcon={false}
            showEditIcon={false}
            showMoreIcon={false}
            open={openSections.has(section.id)}
            onOpenChange={(open) => setSectionOpen(section.id, open)}
            className={listProfileAccordionClass}
            titleClassName={listProfileAccordionTitleClass}
          >
            {listProfileSectionContent(profile, section.id)}
          </AceAccordion>
        ))}
      </div>
    </div>
  );
}

export function ListProfileDataTableView({
  table,
  caption,
}: {
  table: ListProfileDataTable;
  caption: string;
}) {
  if (table.rows.length === 0) {
    return (
      <p
        className={cn(aceTypography(ACE_TYPE.p1Regular), "m-0 text-[var(--screening-text-secondary)]")}
        style={notoVar}
      >
        No records to display.
      </p>
    );
  }

  const { columns, rows } = toAceTableData(table);

  return (
    <AceTable
      columns={columns}
      rows={rows}
      caption={caption}
      className={listProfileAceTableClass}
    />
  );
}
