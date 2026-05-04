/*
 * (C) 2026. - Rafael Urben
 */
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { useEffect, useState } from "react";
import type { PieceDto } from "@/api/generated/openapi";
import PlayerMetronome from "@/components/player/PlayerMetronome.tsx";
import PlayerSheetDisplay from "@/components/player/PlayerSheetDisplay.tsx";
import PlayerPlaybackControls from "@/components/player/PlayerPlaybackControls.tsx";
import { useSorted } from "@/service/hooks.ts";
import type { PlayerSectionState } from "@/interfaces/player/playerSectionState.ts";

import "./player.css";

interface PlayerProps {
  piece: PieceDto;
  playbackState: {
    playing: boolean;
    tempoMultiplier: number;
    lastPlayTimestamp?: string | null;
    lastPlaySectionPosition?: number | null;
  };
  showControls: boolean;
  onPlay: () => void;
  onPause: () => void;
  onTempoMultiplierChange: (nextTempoMultiplier: number) => void;
  onSectionChange: (nextSectionPosition: number) => void;
}

export default function Player({
  piece,
  playbackState,
  showControls,
  onPlay,
  onPause,
  onTempoMultiplierChange,
  onSectionChange,
}: Readonly<PlayerProps>) {
  const [sectionStateOverride, setSectionStateOverride] =
    useState<PlayerSectionState | null>(null);

  const sortedSections = useSorted(piece.sections);
  const currentSectionPosition =
    sectionStateOverride?.sectionPosition ??
    playbackState.lastPlaySectionPosition ??
    0;
  const currentSection = sortedSections.find(
    (section) => section.position === currentSectionPosition,
  );

  useEffect(() => {
    if (!playbackState.playing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSectionStateOverride(null);
    }
  }, [playbackState.playing]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col py-3">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-3">
        <PlayerSheetDisplay
          piece={piece}
          currentSectionId={currentSection?.id}
          sectionPlaybackState={sectionStateOverride}
        />

        <PlayerPlaybackControls
          sections={sortedSections}
          currentSection={currentSection}
          playing={playbackState.playing}
          readonly={!showControls}
          tempoMultiplier={playbackState.tempoMultiplier}
          onPlay={onPlay}
          onPause={onPause}
          onTempoMultiplierChange={onTempoMultiplierChange}
          onSectionChange={onSectionChange}
        />

        <PlayerMetronome
          playing={playbackState.playing}
          lastPlayTimestamp={playbackState.lastPlayTimestamp}
          lastPlaySectionPosition={playbackState.lastPlaySectionPosition}
          tempoMultiplier={playbackState.tempoMultiplier}
          sortedSections={sortedSections}
          onSectionStateChange={setSectionStateOverride}
          onPlaybackEnded={onPause}
        />
      </CardContent>
    </Card>
  );
}
