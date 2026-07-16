import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { Button } from "./ui/button";
import { ReviewPanelEmptyState } from "./ReviewPanelEmptyState";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function AllCasesClearedState() {
  return (
    <ReviewPanelEmptyState message="All cases have been cleared.">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-8 gap-1.5 rounded-[4px] border-[#cfd2d9] bg-white px-3 text-[13px] font-['Noto_Sans:SemiBold',sans-serif] text-[#23262c] shadow-none",
          "dark:border-[#38414a] dark:bg-[#22272b] dark:text-[#b6c2cf]",
        )}
        style={notoVar}
      >
        <MaterialSymbol name="autorenew" size="sm" />
        Refresh
      </Button>
    </ReviewPanelEmptyState>
  );
}
