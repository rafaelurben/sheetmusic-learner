/*
 * (C) 2026. - Rafael Urben
 */

export interface SectionFormState {
  position: number;
  timeSignatureNumerator: number | null;
  timeSignatureDenominator: number | null;
  barCount: number | null;
  bpm: number | null;
  scoreSheetId: string;
}

export const UNASSIGNED_SCORE_SHEET_VALUE = "__none__";
