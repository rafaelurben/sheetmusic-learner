/*
 * (C) 2026. - Rafael Urben
 */
import {
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

  return (
    <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-3">
      {!readonly && (
        <Button
          variant="outline"
          size="icon"
          disabled={isPreviousDisabled}
          onClick={() => {
            if (currentSection) onSectionChange(currentSection.position - 1);
          }}
          className="col-start-1"
        >
          <ChevronLeftIcon />
        </Button>
      )}

      {!readonly && (
        <Button
          variant="outline"
          size="icon"
          onClick={playing ? onPause : onPlay}
          className="col-start-2"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </Button>
      )}

      <div className="text-center text-sm text-muted-foreground col-start-3">
        {sectionPositionText}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open player controls"
            className="col-start-4"
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

      {!readonly && (
        <Button
          variant="outline"
          size="icon"
          disabled={isNextDisabled}
          onClick={() => {
            if (currentSection) onSectionChange(currentSection.position + 1);
          }}
          className="col-start-5"
        >
          <ChevronRightIcon />
        </Button>
      )}
    </div>
  );
}
