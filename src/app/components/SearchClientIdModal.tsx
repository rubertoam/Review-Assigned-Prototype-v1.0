import { useEffect, useMemo, useState } from "react";
import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import type { ReviewAssignedSidebarSelection } from "./ReviewAssignedSidebar";
import type { CaseListSectionContext } from "./ScreeningResultsTable";
import { cn } from "./ui/utils";

export type ClientIdSearchHit = {
  id: string;
  clientId: string;
  clientName: string;
  locationLabel: string;
  selection: ReviewAssignedSidebarSelection;
  caseIndex: number;
  section: CaseListSectionContext;
};

export type SearchClientIdModalProps = {
  open: boolean;
  onClose: () => void;
  catalog: readonly ClientIdSearchHit[];
  onSelectHit: (hit: ClientIdSearchHit) => void;
};

export function SearchClientIdModal({
  open,
  onClose,
  catalog,
  onSelectHit,
}: SearchClientIdModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!trimmed) return [];
    const needle = trimmed.toLowerCase();
    return catalog.filter((hit) => hit.clientId.toLowerCase().includes(needle));
  }, [catalog, trimmed]);

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title="Search Client ID"
      description="Find a client by ID across all Level 2 work queues and workflows."
      size="md"
      fitContent
      bodyClassName="flex flex-col gap-4"
    >
      <AceInputField
        id="search-client-id"
        label="Client ID"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Enter client ID"
        autoComplete="off"
        fieldSize="md"
        icon="left"
        onClear={query ? () => setQuery("") : undefined}
        autoFocus
      />

      {trimmed ? (
        results.length > 0 ? (
          <ul className="m-0 flex max-h-[min(40vh,20rem)] list-none flex-col gap-1 overflow-y-auto p-0">
            {results.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  onClick={() => onSelectHit(hit)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-[var(--radius-sm)] border border-solid border-transparent px-3 py-2 text-left",
                    "transition-colors hover:border-[var(--screening-border-strong)] hover:bg-[var(--screening-surface-hover)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
                    "focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
                  )}
                >
                  <span
                    className={cn(
                      aceTypography(ACE_TYPE.p1SemiBold),
                      "text-[var(--screening-text-primary)]",
                    )}
                  >
                    {hit.clientId}
                  </span>
                  <span
                    className={cn(
                      aceTypography(ACE_TYPE.p1Regular),
                      "text-[var(--screening-text-secondary)]",
                    )}
                  >
                    {hit.clientName}
                  </span>
                  <span
                    className={cn(
                      aceTypography(ACE_TYPE.captionSemiBold),
                      "text-[var(--screening-text-secondary)]",
                    )}
                  >
                    {hit.locationLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={cn(
              aceTypography(ACE_TYPE.p1Regular),
              "m-0 text-[var(--screening-text-secondary)]",
            )}
          >
            No clients match “{trimmed}”.
          </p>
        )
      ) : (
        <p
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "m-0 text-[var(--screening-text-secondary)]",
          )}
        >
          Start typing a client ID to search.
        </p>
      )}
    </DialogModal>
  );
}
