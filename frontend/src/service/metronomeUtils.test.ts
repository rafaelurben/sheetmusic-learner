/*
 * (C) 2026. - Rafael Urben
 */
import type { SectionDto } from "@/api/generated/openapi";
import { describe, expect, it } from "vitest";
import {
  calculateCountInDurationMs,
  calculateSectionTimings,
  convertSectionToMetronomePlaylist,
  createCountInMetronomePlaylist,
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
    repeatCount: 1,
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

describe("createCountInMetronomePlaylist", () => {
  it("creates exactly 1 bar of metronome beats matching time signature", () => {
    const playlist = createCountInMetronomePlaylist(
      createSection({ bpm: 120, timeSignatureNumerator: 4 }),
    );

    expect(playlist).toHaveLength(4);
    expect(playlist[0]).toEqual({
      sound: "metronome",
      gain: 2,
      duration: 0.5,
    });
    for (const i of [1, 2, 3]) {
      expect(playlist[i]).toEqual({
        sound: "metronome",
        gain: 0.5,
        duration: 0.5,
      });
    }
  });

  it("applies tempo multiplier to count-in beat durations", () => {
    const playlist = createCountInMetronomePlaylist(
      createSection({ bpm: 60, timeSignatureNumerator: 3 }),
      2,
    );

    expect(playlist).toHaveLength(3);
    expect(playlist[0]?.duration).toBe(0.5);
  });
});

describe("calculateCountInDurationMs", () => {
  it("calculates exactly 1 bar duration in milliseconds", () => {
    const duration = calculateCountInDurationMs(
      createSection({ bpm: 120, timeSignatureNumerator: 4 }),
    );

    expect(duration).toBe(2000);
  });

  it("scales duration with tempo multiplier", () => {
    const duration = calculateCountInDurationMs(
      createSection({ bpm: 60, timeSignatureNumerator: 3 }),
      1.5,
    );

    // 3 * (60_000 / 60 / 1.5) = 3 * (1000 / 1.5) = 2000
    expect(duration).toBe(2000);
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
      repeatIndex: 0,
      repeatCount: 1,
      willRepeat: false,
    });
    expect(timings[1]).toEqual({
      sectionId: "b",
      sectionPosition: 2,
      offsetMs: DURATION_1,
      durationMs: DURATION_2,
      repeatIndex: 0,
      repeatCount: 1,
      willRepeat: false,
    });
    expect(timings[2]).toEqual({
      sectionId: "c",
      sectionPosition: 3,
      offsetMs: DURATION_1 + DURATION_2,
      durationMs: DURATION_3,
      repeatIndex: 0,
      repeatCount: 1,
      willRepeat: false,
    });
  });

  it("repeats sections according to repeatCount and tracks willRepeat", () => {
    const sections: SectionDto[] = [
      createSection({
        id: "repeat-sec",
        position: 0,
        barCount: 2,
        bpm: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        repeatCount: 2,
      }),
      createSection({
        id: "single-sec",
        position: 1,
        barCount: 1,
        bpm: 120,
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        repeatCount: 1,
      }),
    ];

    const timings = calculateSectionTimings(sections);
    expect(timings).toHaveLength(3);
    expect(timings[0]).toEqual({
      sectionId: "repeat-sec",
      sectionPosition: 0,
      offsetMs: 0,
      durationMs: 4000,
      repeatIndex: 0,
      repeatCount: 2,
      willRepeat: true,
    });
    expect(timings[1]).toEqual({
      sectionId: "repeat-sec",
      sectionPosition: 0,
      offsetMs: 4000,
      durationMs: 4000,
      repeatIndex: 1,
      repeatCount: 2,
      willRepeat: false,
    });
    expect(timings[2]).toEqual({
      sectionId: "single-sec",
      sectionPosition: 1,
      offsetMs: 8000,
      durationMs: 2000,
      repeatIndex: 0,
      repeatCount: 1,
      willRepeat: false,
    });
  });

  it("applies tempo multiplier to beat durations", () => {
    const timings = calculateSectionTimings([createSection({ bpm: 30 })], 2);

    expect(timings[0]?.durationMs).toBe(8000);
  });
});
