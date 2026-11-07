/*
 * (C) 2026. - Rafael Urben
 */

import type { SectionDto } from "@/api/generated/openapi";
import type { PlayerPlaylistItem } from "@/interfaces/player/playerPlaylistItem.ts";
import type { PlayerSectionTiming } from "@/interfaces/player/playerSectionTiming.ts";

export function createCountInMetronomePlaylist(
  firstSection: SectionDto,
  tempoMultiplier = 1,
): PlayerPlaylistItem[] {
  const items: PlayerPlaylistItem[] = [];
  const beatDuration = 60 / firstSection.bpm / tempoMultiplier;
  items.push({
    sound: "metronome",
    gain: 2,
    duration: beatDuration,
  });
  for (let beat = 1; beat < firstSection.timeSignatureNumerator; beat++) {
    items.push({
      sound: "metronome",
      gain: 0.5,
      duration: beatDuration,
    });
  }
  return items;
}

export function calculateCountInDurationMs(
  firstSection: SectionDto,
  tempoMultiplier = 1,
): number {
  return (
    firstSection.timeSignatureNumerator *
    (60_000 / firstSection.bpm / tempoMultiplier)
  );
}

export function convertSectionToMetronomePlaylist(
  section: SectionDto,
  tempoMultiplier = 1,
): PlayerPlaylistItem[] {
  const items: PlayerPlaylistItem[] = [];
  const beatDuration = 60 / section.bpm / tempoMultiplier;
  for (let bar = 0; bar < section.barCount; bar++) {
    items.push({
      sound: "metronome",
      gain: 2,
      duration: beatDuration,
    });
    for (let beat = 1; beat < section.timeSignatureNumerator; beat++) {
      items.push({
        sound: "metronome",
        gain: 0.5,
        duration: beatDuration,
      });
    }
  }
  return items;
}

export function calculateSectionTimings(
  sections: SectionDto[],
  tempoMultiplier = 1,
): PlayerSectionTiming[] {
  const items: PlayerSectionTiming[] = [];
  let totalOffsetMs = 0;

  for (const section of sections) {
    const repeats = Math.max(1, section.repeatCount);
    const durationMs =
      section.barCount *
      section.timeSignatureNumerator *
      (60_000 / section.bpm / tempoMultiplier);

    for (let repeatIndex = 0; repeatIndex < repeats; repeatIndex++) {
      items.push({
        durationMs: durationMs,
        offsetMs: totalOffsetMs,
        sectionId: section.id,
        sectionPosition: section.position,
        repeatIndex: repeatIndex,
        repeatCount: repeats,
        willRepeat: repeatIndex < repeats - 1,
      });
      totalOffsetMs += durationMs;
    }
  }

  return items;
}

export function getPlaybackSections(
  sortedSections: SectionDto[],
  lastPlaySectionPosition?: number | null,
): {
  playbackSections: SectionDto[];
  nextSectionPosition?: number;
} {
  if (sortedSections.length === 0) {
    return { playbackSections: [], nextSectionPosition: undefined };
  }

  let startIndex = 0;
  if (typeof lastPlaySectionPosition === "number") {
    const foundIndex = sortedSections.findIndex(
      (section) => section.position === lastPlaySectionPosition,
    );
    if (foundIndex >= 0) {
      startIndex = foundIndex;
    } else if (
      lastPlaySectionPosition >= 0 &&
      lastPlaySectionPosition < sortedSections.length
    ) {
      startIndex = lastPlaySectionPosition;
    }
  }

  const playbackSections: SectionDto[] = [];
  let nextSectionPosition: number | undefined = undefined;

  for (let i = startIndex; i < sortedSections.length; i++) {
    const section = sortedSections[i];
    playbackSections.push(section);
    if (section.pauseAfterSection) {
      if (i + 1 < sortedSections.length) {
        nextSectionPosition = sortedSections[i + 1].position;
      }
      break;
    }
  }

  return { playbackSections, nextSectionPosition };
}
