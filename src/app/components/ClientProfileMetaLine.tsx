import type { ReactNode } from "react";
import { cn } from "./ui/utils";

const clientMetaLineClass =
  "m-0 font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]";

const clientMetaNotoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function MetaDot() {
  return (
    <span
      className="inline-block size-1 shrink-0 rounded-full bg-[#523eb9] dark:bg-[#8696a7]"
      aria-hidden
    />
  );
}

export function ClientProfileMetaLine({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(clientMetaLineClass, className)} style={clientMetaNotoVar}>
      <span className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        <MetaDot />
        <span>{children}</span>
      </span>
    </p>
  );
}
