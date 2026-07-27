import {
  CLIENT_PROFILES,
  type ClientRiskBand,
  riskBandPresentation,
} from "./reviewCaseData";

export type ClientRiskRatingSummary = {
  ratingLabel: string;
  ratingBand: ClientRiskBand;
  score: number;
  cip: number;
  screeningResults: number;
};

export type ClientRiskHistoryRow = {
  ratingLabel: string;
  score: number;
  cip: number;
  screeningResults: number;
  modifyDate: string;
};

export type ClientRiskRatingData = {
  summary: ClientRiskRatingSummary;
  history: readonly ClientRiskHistoryRow[];
};

function caseUnit(caseIndex: number, salt: number): number {
  const x = Math.sin((caseIndex + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function shortRatingLabel(band: ClientRiskBand): string {
  if (band === "high") return "High";
  if (band === "medium") return "Medium";
  return "Low";
}

function scoresForBand(band: ClientRiskBand, caseIndex: number): {
  score: number;
  cip: number;
  screeningResults: number;
} {
  if (band === "low") {
    return {
      score: 5,
      cip: 5,
      screeningResults: 0,
    };
  }
  if (band === "medium") {
    return {
      score: 12 + Math.floor(caseUnit(caseIndex, 3) * 8),
      cip: 8 + Math.floor(caseUnit(caseIndex, 4) * 6),
      screeningResults: 1 + Math.floor(caseUnit(caseIndex, 5) * 4),
    };
  }
  return {
    score: 22 + Math.floor(caseUnit(caseIndex, 6) * 12),
    cip: 14 + Math.floor(caseUnit(caseIndex, 7) * 8),
    screeningResults: 3 + Math.floor(caseUnit(caseIndex, 8) * 6),
  };
}

function formatModifyDate(caseIndex: number, versionIndex: number): string {
  if (caseIndex === 0 && versionIndex === 0) {
    return "16 Jul 2026 3:39:08 PM";
  }
  const day = 1 + Math.floor(caseUnit(caseIndex, 20 + versionIndex) * 27);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
  const month = months[Math.floor(caseUnit(caseIndex, 21 + versionIndex) * months.length)]!;
  const year = 2025 + Math.floor(caseUnit(caseIndex, 22 + versionIndex) * 2);
  const hour = 1 + Math.floor(caseUnit(caseIndex, 23 + versionIndex) * 11);
  const minute = Math.floor(caseUnit(caseIndex, 24 + versionIndex) * 60)
    .toString()
    .padStart(2, "0");
  const second = Math.floor(caseUnit(caseIndex, 25 + versionIndex) * 60)
    .toString()
    .padStart(2, "0");
  const period = caseUnit(caseIndex, 26 + versionIndex) > 0.5 ? "PM" : "AM";
  return `${day} ${month} ${year} ${hour}:${minute}:${second} ${period}`;
}

/** Risk rating text color class aligned with profile risk band presentation. */
export function riskRatingValueClass(band: ClientRiskBand): string {
  return riskBandPresentation(band).text;
}

/** Seeded risk rating summary + history for a case (newest history row first). */
export function initialRiskRatingForCase(caseIndex: number): ClientRiskRatingData {
  const profile = CLIENT_PROFILES[Math.max(0, Math.min(caseIndex, CLIENT_PROFILES.length - 1))]!;
  const band = profile.riskBand;
  const ratingLabel = shortRatingLabel(band);
  const current = scoresForBand(band, caseIndex);

  const historyCount = 1 + Math.floor(caseUnit(caseIndex, 1) * 2);
  const history: ClientRiskHistoryRow[] = Array.from({ length: historyCount }, (_, versionIndex) => {
    if (versionIndex === 0) {
      return {
        ratingLabel,
        score: current.score,
        cip: current.cip,
        screeningResults: current.screeningResults,
        modifyDate: formatModifyDate(caseIndex, versionIndex),
      };
    }
    const olderBand: ClientRiskBand =
      band === "high" ? "medium" : band === "medium" ? "low" : "low";
    const older = scoresForBand(olderBand, caseIndex + versionIndex * 3);
    return {
      ratingLabel: shortRatingLabel(olderBand),
      score: older.score,
      cip: older.cip,
      screeningResults: older.screeningResults,
      modifyDate: formatModifyDate(caseIndex, versionIndex),
    };
  });

  return {
    summary: {
      ratingLabel,
      ratingBand: band,
      score: current.score,
      cip: current.cip,
      screeningResults: current.screeningResults,
    },
    history,
  };
}
