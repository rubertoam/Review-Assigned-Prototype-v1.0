import { useEffect, useMemo, useState } from "react";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceTable } from "@ace-ds/components/molecules/AceTable/AceTable";
import {
  initialRiskRatingForCase,
  riskRatingValueClass,
} from "../lib/clientRiskRatingData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const drawerAccordionClass = "border-[var(--ace-accordion-border)] shadow-none";

const metaRowClass = cn(
  aceTypography(ACE_TYPE.p1Regular),
  "m-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[var(--screening-text-secondary)]",
);

function SummaryDot() {
  return (
    <span
      className="mx-0.5 inline-block size-1 shrink-0 rounded-full bg-[var(--screening-text-muted)]"
      aria-hidden
    />
  );
}

export function ClientRiskRatingDrawerContent({ caseIndex }: { caseIndex: number }) {
  const [data, setData] = useState(() => initialRiskRatingForCase(caseIndex));
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setData(initialRiskRatingForCase(caseIndex));
    setHistoryOpen(false);
  }, [caseIndex]);

  const tableData = useMemo(() => {
    const columns = [
      { key: "rating", header: "Risk Rating" },
      { key: "score", header: "Score" },
      { key: "cip", header: "Customer Identification Program (CIP)" },
      { key: "screening", header: "Screening Results" },
      { key: "modified", header: "Modify Date" },
    ];
    const rows = data.history.map((row) => ({
      rating: row.ratingLabel,
      score: String(row.score),
      cip: String(row.cip),
      screening: String(row.screeningResults),
      modified: row.modifyDate,
    }));
    return { columns, rows };
  }, [data.history]);

  const handleRefresh = () => {
    setData(initialRiskRatingForCase(caseIndex));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="flex flex-col gap-4 rounded-[var(--radius-sm)] bg-[var(--screening-primary-soft-bg)] p-4">
        <div className="flex flex-col gap-2">
          <p className={metaRowClass} style={notoVar}>
            <span>Risk Rating</span>
            <SummaryDot />
            <span
              className={cn(
                aceTypography(ACE_TYPE.p1SemiBold),
                riskRatingValueClass(data.summary.ratingBand),
              )}
            >
              {data.summary.ratingLabel}
            </span>
          </p>
          <p className={metaRowClass} style={notoVar}>
            <span>Score</span>
            <SummaryDot />
            <span className="text-[var(--screening-text-primary)]">{data.summary.score}</span>
          </p>
          <p className={metaRowClass} style={notoVar}>
            <span>Customer Identification Program (CIP)</span>
            <SummaryDot />
            <span className="text-[var(--screening-text-primary)]">{data.summary.cip}</span>
          </p>
          <p className={metaRowClass} style={notoVar}>
            <span>Screening Results</span>
            <SummaryDot />
            <span className="text-[var(--screening-text-primary)]">
              {data.summary.screeningResults}
            </span>
          </p>
        </div>

        <div className="flex justify-end">
          <AceButton
            type="button"
            variant="primary"
            palette="purple"
            size="md"
            onClick={handleRefresh}
          >
            <span className="inline-flex items-center gap-2">
              Refresh
              <MaterialSymbol name="autorenew" size="md" className="text-current" />
            </span>
          </AceButton>
        </div>
      </div>

      <AceAccordion
        title="Risk History"
        surface="white"
        dropShadow={false}
        showTag={false}
        showAddIcon={false}
        showDeleteIcon={false}
        showEditIcon={false}
        showMoreIcon={false}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        className={drawerAccordionClass}
        titleClassName={cn(
          aceTypography(ACE_TYPE.p1SemiBold),
          "text-[var(--screening-text-primary)]",
        )}
        contentPadding
      >
        <div className="w-full min-w-0 overflow-x-auto">
          <AceTable
            columns={tableData.columns}
            rows={tableData.rows}
            caption="Risk rating history"
          />
        </div>
      </AceAccordion>
    </div>
  );
}
