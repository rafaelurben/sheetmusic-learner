/*
 * (C) 2026. - Rafael Urben
 */
import type { RoomMetadataDto } from "@/api/generated/openapi/models/RoomMetadataDto";

export default interface RoomNowAvailablePayload {
  room: RoomMetadataDto;
}
