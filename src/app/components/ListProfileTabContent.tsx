import { AceTable } from "@ace-ds/components/molecules/AceTable/AceTable";
import type { ListProfileDataTable, ListProfileGeneralField } from "../lib/listProfileData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
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
