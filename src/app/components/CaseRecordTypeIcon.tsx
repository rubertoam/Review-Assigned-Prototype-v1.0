/**
 * Case-list / client-profile record-type glyphs (Individual, Organization, Unknown).
 */
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import svgPaths from "../../imports/ReviewAssignedAllCollapsed/svg-e16bopzh98";
import type { CaseRecordType } from "../lib/reviewCaseData";
import { cn } from "./ui/utils";

const RECORD_TYPE_LABEL: Record<CaseRecordType, string> = {
  individual: "Individual",
  organization: "Organization",
  unknown: "Unknown",
};

/** Matches AceBadge overdue “!” via `--ace-badge-tag-warning-icon-size` (0.75rem). */
const TAG_ICON_SHELL =
  "inline-flex size-[var(--ace-badge-tag-warning-icon-size)] shrink-0 items-center justify-center";

/** Case-list row / card glyph (16px). */
const LIST_ICON_SHELL: Record<CaseRecordType, string> = {
  individual: "inline-flex size-4 shrink-0 items-center justify-center",
  organization: "inline-flex h-[15px] w-4 shrink-0 items-center justify-center",
  unknown: "inline-flex size-4 shrink-0 items-center justify-center text-[#523EB9]",
};

export function CaseRecordTypeIcon({
  recordType,
  size = "list",
  className,
}: {
  recordType: CaseRecordType;
  /** `tag` matches overdue warning icon size inside AceBadge tags. */
  size?: "list" | "tag";
  className?: string;
}) {
  const label = RECORD_TYPE_LABEL[recordType];
  const shell = cn(
    size === "tag" ? TAG_ICON_SHELL : LIST_ICON_SHELL[recordType],
    size === "tag" && recordType === "unknown" && "text-[#523EB9]",
    className,
  );

  if (recordType === "organization") {
    return (
      <span className={shell} title={label} aria-label={label}>
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 16 15"
          aria-hidden
        >
          <path d={svgPaths.p1ac17500} fill="var(--fill-0, #523EB9)" />
        </svg>
      </span>
    );
  }

  if (recordType === "unknown") {
    return (
      <span className={shell} title={label} aria-label={label}>
        <MaterialSymbol
          name="help"
          size="lg"
          className="text-current"
          style={
            size === "tag"
              ? {
                  display: "inline-flex",
                  width: "100%",
                  height: "100%",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                }
              : undefined
          }
        />
      </span>
    );
  }

  return (
    <span className={shell} title={label} aria-label={label}>
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 16 16"
        aria-hidden
      >
        <path d={svgPaths.p8c3ef80} fill="var(--fill-0, #523EB9)" />
      </svg>
    </span>
  );
}
