/*
 * (C) 2026. - Rafael Urben
 */

export default interface PieceSectionAddRequestDto {
  position: number;
  name: string;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  barCount: number;
  bpm: number;
  scoreSheetId: string | null;
  posX1: number | null;
  posY1: number | null;
  posX2: number | null;
  posY2: number | null;
}
