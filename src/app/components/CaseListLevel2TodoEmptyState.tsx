const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function CaseListLevel2TodoEmptyState() {
  return (
    <div className="px-4 py-8 text-center">
      <p
        className="m-0 font-['Noto_Sans:Regular',sans-serif] text-[13px] leading-[1.65] text-[var(--ace-neutral-800)]"
        style={notoVar}
      >
        Work pending Level 1 review.
      </p>
    </div>
  );
}
