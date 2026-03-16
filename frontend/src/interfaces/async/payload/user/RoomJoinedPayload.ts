/*
 * (C) 2026. - Rafael Urben
 */
import type { RoomDto } from "@/api/generated/openapi/models/RoomDto.ts";

export default interface RoomJoinedPayload {
  room: RoomDto;
}
