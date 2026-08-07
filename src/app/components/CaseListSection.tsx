import type { ReactNode } from "react";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceChevronIconClass } from "@ace-ds/lib/aceChevron";
import { AnimatedCollapse } from "./AnimatedCollapse";
import { durationAccordion, easeAccordion } from "./ExpandableFinScanTable";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

function SectionCountBadge({ count }: { count: number }) {
  return (
    <AceBadge appearance="tag" variant="gray" className="ms-auto">
      {count}
    </AceBadge>
  );
}

export interface CaseListSectionProps {
  title: string;
  count: number;
  /** When true, section header toggles body visibility. */
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Omit the entire section when count is zero. */
  hideWhenEmpty?: boolean;
  /** Pin the section title + count to the top of the scroll container. */
  stickyHeader?: boolean;
  emptyContent?: ReactNode;
  children: ReactNode;
}

export function CaseListSection({
  title,
  count,
  collapsible = true,
  expanded = true,
  onExpandedChange,
  hideWhenEmpty = false,
  stickyHeader = false,
  emptyContent,
  children,
}: CaseListSectionProps) {
  if (hideWhenEmpty && count === 0) return null;

  const body = count === 0 && emptyContent ? emptyContent : children;

  const headerLabel = (
    <span
      className="font-['Noto_Sans:SemiBold',sans-serif] text-[13px] text-[#464c59] dark:text-[#9fadbc]"
      style={notoVar}
    >
      {title}
    </span>
  );

  const stickyHeaderClass = stickyHeader
    ? // Above case-row selection chrome (z-20); solid fill so rows never show through.
      "sticky top-0 z-30 border-b border-[#cfd2d9] dark:border-[#38414a]"
    : undefined;
  const stickyHeaderStyle = stickyHeader
    ? ({ backgroundColor: "var(--screening-surface)" } as const)
    : undefined;

  if (!collapsible) {
    return (
      <div
        className={cn(
          !stickyHeader && "border-t border-[#cfd2d9] dark:border-[#38414a]",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 px-4 py-2.5",
            stickyHeaderClass,
          )}
          style={stickyHeaderStyle}
        >
          {headerLabel}
          <SectionCountBadge count={count} />
        </div>
        {body}
      </div>
    );
  }

  return (
    <div className="border-t border-[#cfd2d9] dark:border-[#38414a]">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onExpandedChange?.(!expanded)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[#eff0f2] dark:hover:bg-[#2c333a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#523eb9]/35",
          stickyHeaderClass,
        )}
        style={stickyHeaderStyle}
      >
        <MaterialSymbol
          name="keyboard_arrow_right"
          size="md"
          className={cn(
            aceChevronIconClass,
            "text-[#464c59] dark:text-[#9fadbc]",
            "origin-center transition-transform",
            durationAccordion,
            easeAccordion,
            expanded && "rotate-90",
          )}
        />
        {headerLabel}
        <SectionCountBadge count={count} />
      </button>
      <AnimatedCollapse open={expanded}>{body}</AnimatedCollapse>
    </div>
  );
}
