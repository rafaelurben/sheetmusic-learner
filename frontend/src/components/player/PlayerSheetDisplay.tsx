/*
 * (C) 2026. - Rafael Urben
 */
import type { PieceDto } from "@/api/generated/openapi";
import type { PlayerSectionState } from "@/interfaces/player/playerSectionState.ts";
import { useSorted } from "@/service/hooks.ts";
import { type CSSProperties, useRef, useState } from "react";
import { RepeatIcon } from "lucide-react";
import { useMainStore } from "@/zustand/mainStore.ts";

interface PlayerSheetDisplayProps {
  piece: PieceDto;
  currentSectionId?: string;
  sectionPlaybackState: PlayerSectionState | null;
}

const toPercent = (value: number) => String(value * 100) + "%";

export default function PlayerSheetDisplay({
  piece,
  currentSectionId,
  sectionPlaybackState,
}: Readonly<PlayerSheetDisplayProps>) {
  const sortedSections = useSorted(piece.sections);
  const sortedScoreSheets = useSorted(piece.scoreSheets);

  const currentSection = sortedSections.find(
    (section) => section.id === currentSectionId,
  );
  const visibleScoreSheet = currentSection
    ? sortedScoreSheets.find(
        (scoreSheet) => scoreSheet.id === currentSection.scoreSheetId,
      )
    : undefined;
  const displayedScoreSheet = visibleScoreSheet ?? sortedScoreSheets[0];
  const sectionHighlightingEnabled = useMainStore(
    (state) => state.sectionHighlightingEnabled,
  );
  const highlightedSection =
    currentSection && currentSection.scoreSheetId === visibleScoreSheet?.id
      ? currentSection
      : undefined;

  const progressBarStyle: CSSProperties | undefined = sectionPlaybackState
    ? ({
        "--section-progress-duration": `${String(sectionPlaybackState.durationMs)}ms`,
        "--section-progress-delay": `${String(
          // eslint-disable-next-line react-hooks/purity
          sectionPlaybackState.startTimeMs - Date.now(),
        )}ms`,
      } as CSSProperties & Record<string, string>)
    : undefined;

  const imageRef = useRef<HTMLImageElement>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const updateAspectRatio = () => {
    if (imageRef.current) {
      setAspectRatio(
        imageRef.current.naturalWidth / imageRef.current.naturalHeight,
      );
    }
  };

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      {sortedScoreSheets.length === 0 ? (
        <div className="text-center text-muted-foreground">
          This piece has no score sheets yet.
        </div>
      ) : (
        <div
          style={{
            aspectRatio: aspectRatio,
          }}
          className="relative inline-block max-w-full max-h-full"
        >
          <img
            ref={imageRef}
            src={displayedScoreSheet.imageUrl}
            alt={displayedScoreSheet.title}
            className="max-h-full max-w-full rounded-lg border bg-muted"
            onLoad={updateAspectRatio}
          />

          {sectionHighlightingEnabled && highlightedSection && (
            <div
              id="section-highlight"
              className="pointer-events-none absolute overflow-hidden rounded-md border-2 border-section-highlight bg-section-highlight/10 shadow-sm"
              style={{
                left: toPercent(highlightedSection.posX1),
                top: toPercent(highlightedSection.posY1),
                width: toPercent(
                  highlightedSection.posX2 - highlightedSection.posX1,
                ),
                height: toPercent(
                  highlightedSection.posY2 - highlightedSection.posY1,
                ),
              }}
            >
              {progressBarStyle && (
                <>
                  {/* NOTE: key is required to restart animation on section change and repeat. */}
                  <div
                    key={`${currentSectionId}-${sectionPlaybackState?.repeatIndex ?? 0}`}
                    className="overflow-hidden absolute inset-x-0 bottom-0 h-1 bg-section-highlight/30"
                  >
                    <div
                      className="section-progress-fill h-full w-full bg-section-highlight-foreground/90"
                      style={progressBarStyle}
                    />
                  </div>
                  {sectionPlaybackState?.willRepeat && (
                    <div
                      className="absolute bottom-1 right-1 flex items-center justify-center rounded bg-section-highlight/90 p-0.5 text-section-highlight-foreground shadow-sm"
                      title="This section will repeat"
                    >
                      <RepeatIcon className="size-2" />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
