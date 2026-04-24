/*
 * (C) 2026. - Rafael Urben
 */
import {
  ChevronFirstIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shadcn/components/ui/popover.tsx";
import { Slider } from "@/shadcn/components/ui/slider.tsx";
import type { SectionDto } from "@/api/generated/openapi";
import { useEffect } from "react";

interface PlayerPlaybackControlsProps {
  playing: boolean;
  readonly?: boolean;
  tempoMultiplier: number;
  sections: SectionDto[];
  currentSection: SectionDto | undefined;
  onPlay: () => void;
  onPause: () => void;
  onTempoMultiplierChange: (nextTempoMultiplier: number) => void;
  onSectionChange: (nextSectionPosition: number) => void;
}

export default function PlayerPlaybackControls({
  playing,
  readonly = false,
  tempoMultiplier,
  sections,
  currentSection,
  onPlay,
  onPause,
  onTempoMultiplierChange,
  onSectionChange,
}: Readonly<PlayerPlaybackControlsProps>) {
  const lastSection = sections.at(-1);

  let sectionPositionText = "No sections available!";
  if (lastSection && currentSection) {
    sectionPositionText = `Section ${String(currentSection.position + 1)} of ${String(lastSection.position + 1)} (${currentSection.name})`;
  } else if (lastSection) {
    sectionPositionText = "Unknown section";
  }
  const isPreviousDisabled = !currentSection || currentSection.position == 0;
  const isNextDisabled =
    !currentSection ||
    !lastSection ||
    currentSection.position == lastSection.position;

  // Keyboard controls
  useEffect(() => {
    if (readonly) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLButtonElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        // Don't interfere with typing in input fields or navigation
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          if (playing) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case "ArrowLeft":
          if (!isPreviousDisabled) {
            onSectionChange(currentSection.position - 1);
          }
          break;
        case "ArrowRight":
          if (!isNextDisabled) {
            onSectionChange(currentSection.position + 1);
          }
          break;
        case "r":
          onSectionChange(0);
          break;
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentSection,
    isNextDisabled,
    isPreviousDisabled,
    onPause,
    onPlay,
    onSectionChange,
    playing,
    readonly,
  ]);

  return (
    <div className="grid grid-cols-[auto_auto_auto_1fr_auto_auto] items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        disabled={readonly || !currentSection || currentSection.position === 0}
        onClick={() => {
          if (currentSection) onSectionChange(0);
        }}
      >
        <ChevronFirstIcon />
      </Button>

      <Button
        variant="outline"
        size="icon"
        disabled={readonly || isPreviousDisabled}
        onClick={() => {
          if (currentSection) onSectionChange(currentSection.position - 1);
        }}
      >
        <ChevronLeftIcon />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={playing ? onPause : onPlay}
        className="col-start-3"
        disabled={readonly}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {sectionPositionText}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open player controls"
          >
            <CogIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <PopoverHeader>
            <PopoverTitle>Playback controls</PopoverTitle>
            <PopoverDescription>Readonly during playback.</PopoverDescription>
          </PopoverHeader>

          <div className="mt-4 flex flex-col gap-3">
            <Label className="text-sm font-medium">Speed</Label>
            <Slider
              value={[tempoMultiplier]}
              onValueChange={(value) => {
                onTempoMultiplierChange(value[0]);
              }}
              min={0.1}
              max={4}
              step={0.01}
              disabled={playing || readonly}
              className="w-full"
            />
            <div className="text-right text-sm text-muted-foreground">
              {tempoMultiplier.toFixed(2)}x
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        disabled={readonly || isNextDisabled}
        onClick={() => {
          if (currentSection) onSectionChange(currentSection.position + 1);
        }}
        className="col-start-6"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
