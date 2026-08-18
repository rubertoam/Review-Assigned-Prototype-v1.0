import type { ReactNode } from "react";

export type TextDiffSegment = {
  text: string;
  changed: boolean;
};

/** Split into words and whitespace so shared separators stay unhighlighted. */
function tokenize(value: string): string[] {
  return value.match(/\s+|[^\s]+/g) ?? [];
}

/** LCS table for token equality (Myers-light DP). */
function longestCommonSubsequence(
  left: readonly string[],
  right: readonly string[],
): boolean[] {
  const m = left.length;
  const n = right.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i]![j] =
        left[i - 1] === right[j - 1]
          ? dp[i - 1]![j - 1]! + 1
          : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }

  const keep = Array(m).fill(false);
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (left[i - 1] === right[j - 1]) {
      keep[i - 1] = true;
      i -= 1;
      j -= 1;
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return keep;
}

/**
 * Character-level segments when both sides are a single word that share ends
 * (e.g. John → Johnny highlights "ny").
 */
function characterDiffSegments(value: string, other: string): TextDiffSegment[] {
  let start = 0;
  const minLen = Math.min(value.length, other.length);
  while (start < minLen && value[start] === other[start]) start += 1;

  let endValue = value.length;
  let endOther = other.length;
  while (
    endValue > start &&
    endOther > start &&
    value[endValue - 1] === other[endOther - 1]
  ) {
    endValue -= 1;
    endOther -= 1;
  }

  const segments: TextDiffSegment[] = [];
  if (start > 0) segments.push({ text: value.slice(0, start), changed: false });
  if (endValue > start) {
    segments.push({ text: value.slice(start, endValue), changed: true });
  }
  if (endValue < value.length) {
    segments.push({ text: value.slice(endValue), changed: false });
  }
  return segments.length > 0 ? segments : [{ text: value, changed: true }];
}

/**
 * Build highlight segments for `value` relative to `other`.
 * Unchanged tokens stay plain; added/replaced tokens are marked changed.
 */
export function diffTextSegments(value: string, other: string): TextDiffSegment[] {
  if (value === other) return value ? [{ text: value, changed: false }] : [];
  if (!value) return [];
  if (!other) return [{ text: value, changed: true }];

  const valueTokens = tokenize(value);
  const otherTokens = tokenize(other);
  const valueWords = valueTokens.filter((token) => !/^\s+$/.test(token));
  const otherWords = otherTokens.filter((token) => !/^\s+$/.test(token));

  if (valueWords.length === 1 && otherWords.length === 1) {
    return characterDiffSegments(value, other);
  }

  const keep = longestCommonSubsequence(valueTokens, otherTokens);
  const segments: TextDiffSegment[] = [];

  for (let i = 0; i < valueTokens.length; i += 1) {
    const text = valueTokens[i]!;
    const changed = !keep[i];
    const last = segments[segments.length - 1];
    if (last && last.changed === changed) {
      last.text += text;
    } else {
      segments.push({ text, changed });
    }
  }

  return segments;
}

export function renderDiffHighlightedText(
  value: string,
  other: string,
  highlightClassName: string,
): ReactNode {
  const segments = diffTextSegments(value, other);
  if (segments.length === 0) return value;

  return segments.map((segment, index) =>
    segment.changed ? (
      <mark
        key={index}
        className={`${highlightClassName} rounded-sm px-0.5 text-inherit`}
      >
        {segment.text}
      </mark>
    ) : (
      <span key={index}>{segment.text}</span>
    ),
  );
}
