/*
 * (C) 2026. - Rafael Urben
 */
import type PiecePermissionAddRequestDto from "@/interfaces/async/request/piece/PiecePermissionAddRequestDto.ts";
import type { PiecePermissionRemoveRequestDto } from "@/interfaces/async/request/piece/PiecePermissionRemoveRequestDto.ts";
import type { PiecePermissionUpdateRequestDto } from "@/interfaces/async/request/piece/PiecePermissionUpdateRequestDto.ts";
import type PieceScoreSheetRemoveRequestDto from "@/interfaces/async/request/piece/PieceScoreSheetRemoveRequestDto.ts";
import type PieceScoreSheetUpdateRequestDto from "@/interfaces/async/request/piece/PieceScoreSheetUpdateRequestDto.ts";
import type PieceSectionAddRequestDto from "@/interfaces/async/request/piece/PieceSectionAddRequestDto.ts";
import type { PieceSectionRemoveRequestDto } from "@/interfaces/async/request/piece/PieceSectionRemoveRequestDto.ts";
import type PieceSectionUpdateRequestDto from "@/interfaces/async/request/piece/PieceSectionUpdateRequestDto.ts";
import type PieceUpdateRequestDto from "@/interfaces/async/request/piece/PieceUpdateRequestDto.ts";
import type RoomChangePieceRequestDto from "@/interfaces/async/request/room/RoomChangePieceRequestDto.ts";
import type RoomChatMessageRequestDto from "@/interfaces/async/request/room/RoomChatMessageRequestDto.ts";
import type RoomControlPlaybackConfigRequestDto from "@/interfaces/async/request/room/RoomControlPlaybackConfigRequestDto.ts";
import type RoomControlPositionRequestDto from "@/interfaces/async/request/room/RoomControlPositionRequestDto.ts";
import type RoomUpdateRequestDto from "@/interfaces/async/request/room/RoomUpdateRequestDto.ts";
import { stompService } from "@/service/stompService.ts";

export const stompPublishingService = {
  pieceUpdate(pieceId: string, request: PieceUpdateRequestDto) {
    stompService.publish(`/app/piece.${pieceId}/update`, request);
  },
  pieceScoreSheetUpdate(
    pieceId: string,
    request: PieceScoreSheetUpdateRequestDto,
  ) {
    stompService.publish(`/app/piece.${pieceId}/score-sheet/update`, request);
  },
  pieceScoreSheetDelete(
    pieceId: string,
    request: PieceScoreSheetRemoveRequestDto,
  ) {
    stompService.publish(`/app/piece.${pieceId}/score-sheet/delete`, request);
  },
  pieceSectionAdd(pieceId: string, request: PieceSectionAddRequestDto) {
    stompService.publish(`/app/piece.${pieceId}/section/add`, request);
  },
  pieceSectionUpdate(pieceId: string, request: PieceSectionUpdateRequestDto) {
    stompService.publish(`/app/piece.${pieceId}/section/update`, request);
  },
  pieceSectionRemove(pieceId: string, request: PieceSectionRemoveRequestDto) {
    stompService.publish(`/app/piece.${pieceId}/section/remove`, request);
  },
  piecePermissionAdd(pieceId: string, request: PiecePermissionAddRequestDto) {
    stompService.publish(`/app/piece.${pieceId}/permission/add`, request);
  },
  piecePermissionUpdate(
    pieceId: string,
    request: PiecePermissionUpdateRequestDto,
  ) {
    stompService.publish(`/app/piece.${pieceId}/permission/update`, request);
  },
  piecePermissionRemove(
    pieceId: string,
    request: PiecePermissionRemoveRequestDto,
  ) {
    stompService.publish(`/app/piece.${pieceId}/permission/remove`, request);
  },
  roomUpdate(roomId: string, request: RoomUpdateRequestDto) {
    stompService.publish(`/app/room.${roomId}/update`, request);
  },
  roomChangePiece(roomId: string, request: RoomChangePieceRequestDto) {
    stompService.publish(`/app/room.${roomId}/change-piece`, request);
  },
  roomControlPlay(roomId: string) {
    stompService.publish(`/app/room.${roomId}/control/play`);
  },
  roomControlPause(roomId: string) {
    stompService.publish(`/app/room.${roomId}/control/pause`);
  },
  roomControlPosition(roomId: string, request: RoomControlPositionRequestDto) {
    stompService.publish(`/app/room.${roomId}/control/position`, request);
  },
  roomControlPlaybackConfig(
    roomId: string,
    request: RoomControlPlaybackConfigRequestDto,
  ) {
    stompService.publish(`/app/room.${roomId}/control/config`, request);
  },
  roomChat(roomId: string, request: RoomChatMessageRequestDto) {
    stompService.publish(`/app/room.${roomId}/chat`, request);
  },
} as const;
