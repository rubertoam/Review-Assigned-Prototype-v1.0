import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { sidebarIconButtonBorderedClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { cn } from "./ui/utils";

const COPY_CONFIRM_MS = 1600;

async function writeClipboardText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ClientProfileCopyButton({
  getText,
  label = "Copy section",
}: {
  getText: () => string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current != null) clearTimeout(clearTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const text = getText().trim();
    if (!text) return;
    const ok = await writeClipboardText(text);
    if (!ok) return;
    setCopied(true);
    if (clearTimerRef.current != null) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setCopied(false), COPY_CONFIRM_MS);
  }, [getText]);

  return (
    <AceTooltip open={copied ? true : undefined}>
      <AceTooltipTrigger asChild>
        <button
          type="button"
          aria-label={copied ? "Copied" : label}
          onClick={(event) => {
            event.stopPropagation();
            void handleCopy();
          }}
          className={cn(sidebarIconButtonBorderedClass, "size-6")}
        >
          <MaterialSymbol
            name={copied ? "check" : "content_copy"}
            size="sm"
            className="text-current"
          />
        </button>
      </AceTooltipTrigger>
      <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
        {copied ? "Copied" : "Copy"}
      </AceTooltipContent>
    </AceTooltip>
  );
}

export function ClientProfileCopyablePanel({
  children,
  getCopyText,
  copyLabel,
  className,
}: {
  children: ReactNode;
  getCopyText: () => string;
  copyLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col gap-2 self-stretch rounded border border-[#cfd2d9] bg-white p-6 pr-12 dark:border-[#38414a] dark:bg-[#22272b]",
        className,
      )}
    >
      <div className="absolute right-3 top-3 z-[1]">
        <ClientProfileCopyButton getText={getCopyText} label={copyLabel} />
      </div>
      {children}
    </div>
  );
}
