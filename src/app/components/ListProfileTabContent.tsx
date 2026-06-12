import { useCallback, useMemo, useState } from "react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { AceTable } from "@ace-ds/components/molecules/AceTable/AceTable";
import type { ListProfileData, ListProfileDataTable, ListProfileGeneralField } from "../lib/listProfileData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { LIST_PROFILE_ACCORDION_TABS } from "../lib/listProfileTabs";
import { cn } from "./ui/utils";

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
    <div className="flex flex-col gap-4">
      {LIST_PROFILE_ACCORDION_TABS.map((section, index) => (
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
          headerTrailing={
            index === 0 ? (
              <button
                type="button"
                className={cn(
                  aceTypography(ACE_TYPE.p1SemiBold),
                  "shrink-0 cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)] transition-colors",
                  "hover:text-[var(--dialog-modal-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
                )}
                style={notoVar}
                aria-label={allExpanded ? "Collapse all sections" : "Expand all sections"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleAllSections();
                }}
              >
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            ) : undefined
          }
        >
          {listProfileSectionContent(profile, section.id)}
        </AceAccordion>
      ))}
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
