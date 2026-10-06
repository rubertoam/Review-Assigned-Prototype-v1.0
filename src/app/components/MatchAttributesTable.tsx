import { ExpandableFinScanTable, type FinScanTableColumn } from "./ExpandableFinScanTable";
import { MatchStringTiles, type ScreeningResultRow } from "./ScreeningResultsTable";
import {
  matchAttributesForRow,
  type MatchAttributeRow,
} from "../lib/matchAttributesData";

const MATCH_ATTRIBUTE_COLUMNS: FinScanTableColumn<MatchAttributeRow>[] = [
  {
    key: "attribute",
    label: "Match Field",
    headerClassName: "w-[40%]",
    render: (row) => row.attribute,
  },
  {
    key: "value",
    label: "Match Attribute",
    render: (row) => (
      <span className="inline-flex items-center gap-2">
        <MatchStringTiles tiles={[row.code]} />
        <span>{row.value}</span>
      </span>
    ),
  },
];

export function MatchAttributesTable({ row }: { row: ScreeningResultRow }) {
  const attributes = matchAttributesForRow(row);

  return (
    <ExpandableFinScanTable
      rows={attributes}
      columns={MATCH_ATTRIBUTE_COLUMNS}
      caption="Match attributes"
      expandable={false}
      showExpandAll={false}
      minWidth="min-w-[320px]"
      density="compact"
      scrollY={false}
      className="border border-[var(--screening-border-strong)]"
    />
  );
}
