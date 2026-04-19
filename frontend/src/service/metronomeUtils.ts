/*
 * (C) 2026. - Rafael Urben
 */

import type { SectionDto } from "@/api/generated/openapi";
import type { PlayerPlaylistItem } from "@/interfaces/player/playerPlaylistItem.ts";
import type { PlayerSectionTiming } from "@/interfaces/player/playerSectionTiming.ts";

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
    items.push({
      offsetMs: totalOffsetMs,
      sectionId: section.id,
      sectionPosition: section.position,
    });
    const durationMs =
      section.barCount *
      section.timeSignatureNumerator *
      (60_000 / section.bpm / tempoMultiplier);
    totalOffsetMs += durationMs;
  }

  return items;
}
