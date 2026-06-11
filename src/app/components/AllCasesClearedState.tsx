import { RefreshCw } from "lucide-react";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function AllCasesClearedState() {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-6 py-16 text-center",
        aceDropShadowXsClass,
      )}
    >
      <p
        className="m-0 max-w-sm font-['Noto_Sans:Regular',sans-serif] text-[14px] leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
        style={notoVar}
      >
        All cases have been cleared.
      </p>
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
        <RefreshCw className="size-3.5 shrink-0" aria-hidden />
        Refresh
      </Button>
    </div>
  );
}
