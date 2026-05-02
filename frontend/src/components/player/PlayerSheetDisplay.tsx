/*
 * (C) 2026. - Rafael Urben
 */
import type { PieceDto } from "@/api/generated/openapi";
import type { PlayerSectionState } from "@/interfaces/player/playerSectionState.ts";
import { useSorted } from "@/service/hooks.ts";
import type { CSSProperties } from "react";

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

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      {sortedScoreSheets.length === 0 ? (
        <div className="text-center text-muted-foreground">
          This piece has no score sheets yet.
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="relative inline-block">
            <img
              src={displayedScoreSheet.imageUrl}
              alt={displayedScoreSheet.title}
              className="max-w-full rounded-lg border bg-muted"
            />

            {highlightedSection && (
              <div
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
                  /* NOTE: key is required to restart animation on section change. */
                  <div
                    key={currentSectionId}
                    className="overflow-hidden absolute inset-x-0 bottom-0 h-1 bg-section-highlight/30"
                  >
                    <div
                      className="section-progress-fill h-full w-full bg-section-highlight-foreground/90"
                      style={progressBarStyle}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
