/*
 * (C) 2026. - Rafael Urben
 */
import type PieceMetadata from "@/interfaces/PieceMetadata.ts";

export default interface MetadataUpdatedPayload {
  piece: PieceMetadata;
}
