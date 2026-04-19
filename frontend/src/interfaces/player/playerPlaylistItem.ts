/*
 * (C) 2026. - Rafael Urben
 */

import type { SoundName } from "@/interfaces/player/soundName.ts";

export interface PlayerPlaylistItem {
  sound: SoundName;
  gain: number;
  duration: number;
}
