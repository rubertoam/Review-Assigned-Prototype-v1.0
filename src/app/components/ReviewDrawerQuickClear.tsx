import { AceDropdownMenu } from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";

/** Placeholder Quick Clear control for Review panel Version B. */
export function ReviewDrawerQuickClear() {
  return (
    <AceDropdownMenu
      triggerLabel="Quick Clear"
      triggerMode="field"
      size="sm"
      align="end"
      showChevron
      className="shrink-0 font-['Noto_Sans:Regular',sans-serif] font-normal text-[var(--screening-primary)]"
      items={[
        {
          type: "item",
          label: "Quick Clear",
          disabled: true,
        },
      ]}
    />
  );
}
