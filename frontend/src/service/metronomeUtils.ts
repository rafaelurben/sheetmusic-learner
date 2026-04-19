/*
 * (C) 2026. - Rafael Urben
 */

import type { SectionDto } from "@/api/generated/openapi";
import type { PlayerPlaylistItem } from "@/interfaces/player/playerPlaylistItem.ts";

export function convertSectionToMetronomePlaylist(
  section: SectionDto,
  tempoMultiplier = 1,
): PlayerPlaylistItem[] {
  const items = [];
  const beatDuration = 60 / section.bpm / tempoMultiplier;
  for (let bar = 0; bar < section.barCount; bar++) {
    items.push({
      sound: "metronome",
      gain: 2,
      duration: beatDuration,
    } satisfies PlayerPlaylistItem);
    for (let beat = 1; beat < section.timeSignatureNumerator; beat++) {
      items.push({
        sound: "metronome",
        gain: 0.5,
        duration: beatDuration,
      } satisfies PlayerPlaylistItem);
    }
  }
  return items;
}
