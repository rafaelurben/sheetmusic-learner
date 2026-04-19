/*
 * (C) 2026. - Rafael Urben
 */

import type PieceSectionAddRequestDto from "@/interfaces/async/request/piece/PieceSectionAddRequestDto.ts";
import { toast } from "sonner";

export interface SectionFormState {
  position: number;
  name: string;
  timeSignatureNumerator: number | null;
  timeSignatureDenominator: number | null;
  barCount: number | null;
  bpm: number | null;
  scoreSheetId: string;
  posX1: number;
  posY1: number;
  posX2: number;
  posY2: number;
}

export const UNASSIGNED_SCORE_SHEET_VALUE = "__none__";

export function buildSectionPayloadFromForm(
  form: SectionFormState,
): PieceSectionAddRequestDto | null {
  if (
    !form.name.trim() ||
    !form.timeSignatureNumerator ||
    !form.timeSignatureDenominator ||
    !form.barCount ||
    !form.bpm
  ) {
    toast.error("Name, time signature, bars, and BPM are required.");
    return null;
  }

  return {
    position: form.position,
    name: form.name.trim(),
    timeSignatureNumerator: form.timeSignatureNumerator,
    timeSignatureDenominator: form.timeSignatureDenominator,
    barCount: form.barCount,
    bpm: form.bpm,
    scoreSheetId:
      form.scoreSheetId === UNASSIGNED_SCORE_SHEET_VALUE
        ? null
        : form.scoreSheetId,
    posX1: form.posX1,
    posY1: form.posY1,
    posX2: form.posX2,
    posY2: form.posY2,
  };
}
