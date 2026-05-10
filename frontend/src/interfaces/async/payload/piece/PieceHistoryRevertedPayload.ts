import type { PieceDto } from "@/api/generated/openapi";

/*
 * (C) 2026. - Rafael Urben
 */
export default interface PieceHistoryRevertedPayload {
  piece: PieceDto;
}
