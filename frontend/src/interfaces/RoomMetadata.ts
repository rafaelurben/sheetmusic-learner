import type { RoomDto } from "@/api/generated/openapi/models/RoomDto.ts";

export default interface RoomMetadata {
  id: RoomDto["id"];
  title: RoomDto["title"];
  ownerId: RoomDto["ownerId"];
  pieceId?: RoomDto["pieceId"];
  playing?: RoomDto["playing"];
  lastPlaySectionPosition?: RoomDto["lastPlaySectionPosition"];
  lastPlayTimestamp?: RoomDto["lastPlayTimestamp"];
  tempoMultiplier?: RoomDto["tempoMultiplier"];
}
