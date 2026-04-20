/*
 * (C) 2026. - Rafael Urben
 */

import type PiecePermissionAddRequestDto from "@/interfaces/async/request/piece/PiecePermissionAddRequestDto.ts";
import type { PiecePermissionRemoveRequestDto } from "@/interfaces/async/request/piece/PiecePermissionRemoveRequestDto.ts";
import type { PiecePermissionUpdateRequestDto } from "@/interfaces/async/request/piece/PiecePermissionUpdateRequestDto.ts";
import type PieceSectionAddRequestDto from "@/interfaces/async/request/piece/PieceSectionAddRequestDto.ts";
import type PieceScoreSheetRemoveRequestDto from "@/interfaces/async/request/piece/PieceScoreSheetRemoveRequestDto.ts";
import type PieceScoreSheetUpdateRequestDto from "@/interfaces/async/request/piece/PieceScoreSheetUpdateRequestDto.ts";
import type { PieceSectionRemoveRequestDto } from "@/interfaces/async/request/piece/PieceSectionRemoveRequestDto.ts";
import type PieceSectionUpdateRequestDto from "@/interfaces/async/request/piece/PieceSectionUpdateRequestDto.ts";
import type PieceUpdateRequestDto from "@/interfaces/async/request/piece/PieceUpdateRequestDto.ts";
import type RoomChangePieceRequestDto from "@/interfaces/async/request/room/RoomChangePieceRequestDto.ts";
import type RoomChatMessageRequestDto from "@/interfaces/async/request/room/RoomChatMessageRequestDto.ts";
import type RoomControlPositionRequestDto from "@/interfaces/async/request/room/RoomControlPositionRequestDto.ts";
import type RoomControlPlaybackConfigRequestDto from "@/interfaces/async/request/room/RoomControlPlaybackConfigRequestDto.ts";
import type RoomUpdateRequestDto from "@/interfaces/async/request/room/RoomUpdateRequestDto.ts";

export type RequestDto =
  | PieceUpdateRequestDto
  | PieceScoreSheetUpdateRequestDto
  | PieceScoreSheetRemoveRequestDto
  | PieceSectionAddRequestDto
  | PieceSectionUpdateRequestDto
  | PieceSectionRemoveRequestDto
  | PiecePermissionAddRequestDto
  | PiecePermissionUpdateRequestDto
  | PiecePermissionRemoveRequestDto
  | RoomUpdateRequestDto
  | RoomChangePieceRequestDto
  | RoomControlPositionRequestDto
  | RoomControlPlaybackConfigRequestDto
  | RoomChatMessageRequestDto;
