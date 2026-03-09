/*
 * (C) 2026. - Rafael Urben
 */

import type RoomMetadata from "@/interfaces/RoomMetadata.ts";
import type PieceMetadata from "@/interfaces/PieceMetadata.ts";
import type { SectionDto } from "@/api/generated/openapi/models/SectionDto.ts";
import type { UserDto } from "@/api/generated/openapi/models/UserDto.ts";
import type { PermissionType } from "@/api/generated/openapi/models/PermissionType.ts";
import type { PieceDto } from "@/api/generated/openapi/models/PieceDto.ts";
import type { RoomDto } from "@/api/generated/openapi/models/RoomDto.ts";

export type GeneralEventDto =
  | {
      type: "piece-now-available";
      payload: {
        piece: PieceMetadata;
      };
    }
  | {
      type: "piece-metadata-updated";
      payload: {
        piece: PieceMetadata;
      };
    }
  | {
      type: "piece-now-unavailable";
      payload: {
        pieceId: string;
      };
    }
  | {
      type: "room-now-available";
      payload: {
        room: RoomMetadata;
      };
    }
  | {
      type: "room-metadata-updated";
      payload: {
        room: RoomMetadata;
      };
    }
  | {
      type: "room-now-unavailable";
      payload: {
        roomId: string;
      };
    };

export type PieceEventDto =
  | {
      type: "metadata-updated";
      payload: {
        piece: PieceMetadata;
      };
    }
  | {
      type: "section-added";
      payload: {
        section: SectionDto;
      };
    }
  | {
      type: "section-updated";
      payload: {
        sectionId: string;
        section: SectionDto;
      };
    }
  | {
      type: "section-removed";
      payload: {
        sectionId: string;
      };
    }
  | {
      type: "permission-added";
      payload: {
        user: UserDto;
        permissionType: PermissionType;
      };
    }
  | {
      type: "permission-updated";
      payload: {
        userId: string;
        permissionType: PermissionType;
      };
    }
  | {
      type: "permission-removed";
      payload: {
        userId: string;
      };
    };

// Room

export interface ChatMessageDto {
  messageId: string;
  sender: UserDto;
  content: string;
  timestamp: string;
}

export type RoomEventDto =
  | {
      type: "metadata-updated";
      payload: {
        room: RoomMetadata;
      };
    }
  | {
      type: "piece-changed";
      payload: {
        piece: PieceDto;
      };
    }
  | {
      type: "playback-started";
      payload: Record<string, never>;
    }
  | {
      type: "playback-paused";
      payload: Record<string, never>;
    }
  | {
      type: "position-changed";
      payload: {
        current_section_position: number;
      };
    }
  | {
      type: "chat-message";
      payload: ChatMessageDto;
    };

export type UserEventDto =
  | {
      type: "error";
      payload: {
        error: string;
        message: string;
      };
    }
  | {
      type: "room-joined";
      payload: {
        room: RoomDto;
      };
    };

export type EventDto =
  | GeneralEventDto
  | PieceEventDto
  | RoomEventDto
  | UserEventDto;
