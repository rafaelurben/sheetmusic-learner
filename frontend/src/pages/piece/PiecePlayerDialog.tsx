import { type PieceDto } from "@/api/generated/openapi";
import Player from "@/components/player/Player.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog";
import { useState } from "react";

interface PiecePlayerDialogProps {
  piece: PieceDto;
  onClosePlayer: () => void;
}

export default function PiecePlayerDialog({
  piece,
  onClosePlayer,
}: Readonly<PiecePlayerDialogProps>) {
  const [playbackState, setPlaybackState] = useState({
    playing: false,
    tempoMultiplier: 1,
    lastPlayTimestamp: null as string | null,
    lastPlaySectionPosition: 0 as number | null,
  });

  const handlePlay = () => {
    setPlaybackState((currentState) => ({
      ...currentState,
      playing: true,
      lastPlayTimestamp: new Date(Date.now() + 1000).toISOString(),
      lastPlaySectionPosition: currentState.lastPlaySectionPosition ?? 0,
    }));
  };

  const handlePause = () => {
    setPlaybackState((currentState) => ({
      ...currentState,
      playing: false,
    }));
  };

  const handleTempoMultiplierChange = (nextTempoMultiplier: number) => {
    if (playbackState.playing) {
      return;
    }

    setPlaybackState((currentState) => ({
      ...currentState,
      tempoMultiplier: nextTempoMultiplier,
    }));
  };

  const handleSectionChange = (nextSectionPosition: number) => {
    setPlaybackState((currentState) => ({
      ...currentState,
      lastPlayTimestamp: new Date(Date.now() + 1000).toISOString(),
      lastPlaySectionPosition: nextSectionPosition,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClosePlayer}>
      <DialogContent className="flex h-screen w-screen flex-col overflow-scroll p-4 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Play: {piece.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 min-h-0">
          <Player
            piece={piece}
            playbackState={playbackState}
            showControls
            onPlay={handlePlay}
            onPause={handlePause}
            onTempoMultiplierChange={handleTempoMultiplierChange}
            onSectionChange={handleSectionChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
