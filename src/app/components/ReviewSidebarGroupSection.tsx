import { ChevronRight } from "lucide-react";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { SidebarNavCountBadge } from "./SidebarNavCountBadge";
import { cn } from "./ui/utils";

export type ReviewSidebarGroupItem = {
  id: string;
  label: string;
  count: number;
  badgeLabelClass: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export type ReviewSidebarGroupSectionProps = {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  items: ReviewSidebarGroupItem[];
};

const ease = "[transition-timing-function:var(--ace-motion-ease-standard)]";

export function ReviewSidebarGroupSection({
  label,
  expanded,
  onToggle,
  items,
}: ReviewSidebarGroupSectionProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[var(--radius-sm)]",
        expanded && "border-[0.5px] border-solid border-[var(--ace-sidebar-group-expanded-border)]",
      )}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${label} group`}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-[var(--ace-sidebar-item-radius)] border-0 bg-transparent px-2 py-2 text-left outline-none",
          "text-[var(--screening-text-primary)] transition-colors duration-[var(--ace-motion-duration-fast)]",
          ease,
          !expanded && "hover:bg-[var(--ace-sidebar-item-hover-bg)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-1",
        )}
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-[var(--screening-text-primary)] transition-transform duration-[var(--ace-sidebar-duration-expand)]",
            ease,
            expanded && "rotate-90",
          )}
          aria-hidden
        />
        <span
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "min-w-0 flex-1 truncate text-sm leading-[1.3125rem]",
          )}
        >
          {label}
        </span>
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-[var(--ace-sidebar-duration-expand)]",
          ease,
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {expanded ? (
            <div className="flex flex-col gap-1 px-2 pb-2 pt-0">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group/row relative flex items-center rounded-[var(--ace-sidebar-item-radius)]",
                    item.selected
                      ? "bg-[var(--ace-sidebar-item-selected-bg)] text-[var(--ace-sidebar-item-selected-text)]"
                      : item.disabled
                        ? "text-[var(--screening-text-muted)]"
                        : "text-[var(--screening-text-primary)] hover:bg-[var(--ace-sidebar-item-hover-bg)]",
                  )}
                >
                  <button
                    type="button"
                    disabled={item.disabled}
                    aria-label={`${item.label}, ${item.count}`}
                    aria-current={item.selected ? "page" : undefined}
                    onClick={item.onSelect}
                    className={cn(
                      "flex min-w-0 flex-1 items-center border-0 bg-transparent px-3 py-1.5 text-left outline-none",
                      "transition-colors duration-[var(--ace-motion-duration-fast)] [transition-timing-function:var(--ace-motion-ease-standard)]",
                      item.disabled
                        ? "cursor-not-allowed"
                        : "cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
                    )}
                  >
                    <span
                      className={cn(
                        aceTypography(ACE_TYPE.p1Regular),
                        "min-w-0 flex-1 truncate text-sm leading-[1.3125rem]",
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                  <SidebarNavCountBadge count={item.count} badgeLabelClass={item.badgeLabelClass} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
