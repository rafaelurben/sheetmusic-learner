/*
 * (C) 2026. - Rafael Urben
 */
import type { SectionDto } from "@/api/generated/openapi";
import { describe, expect, it } from "vitest";
import {
  calculateSectionTimings,
  convertSectionToMetronomePlaylist,
} from "@/service/metronomeUtils";

function createSection(overrides: Partial<SectionDto> = {}): SectionDto {
  return {
    id: "section-1",
    position: 1,
    name: "Intro",
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    barCount: 2,
    bpm: 120,
    scoreSheetId: null,
    posX1: 0,
    posY1: 0,
    posX2: 100,
    posY2: 100,
    ...overrides,
  };
}

describe("convertSectionToMetronomePlaylist", () => {
  it("creates one accent beat and remaining regular beats per bar", () => {
    const playlist = convertSectionToMetronomePlaylist(createSection());

    expect(playlist).toHaveLength(8);
    for (const i of [0, 4]) {
      expect(playlist[i]).toEqual({
        sound: "metronome",
        gain: 2,
        duration: 0.5,
      });
    }
    for (const i of [1, 2, 3, 5, 6, 7]) {
      expect(playlist[i]).toEqual({
        sound: "metronome",
        gain: 0.5,
        duration: 0.5,
      });
    }
  });

  it("applies tempo multiplier to beat durations", () => {
    const playlist = convertSectionToMetronomePlaylist(
      createSection({ bpm: 60 }),
      2,
    );

    expect(playlist[0]?.duration).toBe(0.5);
  });
});

describe("calculateSectionTimings", () => {
  it("calculates cumulative section offsets in milliseconds", () => {
    const sections: SectionDto[] = [
      createSection({
        id: "a",
        position: 1,
        barCount: 1,
        bpm: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
      }),
      createSection({
        id: "b",
        position: 2,
        barCount: 4,
        bpm: 60,
        timeSignatureNumerator: 6,
        timeSignatureDenominator: 8,
      }),
      createSection({
        id: "c",
        position: 3,
        barCount: 2,
        bpm: 60,
        timeSignatureNumerator: 3,
        timeSignatureDenominator: 4,
      }),
    ];

    const DURATION_1 = 500 * 4;
    const DURATION_2 = 1000 * 6 * 4;
    const DURATION_3 = 1000 * 3 * 2;

    const timings = calculateSectionTimings(sections);

    expect(timings).toHaveLength(3);
    expect(timings[0]).toEqual({
      sectionId: "a",
      sectionPosition: 1,
      offsetMs: 0,
      durationMs: DURATION_1,
    });
    expect(timings[1]).toEqual({
      sectionId: "b",
      sectionPosition: 2,
      offsetMs: DURATION_1,
      durationMs: DURATION_2,
    });
    expect(timings[2]).toEqual({
      sectionId: "c",
      sectionPosition: 3,
      offsetMs: DURATION_1 + DURATION_2,
      durationMs: DURATION_3,
    });
  });

  it("applies tempo multiplier to beat durations", () => {
    const timings = calculateSectionTimings([createSection({ bpm: 30 })], 2);

    expect(timings[0]?.durationMs).toBe(8000);
  });
});
