import { useEffect, useState } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  MATCH_SUMMARY_RANK_TYPE,
  nameTypeMatchedForRow,
} from "../lib/matchAttributesData";
import { ClientProfileMetaLine } from "./ClientProfileMetaLine";
import { MatchAttributesTable } from "./MatchAttributesTable";
import { MatchSimulatorContent } from "./MatchSimulatorDrawerContent";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export interface MatchSimulatorPanelProps {
  row: ScreeningResultRow;
  onBack: () => void;
  /** When true, omit Back + title (parent shell provides navigation). */
  hideChrome?: boolean;
}

function MatchSummaryHeaderBar({
  row,
  onSimulateMatch,
}: {
  row: ScreeningResultRow;
  onSimulateMatch: () => void;
}) {
  const nameTypeMatched = nameTypeMatchedForRow(row);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <ClientProfileMetaLine label="Name Type Matched">
          {nameTypeMatched}
        </ClientProfileMetaLine>
        <ClientProfileMetaLine label="Rank Type">
          {MATCH_SUMMARY_RANK_TYPE}
        </ClientProfileMetaLine>
        <ClientProfileMetaLine label="FinScan Category">N/A</ClientProfileMetaLine>
      </div>
      <AceButton
        type="button"
        variant="primary"
        palette="purple"
        size="md"
        className="shrink-0"
        onClick={onSimulateMatch}
      >
        Simulate Match
      </AceButton>
    </div>
  );
}

export function MatchSimulatorPanel({
  row,
  onBack,
  hideChrome = false,
}: MatchSimulatorPanelProps) {
  const [showSimulator, setShowSimulator] = useState(false);

  useEffect(() => {
    setShowSimulator(false);
  }, [row.id]);

  const body = (
    <div
      className={cn(
        "bg-[var(--screening-surface)] px-4 py-4",
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto",
      )}
    >
      {showSimulator ? (
        <MatchSimulatorContent
          row={row}
          layout="inline"
          hideName={hideChrome}
          initialPhase="results"
        />
      ) : (
        <>
          <MatchSummaryHeaderBar
            row={row}
            onSimulateMatch={() => setShowSimulator(true)}
          />
          <MatchAttributesTable row={row} />
        </>
      )}
    </div>
  );

  if (hideChrome) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">{body}</div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 bg-[var(--screening-surface)] px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "mb-3 inline-flex cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)] transition-colors",
            "hover:text-[var(--dialog-modal-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
          )}
        >
          <MaterialSymbol name="keyboard_arrow_left" size="md" />
          <span
            className={cn(aceTypography(ACE_TYPE.p1Bold), "text-[var(--screening-primary)]")}
            style={notoVar}
          >
            Back to List
          </span>
        </button>
        <p
          className={cn(aceTypography(ACE_TYPE.p1SemiBold), "text-[var(--screening-text-primary)]")}
          style={notoVar}
        >
          Match Summary
        </p>
      </div>
      {body}
    </div>
  );
}
