import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatedCollapse } from "./AnimatedCollapse";
import { durationAccordion, easeAccordion } from "./ExpandableFinScanTable";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const countBadgeClass =
  "ms-auto flex items-center justify-center rounded-[4px] border border-[#cfd2d9] bg-[#f5f6f8] px-1.5 py-0.5 dark:border-[#38414a] dark:bg-[#333a42]";

function SectionCountBadge({ count }: { count: number }) {
  return (
    <span className={countBadgeClass}>
      <span
        className="font-['Noto_Sans:Bold',sans-serif] text-[12px] text-[#6a7285] dark:text-[#9fadbc]"
        style={notoVar}
      >
        {count}
      </span>
    </span>
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

  if (!collapsible) {
    return (
      <div className="border-t border-[#cfd2d9] dark:border-[#38414a]">
        <div className="flex w-full items-center gap-2 px-4 py-2.5">
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
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[#eff0f2] dark:hover:bg-[#2c333a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#523eb9]/35"
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-[#464c59] dark:text-[#9fadbc]",
            "origin-center transition-transform",
            durationAccordion,
            easeAccordion,
            expanded && "rotate-90",
          )}
          aria-hidden
        />
        {headerLabel}
        <SectionCountBadge count={count} />
      </button>
      <AnimatedCollapse open={expanded}>{body}</AnimatedCollapse>
    </div>
  );
}
