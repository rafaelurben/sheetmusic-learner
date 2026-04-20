/*
 * (C) 2026. - Rafael Urben
 */
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import { Slider } from "@/shadcn/components/ui/slider.tsx";
import type { SectionDto } from "@/api/generated/openapi";

interface RoomPlayerControlsProps {
  playing: boolean;
  tempoMultiplier: number;
  sections: SectionDto[];
  currentSection: SectionDto | undefined;
  onPlay: () => void;
  onPause: () => void;
  onTempoMultiplierChange: (nextTempoMultiplier: number) => void;
  onSectionChange: (nextSectionPosition: number) => void;
}

export default function RoomPlayerControls({
  playing,
  tempoMultiplier,
  sections,
  currentSection,
  onPlay,
  onPause,
  onTempoMultiplierChange,
  onSectionChange,
}: Readonly<RoomPlayerControlsProps>) {
  if (sections.length <= 0) {
    return (
      <div className="flex flex-col gap-4 border-t pt-4">
        <div className="text-center text-sm text-muted-foreground">
          No sections available!
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastSection = sections.at(-1)!;

  const sectionPositionText = currentSection
    ? `Section ${String(currentSection.position + 1)} of ${String(lastSection.position + 1)} (${currentSection.name})`
    : "Unknown section";
  const isPreviousDisabled = !currentSection || currentSection.position == 0;
  const isNextDisabled =
    !currentSection || currentSection.position == lastSection.position;

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          disabled={isPreviousDisabled}
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
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {sectionPositionText}
        </div>

        <Button
          variant="outline"
          size="icon"
          disabled={isNextDisabled}
          onClick={() => {
            if (currentSection) onSectionChange(currentSection.position + 1);
          }}
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <Label className="text-sm font-medium sm:w-28">Tempo</Label>
        <Slider
          value={[tempoMultiplier]}
          onValueChange={(value) => {
            onTempoMultiplierChange(value[0]);
          }}
          min={0.1}
          max={4}
          step={0.01}
          disabled={playing}
          className="w-full"
        />
        <div className="w-16 text-right text-sm text-muted-foreground">
          {tempoMultiplier.toFixed(2)}x
        </div>
      </div>
    </div>
  );
}
