/*
 * (C) 2026. - Rafael Urben
 */

export interface PlayerSectionTiming {
  offsetMs: number;
  durationMs: number;
  sectionId: string;
  sectionPosition: number;
  repeatIndex: number;
  repeatCount: number;
  willRepeat: boolean;
}
