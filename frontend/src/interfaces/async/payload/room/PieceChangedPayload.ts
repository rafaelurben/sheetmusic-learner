/*
 * (C) 2026. - Rafael Urben
 */
import type { PieceDto } from "@/api/generated/openapi/models/PieceDto.ts";

export default interface PieceChangedPayload {
  piece: PieceDto;
}
