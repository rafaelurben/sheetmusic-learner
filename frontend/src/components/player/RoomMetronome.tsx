/*
 * (C) 2026. - Rafael Urben
 */
import { useCallback, useEffect } from "react";
import type { RoomDto, SectionDto } from "@/api/generated/openapi";
import { metronomeService } from "@/service/metronomeService.ts";
import {
  calculateSectionTimings,
  convertSectionToMetronomePlaylist,
} from "@/service/metronomeUtils.ts";
import type { PlayerPlaylistItem } from "@/interfaces/player/playerPlaylistItem.ts";
import { toast } from "sonner";

interface RoomMetronomeProps {
  room: RoomDto;
  sortedSections: SectionDto[];
  audioContextReady: boolean;
  onAudioContextReadyChange: (ready: boolean) => void;
  onSectionPositionOverrideChange: (sectionPosition: number | null) => void;
  onPlaybackEnded: () => void;
}

const AUDIO_CONTEXT_INIT_TOAST_ID = "room-audio-context-init";

export default function RoomMetronome({
  room,
  sortedSections,
  audioContextReady,
  onAudioContextReadyChange,
  onSectionPositionOverrideChange,
  onPlaybackEnded,
}: Readonly<RoomMetronomeProps>) {
  const initializeAudioContext = useCallback(
    async (showToastOnError: boolean) => {
      try {
        await metronomeService.initializeAudioContext();
        onAudioContextReadyChange(true);
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
                    onAudioContextReadyChange(true);
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
    [onAudioContextReadyChange],
  );

  useEffect(() => {
    if (!audioContextReady) {
      void initializeAudioContext(true);
    }
  }, [audioContextReady, initializeAudioContext]);

  useEffect(() => {
    if (!audioContextReady || !room.playing) {
      return;
    }

    const playTimestamp = room.lastPlayTimestamp
      ? new Date(room.lastPlayTimestamp)
      : new Date();
    const playbackSections = sortedSections.slice(
      room.lastPlaySectionPosition ?? 0,
    );

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

    const timings = calculateSectionTimings(
      playbackSections,
      room.tempoMultiplier,
    );
    const globalOffsetMs = playTimestamp.getTime() - Date.now();
    const timeoutHandles: number[] = [];

    for (const timing of timings) {
      const offsetMs = globalOffsetMs + timing.offsetMs;
      if (offsetMs < 0) {
        continue;
      }
      timeoutHandles.push(
        setTimeout(() => {
          onSectionPositionOverrideChange(timing.sectionPosition);
        }, offsetMs),
      );
    }

    const currentTiming = timings
      .slice()
      .reverse()
      .find((timing) => globalOffsetMs + timing.offsetMs < 0);
    if (currentTiming) {
      timeoutHandles.push(
        setTimeout(() => {
          onSectionPositionOverrideChange(currentTiming.sectionPosition);
        }, 0),
      );
    }

    timeoutHandles.push(
      setTimeout(
        () => {
          onPlaybackEnded();
        },
        globalOffsetMs +
          timings
            .map((timing) => timing.durationMs)
            .reduce((acc, val) => acc + val, 0),
      ),
    );

    return () => {
      stopMetronome();
      timeoutHandles.forEach((handle) => {
        clearTimeout(handle);
      });
      onSectionPositionOverrideChange(null);
    };
  }, [
    audioContextReady,
    sortedSections,
    room.playing,
    room.lastPlayTimestamp,
    room.lastPlaySectionPosition,
    room.tempoMultiplier,
    onSectionPositionOverrideChange,
    onPlaybackEnded,
  ]);

  return null;
}
