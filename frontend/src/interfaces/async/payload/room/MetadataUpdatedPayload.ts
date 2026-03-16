/*
 * (C) 2026. - Rafael Urben
 */
import type RoomMetadata from "@/interfaces/RoomMetadata.ts";

export default interface MetadataUpdatedPayload {
  room: RoomMetadata;
}
