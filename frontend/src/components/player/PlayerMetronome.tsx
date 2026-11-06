/*
 * (C) 2026. - Rafael Urben
 */
import { type CSSProperties, useCallback, useEffect, useState } from "react";
import type { SectionDto } from "@/api/generated/openapi";
import { metronomeService } from "@/service/metronomeService.ts";
import {
  calculateCountInDurationMs,
  calculateSectionTimings,
  convertSectionToMetronomePlaylist,
  createCountInMetronomePlaylist,
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
  countIn: boolean;
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
  countIn,
  sortedSections,
  onSectionStateChange,
  onPlaybackEnded,
}: Readonly<PlayerMetronomeProps>) {
  const audioContextReady = useMainStore((state) => state.audioContextReady);
  const showMetronome = useMainStore((state) => state.showMetronome);
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

  // Visual metronome state
  const [activeSectionPosition, setActiveSectionPosition] = useState<
    number | null
  >(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);
  const [isCountIn, setIsCountIn] = useState(countIn);

  // Audio metronome
  useEffect(() => {
    if (!audioContextReady || !playing) {
      return;
    }

    const playTimestamp = lastPlayTimestamp
      ? new Date(lastPlayTimestamp)
      : new Date();
    const playbackSections = sortedSections.slice(lastPlaySectionPosition ?? 0);
    if (playbackSections.length === 0) {
      return;
    }

    const playlist: PlayerPlaylistItem[] = [];
    if (countIn) {
      playlist.push(
        ...createCountInMetronomePlaylist(playbackSections[0], tempoMultiplier),
      );
    }
    for (const section of playbackSections) {
      playlist.push(
        ...convertSectionToMetronomePlaylist(section, tempoMultiplier),
      );
    }
    const stopMetronome = metronomeService.playMetronomePlaylist(
      playlist,
      playTimestamp,
    );

    // Cleanup
    return () => {
      stopMetronome();
    };
  }, [
    audioContextReady,
    countIn,
    lastPlaySectionPosition,
    lastPlayTimestamp,
    playing,
    sortedSections,
    tempoMultiplier,
  ]);

  // Visual: Section highlighting and automatic playback end
  useEffect(() => {
    if (!playing) {
      return;
    }

    const playTimestamp = lastPlayTimestamp
      ? new Date(lastPlayTimestamp)
      : new Date();
    const playbackSections = sortedSections.slice(lastPlaySectionPosition ?? 0);
    if (playbackSections.length === 0) {
      return;
    }

    const countInDurationMs = countIn
      ? calculateCountInDurationMs(playbackSections[0], tempoMultiplier)
      : 0;

    // Visual: Section changes
    const timings = calculateSectionTimings(playbackSections, tempoMultiplier);
    const nowMs = Date.now();
    const globalOffsetMs = playTimestamp.getTime() - nowMs + countInDurationMs;
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
            startTimeMs:
              playTimestamp.getTime() + countInDurationMs + timing.offsetMs,
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
            startTimeMs:
              playTimestamp.getTime() +
              countInDurationMs +
              currentTiming.offsetMs,
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
      timeoutHandles.forEach((handle) => {
        clearTimeout(handle);
      });
      onSectionStateChange(null);
    };
  }, [
    countIn,
    lastPlaySectionPosition,
    lastPlayTimestamp,
    onPlaybackEnded,
    onSectionStateChange,
    playing,
    sortedSections,
    tempoMultiplier,
  ]);

  // Visual: Visual metronome
  useEffect(() => {
    if (!showMetronome || !playing) {
      // hide visuals when not shown or not playing
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCountIn(countIn);
      setActiveBarIndex(null);
      setActiveBeatIndex(null);
      setActiveSectionPosition(null);
      return;
    }

    const playTimestamp = lastPlayTimestamp
      ? new Date(lastPlayTimestamp)
      : new Date();
    const playbackSections = sortedSections.slice(lastPlaySectionPosition ?? 0);
    if (playbackSections.length === 0) {
      return;
    }

    const countInDurationMs = countIn
      ? calculateCountInDurationMs(playbackSections[0], tempoMultiplier)
      : 0;

    const timeoutHandles: number[] = [];

    // Schedule count-in beats if enabled
    if (countIn && playbackSections.length > 0) {
      const firstSection = playbackSections[0];
      const beatDurationMs = 60000 / firstSection.bpm / tempoMultiplier;
      const countInBeats = firstSection.timeSignatureNumerator;
      const countInStartOffsetMs = playTimestamp.getTime() - Date.now();

      for (let beatIndex = 0; beatIndex < countInBeats; beatIndex++) {
        const offsetMs = countInStartOffsetMs + beatIndex * beatDurationMs;

        if (offsetMs <= 0 && offsetMs + beatDurationMs > 0) {
          setIsCountIn(true);
          setActiveSectionPosition(firstSection.position);
          setActiveBarIndex(null);
          setActiveBeatIndex(beatIndex);
          continue;
        }

        if (offsetMs < 0) {
          continue;
        }

        timeoutHandles.push(
          setTimeout(() => {
            setIsCountIn(true);
            setActiveSectionPosition(firstSection.position);
            setActiveBarIndex(null);
            setActiveBeatIndex(beatIndex);
          }, offsetMs),
        );
      }
    }

    // Schedule section beats
    const timings = calculateSectionTimings(playbackSections, tempoMultiplier);
    const globalOffsetMs =
      playTimestamp.getTime() - Date.now() + countInDurationMs;

    for (let si = 0; si < playbackSections.length; si++) {
      const section = playbackSections[si];
      const timing = timings[si];
      const beatDurationMs = 60000 / section.bpm / tempoMultiplier;
      const sectionBeatCount =
        section.barCount * section.timeSignatureNumerator;

      for (let beatIndex = 0; beatIndex < sectionBeatCount; beatIndex++) {
        const offsetMs =
          globalOffsetMs + timing.offsetMs + beatIndex * beatDurationMs;

        // If the beat already started but hasn't finished, set it immediately
        if (offsetMs <= 0 && offsetMs + beatDurationMs > 0) {
          const beatInBar = beatIndex % section.timeSignatureNumerator;
          const barIndex = Math.floor(
            beatIndex / section.timeSignatureNumerator,
          );
          setIsCountIn(false);
          setActiveSectionPosition(section.position);
          setActiveBarIndex(barIndex);
          setActiveBeatIndex(beatInBar);
          continue;
        }

        if (offsetMs < 0) {
          // already passed
          continue;
        }

        // Future beat: schedule activation (visual flash handled by CSS animation)
        timeoutHandles.push(
          setTimeout(() => {
            const barIndex = Math.floor(
              beatIndex / section.timeSignatureNumerator,
            );
            setIsCountIn(false);
            setActiveSectionPosition(section.position);
            setActiveBarIndex(barIndex);
            setActiveBeatIndex(beatIndex % section.timeSignatureNumerator);
          }, offsetMs),
        );
      }
    }

    // Cleanup
    return () => {
      timeoutHandles.forEach((h) => {
        clearTimeout(h);
      });
      setIsCountIn(false);
      setActiveBarIndex(null);
      setActiveBeatIndex(null);
      setActiveSectionPosition(null);
    };
  }, [
    showMetronome,
    playing,
    countIn,
    audioContextReady,
    sortedSections,
    lastPlayTimestamp,
    lastPlaySectionPosition,
    tempoMultiplier,
  ]);

  if (!showMetronome || sortedSections.length === 0) {
    return null;
  }

  // Determine section to display for visual metronome
  let displaySection = sortedSections[0];
  if (activeSectionPosition !== null) {
    const matchedSection = sortedSections.find(
      (s) => s.position === activeSectionPosition,
    );
    if (matchedSection) {
      displaySection = matchedSection;
    }
  } else if (
    typeof lastPlaySectionPosition === "number" &&
    sortedSections[lastPlaySectionPosition]
  ) {
    displaySection = sortedSections[lastPlaySectionPosition];
  }

  const effectiveBpm = Math.round(displaySection.bpm * tempoMultiplier);

  const statusBar = [
    `${displaySection.timeSignatureNumerator}/${displaySection.timeSignatureDenominator}`,
    `${effectiveBpm} bpm`,
    isCountIn
      ? "Count in"
      : `Bar ${activeBarIndex === null ? 1 : activeBarIndex + 1}/${displaySection.barCount}`,
  ].join(" · ");

  const flashAnimationDuration = Math.min(
    (60000 / displaySection.bpm / tempoMultiplier) * 0.7,
    200,
  ).toFixed(0);

  return (
    <div className="flex items-center gap-4 justify-center flex-wrap">
      <div className="text-sm text-muted-foreground">{statusBar}</div>
      <span>·</span>
      <div
        className="flex items-center gap-2 flex-wrap"
        style={
          {
            "--metronome-animation-duration": `${flashAnimationDuration}ms`,
          } as CSSProperties
        }
      >
        {Array.from({ length: displaySection.timeSignatureNumerator }).map(
          (_, i) => {
            const isActive = i === activeBeatIndex;
            const activeClasses = isActive
              ? "metronome-beat metronome-beat-active"
              : "metronome-beat";
            return (
              <div
                /* eslint-disable-next-line react-x/no-array-index-key */
                key={i}
                className={`w-3 h-3 rounded-sm transition-transform duration-100 ${activeClasses}`}
              />
            );
          },
        )}
      </div>
    </div>
  );
}
