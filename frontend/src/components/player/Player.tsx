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
  const [sectionPositionOverride, setSectionPositionOverride] = useState<
    number | null
  >(null);

  const sortedSections = useSorted(piece.sections);
  const currentSectionPosition =
    sectionPositionOverride ?? playbackState.lastPlaySectionPosition ?? 0;
  const currentSection = sortedSections.find(
    (section) => section.position === currentSectionPosition,
  );

  useEffect(() => {
    if (!playbackState.playing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSectionPositionOverride(null);
    }
  }, [playbackState.playing]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <PlayerSheetDisplay
          piece={piece}
          currentSectionId={currentSection?.id}
        />

        {showControls && (
          <PlayerPlaybackControls
            sections={sortedSections}
            currentSection={currentSection}
            playing={playbackState.playing}
            tempoMultiplier={playbackState.tempoMultiplier}
            onPlay={onPlay}
            onPause={onPause}
            onTempoMultiplierChange={onTempoMultiplierChange}
            onSectionChange={onSectionChange}
          />
        )}

        <PlayerMetronome
          playing={playbackState.playing}
          lastPlayTimestamp={playbackState.lastPlayTimestamp}
          lastPlaySectionPosition={playbackState.lastPlaySectionPosition}
          tempoMultiplier={playbackState.tempoMultiplier}
          sortedSections={sortedSections}
          onSectionPositionOverrideChange={setSectionPositionOverride}
          onPlaybackEnded={onPause}
        />
      </CardContent>
    </Card>
  );
}
