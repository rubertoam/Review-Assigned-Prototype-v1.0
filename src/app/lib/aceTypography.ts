/** Maps ACE typography tokens (`typography-tokens.css`) to Tailwind arbitrary properties. */
export function aceTypography(token: string) {
  return `[font:var(${token})] [letter-spacing:var(${token}-tracking)]`;
}

export const ACE_TYPE = {
  h6Bold: "--ace-type-heading-h6-bold",
  h6SmallBold: "--ace-type-heading-h6-small-bold",
  h6SmallSemiBold: "--ace-type-heading-h6-small-semi-bold",
  p1Regular: "--ace-type-paragraph-p1-regular",
  p1Bold: "--ace-type-paragraph-p1-bold",
  p1SemiBold: "--ace-type-paragraph-p1-semi-bold",
  captionBold: "--ace-type-caption-bold",
  captionSemiBold: "--ace-type-caption-semi-bold",
  labelBold: "--ace-type-label-bold",
  footerRegular: "--ace-type-footer-regular",
} as const;
