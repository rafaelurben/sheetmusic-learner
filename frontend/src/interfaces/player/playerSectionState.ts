/*
 * (C) 2026. - Rafael Urben
 */

export interface PlayerSectionState {
  sectionPosition: number;
  startTimeMs: number;
  durationMs: number;
  repeatIndex: number;
  repeatCount: number;
  willRepeat: boolean;
}
