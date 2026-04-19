/*
 * (C) 2026. - Rafael Urben
 */

import { toast } from "sonner";
import type { PlayerPlaylistItem } from "../interfaces/player/playerPlaylistItem.ts";
import type { SoundName } from "@/interfaces/player/soundName.ts";
import { SOUND_FILES } from "@/data/soundFiles.ts";

class MetronomeService {
  private readonly audioContext: AudioContext;
  private readonly soundsMap: Record<SoundName, AudioBuffer> = {} as Record<
    SoundName,
    AudioBuffer
  >;

  constructor() {
    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      toast.error("Web Audio API is not supported in this browser");
      throw new Error(
        "Failed to initialize AudioContext: Web Audio API is not supported",
        { cause: error },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    Object.entries(SOUND_FILES).forEach(async ([name, url]) => {
      this.soundsMap[name as SoundName] = await this.loadSound(url);
    });
  }

  private async loadSound(url: string): Promise<AudioBuffer> {
    const audioContext = this.audioContext;

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load sound ${url}: ${String(response.status)} ${response.statusText}`,
          );
        }

        return response.arrayBuffer();
      })
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));
  }

  /**
   * Play a sound and return the created source.
   */
  private playSound(buffer: AudioBuffer, time: number, gainValue = 1) {
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = gainValue;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(time);

    return source;
  }

  private playMetronomePlaylistInternalTime(
    items: PlayerPlaylistItem[],
    startTime: number,
  ) {
    const sources: AudioBufferSourceNode[] = [];
    let scheduledTime = startTime;
    for (const item of items) {
      // Ignore playback in the past
      if (scheduledTime >= this.audioContext.currentTime) {
        sources.push(
          this.playSound(this.soundsMap[item.sound], scheduledTime, item.gain),
        );
      }
      scheduledTime += item.duration;
    }

    return () => {
      sources.forEach((source) => {
        source.stop();
      });
    };
  }

  /**
   * Play a metronome playlist.
   * @param items the playlist
   * @param scheduledStart when the playback is/was scheduled to start
   * @returns a function to call in order to stop playback
   */
  public playMetronomePlaylist(
    items: PlayerPlaylistItem[],
    scheduledStart: Date,
  ) {
    const timeDiff = scheduledStart.getTime() - Date.now();

    return this.playMetronomePlaylistInternalTime(
      items,
      this.audioContext.currentTime + timeDiff / 1000,
    );
  }
}

export const metronomeService = new MetronomeService();
console.debug("MetronomeService initialized", metronomeService);
