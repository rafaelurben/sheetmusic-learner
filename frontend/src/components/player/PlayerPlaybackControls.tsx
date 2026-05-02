/*
 * (C) 2026. - Rafael Urben
 */
import {
  ChevronFirstIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  MetronomeIcon,
  PauseIcon,
  PlayIcon,
  RabbitIcon,
} from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import { Switch } from "@/shadcn/components/ui/switch.tsx";
import { useMainStore } from "@/zustand/mainStore.ts";
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
  const showMetronome = useMainStore((s) => s.showMetronome);
  const setShowMetronome = useMainStore((s) => s.setShowMetronome);
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
    <div className="grid [grid-template-areas:'section_section''btnleft_btnright'] lg:[grid-template-areas:'btnleft_section_btnright'] items-center gap-3">
      <div className="[grid-area:btnleft] flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          disabled={
            readonly || !currentSection || currentSection.position === 0
          }
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
      </div>

      <div className="[grid-area:section] text-center text-sm text-muted-foreground">
        {sectionPositionText}
      </div>

      <div className="[grid-area:btnright] flex items-center gap-3 justify-end">
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
              <Label className="text-sm font-medium">
                <RabbitIcon size="1rem" />
                Speed
                <div className="text-right text-sm text-muted-foreground">
                  {tempoMultiplier.toFixed(2)}x
                </div>
              </Label>
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
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  <MetronomeIcon size="1rem" />
                  Show metronome
                </Label>
                <Switch
                  checked={showMetronome}
                  onCheckedChange={setShowMetronome}
                />
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
    </div>
  );
}
