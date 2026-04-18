/*
 * (C) 2026. - Rafael Urben
 */
export default interface PlaybackStateChangedPayload {
  playing: boolean;
  lastPlaySectionPosition: number | null;
  lastPlayTimestamp: string | null;
  tempoMultiplier: number;
}
