/** Fixed-height accordion header row (`--screening-header-min-height` = 3.5rem). */
export const aceAccordionFixedHeaderClass =
  "[&>button]:h-[var(--screening-header-min-height)] [&>button]:min-h-[var(--screening-header-min-height)] [&>button]:items-center [&>button]:py-0";

/**
 * Fill + scroll chain for a flex-sized `AceAccordion` body without switching the
 * panel region off `display: grid` (grid is required for ACE expand/collapse motion).
 */
export const aceAccordionPanelFillClass =
  "[&>[role=region]]:min-h-0 [&>[role=region]]:flex-1 [&>[role=region]>div]:min-h-0 [&>[role=region]>div]:h-full [&>[role=region]>div>div]:flex [&>[role=region]>div>div]:h-full [&>[role=region]>div>div]:min-h-0 [&>[role=region]>div>div]:flex-col";
