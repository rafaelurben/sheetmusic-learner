import { type PieceDto } from "@/api/generated/openapi";
import Player from "@/components/player/Player.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog";
import { useMainStore } from "@/zustand/mainStore.ts";
import { useState } from "react";

interface PlaybackState {
  playing: boolean;
  tempoMultiplier: number;
  lastPlayTimestamp: string | null;
  lastPlaySectionPosition: number | null;
  countIn: boolean;
}

interface PiecePlayerDialogProps {
  piece: PieceDto;
  onClosePlayer: () => void;
}

export default function PiecePlayerDialog({
  piece,
  onClosePlayer,
}: Readonly<PiecePlayerDialogProps>) {
  const globalCountIn = useMainStore((state) => state.countIn);
  const setGlobalCountIn = useMainStore((state) => state.setCountIn);

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    playing: false,
    tempoMultiplier: 1,
    lastPlayTimestamp: null,
    lastPlaySectionPosition: 0,
    countIn: globalCountIn,
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

  const handleCountInChange = (countIn: boolean) => {
    if (playbackState.playing) {
      return;
    }

    setPlaybackState((currentState) => ({
      ...currentState,
      countIn: countIn,
    }));
    setGlobalCountIn(countIn);
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
      <DialogContent className="flex h-screen w-screen flex-col overflow-scroll p-4 max-w-[unset] sm:max-w-[unset]">
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
            onCountInChange={handleCountInChange}
            onSectionChange={handleSectionChange}
            allowFullScreen={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
