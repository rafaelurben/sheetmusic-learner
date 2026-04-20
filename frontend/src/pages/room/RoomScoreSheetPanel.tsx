/*
 * (C) 2026. - Rafael Urben
 */
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { useCallback, useEffect, useState } from "react";
import { stompPublishingService } from "@/service/stompPublishingService.ts";
import type { PieceDto, RoomDto } from "@/api/generated/openapi";
import { useMainStore } from "@/zustand/mainStore.ts";
import RoomMetronome from "@/components/player/RoomMetronome.tsx";
import RoomSheetDisplay from "@/components/player/RoomSheetDisplay.tsx";
import RoomPlayerControls from "@/components/player/RoomPlayerControls.tsx";
import { useSorted } from "@/service/hooks.ts";

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
  const [sectionPositionOverride, setSectionPositionOverride] = useState<
    number | null
  >(null);
  const audioContextReady = useMainStore((state) => state.audioContextReady);
  const setAudioContextReady = useMainStore(
    (state) => state.setAudioContextReady,
  );

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

  const sortedSections = useSorted(piece.sections);
  const currentSectionPosition =
    sectionPositionOverride ?? room.lastPlaySectionPosition ?? 0;
  const currentSection = sortedSections.find(
    (section) => section.position === currentSectionPosition,
  );

  useEffect(() => {
    if (!room.playing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSectionPositionOverride(null);
    }
  }, [room.playing]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <RoomSheetDisplay piece={piece} currentSectionId={currentSection?.id} />

        {canEditRoom && (
          <RoomPlayerControls
            sections={piece.sections}
            currentSection={currentSection}
            playing={room.playing ?? false}
            tempoMultiplier={room.tempoMultiplier}
            onPlay={publishPlay}
            onPause={publishPause}
            onTempoMultiplierChange={publishPlaybackConfig}
            onSectionChange={publishSectionPosition}
          />
        )}

        <RoomMetronome
          room={room}
          sortedSections={sortedSections}
          audioContextReady={audioContextReady}
          onAudioContextReadyChange={setAudioContextReady}
          onSectionPositionOverrideChange={setSectionPositionOverride}
          onPlaybackEnded={publishPause}
        />
      </CardContent>
    </Card>
  );
}
