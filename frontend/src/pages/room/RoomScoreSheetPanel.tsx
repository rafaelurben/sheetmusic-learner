/*
 * (C) 2026. - Rafael Urben
 */
import { useCallback } from "react";
import { stompPublishingService } from "@/service/stompPublishingService.ts";
import type { PieceDto, RoomDto } from "@/api/generated/openapi";
import Player from "@/components/player/Player.tsx";

interface RoomScoreSheetPanelProps {
  room: RoomDto;
  piece: PieceDto;
  canEditRoom: boolean;
}

export default function RoomScoreSheetPanel({
  room,
  piece,
  canEditRoom,
}: Readonly<RoomScoreSheetPanelProps>) {
  const publishSectionPosition = useCallback(
    (nextSectionPosition: number) => {
      if (!canEditRoom) {
        return;
      }

      stompPublishingService.roomControlPosition(room.id, {
        currentSectionPosition: nextSectionPosition,
      });
    },
    [canEditRoom, room.id],
  );

  const publishPlaybackConfig = useCallback(
    (nextTempoMultiplier: number) => {
      if (!canEditRoom || room.playing) {
        return;
      }

      stompPublishingService.roomControlPlaybackConfig(room.id, {
        tempoMultiplier: nextTempoMultiplier,
      });
    },
    [canEditRoom, room.id, room.playing],
  );

  const publishPlay = useCallback(() => {
    if (!canEditRoom) {
      return;
    }

    stompPublishingService.roomControlPlay(room.id);
  }, [room.id, canEditRoom]);

  const publishPause = useCallback(() => {
    if (!canEditRoom) {
      return;
    }

    stompPublishingService.roomControlPause(room.id);
  }, [room.id, canEditRoom]);

  return (
    <Player
      piece={piece}
      playbackState={{
        playing: room.playing ?? false,
        tempoMultiplier: room.tempoMultiplier,
        lastPlayTimestamp: room.lastPlayTimestamp,
        lastPlaySectionPosition: room.lastPlaySectionPosition,
      }}
      showControls={canEditRoom}
      onPlay={publishPlay}
      onPause={publishPause}
      onTempoMultiplierChange={publishPlaybackConfig}
      onSectionChange={publishSectionPosition}
    />
  );
}
