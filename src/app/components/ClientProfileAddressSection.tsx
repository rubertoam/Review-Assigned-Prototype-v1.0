import { useMemo, useState } from "react";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const clientBodyLineTextClass =
  "m-0 font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]";

const clientBodyNotoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

function ClientProfileLocationPinIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 16 23"
      aria-hidden
    >
      <path
        d="M8 0C3.57714 0 0 3.5995 0 8.05C0 14.0875 8 23 8 23C8 23 16 14.0875 16 8.05C16 3.5995 12.4229 0 8 0ZM8 10.925C6.42286 10.925 5.14286 9.637 5.14286 8.05C5.14286 6.463 6.42286 5.175 8 5.175C9.57714 5.175 10.8571 6.463 10.8571 8.05C10.8571 9.637 9.57714 10.925 8 10.925Z"
        fill="#523EB9"
      />
    </svg>
  );
}

export function ClientProfileAddressSection({
  addressLines,
}: {
  addressLines: readonly string[];
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const fullAddress = useMemo(() => addressLines.join(", "), [addressLines]);
  const mapSrc = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=14&output=embed`,
    [fullAddress],
  );

  return (
    <>
      <AceTooltip>
        <AceTooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className={cn(
              "-m-1 flex w-full items-start gap-2.5 rounded-[4px] p-1 text-left transition-colors",
              "hover:bg-[#f5f6f8] dark:hover:bg-[#2c333a]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#22272b]",
            )}
            aria-label={`View map for ${fullAddress}`}
          >
            <div className="h-[23px] w-[16px] shrink-0">
              <ClientProfileLocationPinIcon />
            </div>
            <div
              className={cn(
                clientBodyLineTextClass,
                "underline-offset-2 transition-[text-decoration-color] hover:underline hover:decoration-[#523eb9]/40",
              )}
              style={clientBodyNotoVar}
            >
              {addressLines.map((line, lineIdx) => (
                <p key={lineIdx} className="m-0 leading-[1.65]">
                  {line}
                </p>
              ))}
            </div>
          </button>
        </AceTooltipTrigger>
        <AceTooltipContent side="top" variant="screening-toolbar">
          View Map
        </AceTooltipContent>
      </AceTooltip>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="flex !h-[min(85vh,780px)] !max-h-[min(85vh,780px)] !max-w-[min(calc(100vw-2rem),875px)] flex-col gap-0 overflow-hidden rounded-[4px] border-[#cfd2d9] bg-white p-0 dark:border-[#38414a] dark:bg-[#22272b] sm:!max-w-[min(calc(100vw-2rem),875px)]">
          <DialogHeader className="shrink-0 border-b border-[#cfd2d9] px-6 py-4 text-left dark:border-[#38414a]">
            <DialogTitle
              className={cn(
                aceTypography(ACE_TYPE.h6Bold),
                "text-[var(--screening-text-primary)]",
              )}
            >
              Address
            </DialogTitle>
          </DialogHeader>
          <div className="shrink-0 px-6 pt-4">
            <p
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "m-0 text-[var(--screening-text-secondary)]",
              )}
            >
              {fullAddress}
            </p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-6 pt-4">
            <div className="flex min-h-0 flex-1 overflow-hidden rounded-[4px] border border-[#cfd2d9] dark:border-[#38414a]">
              <iframe
                title={`Map for ${fullAddress}`}
                src={mapSrc}
                className="block h-full min-h-0 w-full flex-1 border-0 bg-[#eff0f2] dark:bg-[#2c333a]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
