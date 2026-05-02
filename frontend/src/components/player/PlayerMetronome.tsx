/*
 * (C) 2026. - Rafael Urben
 */
import { useCallback, useEffect } from "react";
import type { SectionDto } from "@/api/generated/openapi";
import { metronomeService } from "@/service/metronomeService.ts";
import {
  calculateSectionTimings,
  convertSectionToMetronomePlaylist,
} from "@/service/metronomeUtils.ts";
import type { PlayerPlaylistItem } from "@/interfaces/player/playerPlaylistItem.ts";
import type { PlayerSectionState } from "@/interfaces/player/playerSectionState.ts";
import { toast } from "sonner";
import { useMainStore } from "@/zustand/mainStore.ts";

interface PlayerMetronomeProps {
  playing: boolean;
  lastPlayTimestamp?: string | null;
  lastPlaySectionPosition?: number | null;
  tempoMultiplier: number;
  sortedSections: SectionDto[];
  onSectionStateChange: (override: PlayerSectionState | null) => void;
  onPlaybackEnded: () => void;
}

const AUDIO_CONTEXT_INIT_TOAST_ID = "room-audio-context-init";

export default function PlayerMetronome({
  playing,
  lastPlayTimestamp,
  lastPlaySectionPosition,
  tempoMultiplier,
  sortedSections,
  onSectionStateChange,
  onPlaybackEnded,
}: Readonly<PlayerMetronomeProps>) {
  const audioContextReady = useMainStore((state) => state.audioContextReady);
  const setAudioContextReady = useMainStore(
    (state) => state.setAudioContextReady,
  );

  const initializeAudioContext = useCallback(
    async (showToastOnError: boolean) => {
      try {
        await metronomeService.initializeAudioContext();
        setAudioContextReady(true);
        toast.dismiss(AUDIO_CONTEXT_INIT_TOAST_ID);
      } catch (error) {
        console.warn("Failed to initialize audio context", error);
        if (showToastOnError) {
          toast.error("Audio playback is not ready.", {
            id: AUDIO_CONTEXT_INIT_TOAST_ID,
            description: "Click Enable audio to hear the metronome.",
            closeButton: false,
            dismissible: false,
            duration: Infinity,
            action: {
              label: "Enable audio",
              onClick: () => {
                metronomeService
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

  useEffect(() => {
    if (!audioContextReady || !playing) {
      return;
    }

    const playTimestamp = lastPlayTimestamp
      ? new Date(lastPlayTimestamp)
      : new Date();
    const playbackSections = sortedSections.slice(lastPlaySectionPosition ?? 0);

    // Audio: Metronome
    const playlist: PlayerPlaylistItem[] = [];
    for (const section of playbackSections) {
      playlist.push(
        ...convertSectionToMetronomePlaylist(section, tempoMultiplier),
      );
    }
    const stopMetronome = metronomeService.playMetronomePlaylist(
      playlist,
      playTimestamp,
    );

    // Visual: Section changes
    const timings = calculateSectionTimings(playbackSections, tempoMultiplier);
    const nowMs = Date.now();
    const globalOffsetMs = playTimestamp.getTime() - nowMs;
    const timeoutHandles: number[] = [];

    for (const timing of timings) {
      const offsetMs = globalOffsetMs + timing.offsetMs;
      if (offsetMs < 0) {
        continue;
      }
      timeoutHandles.push(
        setTimeout(() => {
          onSectionStateChange({
            sectionPosition: timing.sectionPosition,
            startTimeMs: playTimestamp.getTime() + timing.offsetMs,
            durationMs: timing.durationMs,
          });
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
          onSectionStateChange({
            sectionPosition: currentTiming.sectionPosition,
            startTimeMs: playTimestamp.getTime() + currentTiming.offsetMs,
            durationMs: currentTiming.durationMs,
          });
        }, 0),
      );
    }

    // Handle playback end
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

    // Cleanup
    return () => {
      stopMetronome();
      timeoutHandles.forEach((handle) => {
        clearTimeout(handle);
      });
      onSectionStateChange(null);
    };
  }, [
    audioContextReady,
    sortedSections,
    playing,
    lastPlayTimestamp,
    lastPlaySectionPosition,
    tempoMultiplier,
    onSectionStateChange,
    onPlaybackEnded,
  ]);

  return null;
}
