/*
 * (C) 2026. - Rafael Urben
 */

import type { ScoreSheetDto } from "@/api/generated/openapi/models/ScoreSheetDto.ts";

export default interface ScoreSheetUpdatedPayload {
  scoreSheetId: string;
  scoreSheet: ScoreSheetDto;
}
