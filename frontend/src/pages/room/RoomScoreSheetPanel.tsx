/*
 * (C) 2026. - Rafael Urben
 */
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { stompService } from "@/service/stompService.ts";
import type RoomControlPositionRequestDto from "@/interfaces/async/request/room/RoomControlPositionRequestDto.ts";
import type { PieceDto, RoomDto } from "@/api/generated/openapi";
import { metronomeService } from "@/service/metronomeService.ts";
import {
  calculateSectionTimings,
  convertSectionToMetronomePlaylist,
} from "@/service/metronomeUtils.ts";
import type { PlayerPlaylistItem } from "@/interfaces/player/playerPlaylistItem.ts";
import { toast } from "sonner";
import { useMainStore } from "@/zustand/mainStore.ts";

interface RoomScoreSheetPanelProps {
  room: RoomDto;
  piece: PieceDto;
  canEditRoom: boolean;
}

const AUDIO_CONTEXT_INIT_TOAST_ID = "room-audio-context-init";

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

  const publishSectionPosition = (nextSectionPosition: number) => {
    if (!canEditRoom) {
      return;
    }

    stompService.publish(`/app/room.${room.id}/control/position`, {
      currentSectionPosition: nextSectionPosition,
    } satisfies RoomControlPositionRequestDto);
  };

  const publishPlayPause = useCallback(() => {
    if (!canEditRoom) {
      return;
    }

    stompService.publish(
      room.playing
        ? `/app/room.${room.id}/control/pause`
        : `/app/room.${room.id}/control/play`,
    );
  }, [room.playing, room.id, canEditRoom]);

  const sortedSections = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      [...(piece.sections ?? [])].sort(
        (left, right) => left.position - right.position,
      ),
    [piece.sections],
  );
  const sortedScoreSheets = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      [...(piece.scoreSheets ?? [])].sort(
        (left, right) => left.position - right.position,
      ),
    [piece.scoreSheets],
  );

  const firstSectionPosition = sortedSections[0]?.position ?? 0;
  const currentSectionPosition =
    sectionPositionOverride ??
    room.lastPlaySectionPosition ??
    firstSectionPosition;
  const currentSection = sortedSections.find(
    (section) => section.position === currentSectionPosition,
  );
  const visibleScoreSheet = currentSection
    ? sortedScoreSheets.find(
        (scoreSheet) => scoreSheet.id === currentSection.scoreSheetId,
      )
    : undefined;
  const displayedScoreSheet = visibleScoreSheet ?? sortedScoreSheets[0];
  const highlightedSection =
    currentSection && currentSection.scoreSheetId === visibleScoreSheet?.id
      ? currentSection
      : undefined;
  const toPercent = (value: number) => String(value * 100) + "%";

  const minSectionPosition = sortedSections[0]?.position ?? 0;
  const maxSectionPosition =
    sortedSections.at(-1)?.position ?? minSectionPosition;
  const sectionPositionText =
    sortedSections.length > 0
      ? `Section ${String(currentSectionPosition + 1)} of ${String(maxSectionPosition + 1)} (${currentSection?.name ?? "unknown"})`
      : "No sections available";

  const isPreviousDisabled =
    sortedSections.length === 0 || currentSectionPosition <= minSectionPosition;
  const isNextDisabled =
    sortedSections.length === 0 || currentSectionPosition >= maxSectionPosition;

  const initializeAudioContext = useCallback(
    async (showToastOnError: boolean) => {
      try {
        await metronomeService.initializeAudioContext();
        setAudioContextReady(true);
        toast.dismiss(AUDIO_CONTEXT_INIT_TOAST_ID);
      } catch (error) {
        console.error("Failed to initialize audio context", error);
        if (showToastOnError) {
          toast.error("Audio playback is not ready.", {
            id: AUDIO_CONTEXT_INIT_TOAST_ID,
            description: "Click Enable audio to hear the metronome.",
            closeButton: false,
            action: {
              label: "Enable audio",
              onClick: () => {
                void metronomeService
                  .initializeAudioContext()
                  .then(() => {
                    setAudioContextReady(true);
                    toast.dismiss(AUDIO_CONTEXT_INIT_TOAST_ID);
                  })
                  .catch((retryError: unknown) => {
                    console.error(
                      "Failed to initialize audio context",
                      retryError,
                    );
                  });
              },
            },
          });
        }
      }
    },
    [setAudioContextReady],
  );

  useEffect(() => {
    if (!audioContextReady) {
      void initializeAudioContext(true);
    }
  }, [audioContextReady, initializeAudioContext]);

  // Playback
  useEffect(() => {
    if (!audioContextReady || !room.playing) return;

    const playTimestamp = room.lastPlayTimestamp
      ? new Date(room.lastPlayTimestamp)
      : new Date();
    const playbackSections = sortedSections.slice(
      room.lastPlaySectionPosition ?? 0,
    );

    // Audio metronome playback
    const playlist: PlayerPlaylistItem[] = [];
    for (const section of playbackSections) {
      playlist.push(
        ...convertSectionToMetronomePlaylist(section, room.tempoMultiplier),
      );
    }
    const stopMetronome = metronomeService.playMetronomePlaylist(
      playlist,
      playTimestamp,
    );

    // Visual section selection
    const timings = calculateSectionTimings(
      playbackSections,
      room.tempoMultiplier,
    );
    const globalOffsetMs = playTimestamp.getTime() - Date.now();
    const timeoutHandles: number[] = [];

    for (const timing of timings) {
      const offsetMs = globalOffsetMs + timing.offsetMs;
      if (offsetMs < 0) continue;
      timeoutHandles.push(
        setTimeout(() => {
          setSectionPositionOverride(timing.sectionPosition);
        }, offsetMs),
      );
    }
    // Select currently playing section (for late joiners)
    const currentTiming = timings
      .slice()
      .reverse()
      .find((timing) => globalOffsetMs + timing.offsetMs < 0);
    if (currentTiming) {
      setTimeout(() => {
        setSectionPositionOverride(currentTiming.sectionPosition);
      }, 0);
    }

    // Auto end
    if (canEditRoom) {
      timeoutHandles.push(
        setTimeout(
          () => {
            publishPlayPause();
          },
          globalOffsetMs +
            timings.map((t) => t.durationMs).reduce((acc, val) => acc + val),
          0,
        ),
      );
    }

    // Cleanup
    return () => {
      stopMetronome();
      timeoutHandles.forEach((handle) => {
        clearTimeout(handle);
      });
      setSectionPositionOverride(null);
    };
  }, [
    audioContextReady,
    sortedSections,
    room.playing,
    room.lastPlayTimestamp,
    room.lastPlaySectionPosition,
    room.tempoMultiplier,
    setSectionPositionOverride,
    canEditRoom,
    publishPlayPause,
  ]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          {sortedScoreSheets.length === 0 ? (
            <div className="text-center text-muted-foreground">
              This piece has no score sheets yet.
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative inline-block">
                <img
                  src={displayedScoreSheet.imageUrl}
                  alt={displayedScoreSheet.title}
                  className="max-w-full rounded-lg border bg-muted"
                />

                {highlightedSection && (
                  <div
                    className="pointer-events-none absolute rounded-md border-2 border-section-highlight bg-section-highlight/10 shadow-sm"
                    style={{
                      left: toPercent(highlightedSection.posX1),
                      top: toPercent(highlightedSection.posY1),
                      width: toPercent(
                        highlightedSection.posX2 - highlightedSection.posX1,
                      ),
                      height: toPercent(
                        highlightedSection.posY2 - highlightedSection.posY1,
                      ),
                    }}
                  ></div>
                )}
              </div>
            </div>
          )}
        </div>

        {canEditRoom && (
          <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 border-t pt-4">
            <Button
              variant="outline"
              size="icon"
              disabled={isPreviousDisabled}
              onClick={() => {
                publishSectionPosition(currentSectionPosition - 1);
              }}
            >
              <ChevronLeftIcon />
            </Button>

            <Button variant="outline" size="icon" onClick={publishPlayPause}>
              {room.playing ? <PauseIcon /> : <PlayIcon />}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {sectionPositionText}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={isNextDisabled}
              onClick={() => {
                publishSectionPosition(currentSectionPosition + 1);
              }}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
