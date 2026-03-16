/*
 * (C) 2026. - Rafael Urben
 */

import type PieceMetadataUpdatedPayload from "@/interfaces/async/payload/general/PieceMetadataUpdatedPayload.ts";
import type PieceNowAvailablePayload from "@/interfaces/async/payload/general/PieceNowAvailablePayload.ts";
import type PieceNowUnavailablePayload from "@/interfaces/async/payload/general/PieceNowUnavailablePayload.ts";
import type RoomMetadataUpdatedPayload from "@/interfaces/async/payload/general/RoomMetadataUpdatedPayload.ts";
import type RoomNowAvailablePayload from "@/interfaces/async/payload/general/RoomNowAvailablePayload.ts";
import type RoomNowUnavailablePayload from "@/interfaces/async/payload/general/RoomNowUnavailablePayload.ts";
import type MetadataUpdatedPayload from "@/interfaces/async/payload/piece/MetadataUpdatedPayload.ts";
import type PermissionAddedPayload from "@/interfaces/async/payload/piece/PermissionAddedPayload.ts";
import type PermissionRemovedPayload from "@/interfaces/async/payload/piece/PermissionRemovedPayload.ts";
import type PermissionUpdatedPayload from "@/interfaces/async/payload/piece/PermissionUpdatedPayload.ts";
import type SectionAddedPayload from "@/interfaces/async/payload/piece/SectionAddedPayload.ts";
import type SectionRemovedPayload from "@/interfaces/async/payload/piece/SectionRemovedPayload.ts";
import type SectionUpdatedPayload from "@/interfaces/async/payload/piece/SectionUpdatedPayload.ts";
import type ChatMessagePayload from "@/interfaces/async/payload/room/ChatMessagePayload.ts";
import type RoomMetadataChangedPayload from "@/interfaces/async/payload/room/MetadataUpdatedPayload.ts";
import type PieceChangedPayload from "@/interfaces/async/payload/room/PieceChangedPayload.ts";
import type { PlaybackPausedPayload } from "@/interfaces/async/payload/room/PlaybackPausedPayload.ts";
import type { PlaybackStartedPayload } from "@/interfaces/async/payload/room/PlaybackStartedPayload.ts";
import type PositionChangedPayload from "@/interfaces/async/payload/room/PositionChangedPayload.ts";
import type ErrorPayload from "@/interfaces/async/payload/user/ErrorPayload.ts";
import type RoomJoinedPayload from "@/interfaces/async/payload/user/RoomJoinedPayload.ts";

export type GeneralEventDto =
  | {
      type: "piece-now-available";
      payload: PieceNowAvailablePayload;
    }
  | {
      type: "piece-metadata-updated";
      payload: PieceMetadataUpdatedPayload;
    }
  | {
      type: "piece-now-unavailable";
      payload: PieceNowUnavailablePayload;
    }
  | {
      type: "room-now-available";
      payload: RoomNowAvailablePayload;
    }
  | {
      type: "room-metadata-updated";
      payload: RoomMetadataUpdatedPayload;
    }
  | {
      type: "room-now-unavailable";
      payload: RoomNowUnavailablePayload;
    };

export type PieceEventDto =
  | {
      type: "metadata-updated";
      payload: MetadataUpdatedPayload;
    }
  | {
      type: "section-added";
      payload: SectionAddedPayload;
    }
  | {
      type: "section-updated";
      payload: SectionUpdatedPayload;
    }
  | {
      type: "section-removed";
      payload: SectionRemovedPayload;
    }
  | {
      type: "permission-added";
      payload: PermissionAddedPayload;
    }
  | {
      type: "permission-updated";
      payload: PermissionUpdatedPayload;
    }
  | {
      type: "permission-removed";
      payload: PermissionRemovedPayload;
    };

export type RoomEventDto =
  | {
      type: "metadata-updated";
      payload: RoomMetadataChangedPayload;
    }
  | {
      type: "piece-changed";
      payload: PieceChangedPayload;
    }
  | {
      type: "playback-started";
      payload: PlaybackStartedPayload;
    }
  | {
      type: "playback-paused";
      payload: PlaybackPausedPayload;
    }
  | {
      type: "position-changed";
      payload: PositionChangedPayload;
    }
  | {
      type: "chat-message";
      payload: ChatMessagePayload;
    };

export type UserEventDto =
  | {
      type: "error";
      payload: ErrorPayload;
    }
  | {
      type: "room-joined";
      payload: RoomJoinedPayload;
    };

export type EventDto =
  | GeneralEventDto
  | PieceEventDto
  | RoomEventDto
  | UserEventDto;
