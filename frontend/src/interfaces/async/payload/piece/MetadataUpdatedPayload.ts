/*
 * (C) 2026. - Rafael Urben
 */
import type { PieceMetadataDto } from "@/api/generated/openapi";

export default interface MetadataUpdatedPayload {
  piece: PieceMetadataDto;
}
