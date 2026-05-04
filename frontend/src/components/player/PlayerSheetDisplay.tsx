/*
 * (C) 2026. - Rafael Urben
 */
import type { PieceDto } from "@/api/generated/openapi";
import type { PlayerSectionState } from "@/interfaces/player/playerSectionState.ts";
import { useSorted } from "@/service/hooks.ts";
import { type CSSProperties, useEffect, useRef, useState } from "react";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [highlightRect, setHighlightRect] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const img = imgRef.current;
      if (!container || !img) return;

      const c = container.getBoundingClientRect();
      const i = img.getBoundingClientRect();

      setHighlightRect({
        width: i.width,
        height: i.height,
        offsetX: i.left - c.left,
        offsetY: i.top - c.top,
      });
    };

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (imgRef.current) ro.observe(imgRef.current);

    update();
    const updateTimeout = setTimeout(update, 100);

    return () => {
      ro.disconnect();
      clearTimeout(updateTimeout);
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      {sortedScoreSheets.length === 0 ? (
        <div className="text-center text-muted-foreground">
          This piece has no score sheets yet.
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative max-w-full max-h-full h-full"
        >
          <img
            ref={imgRef}
            src={displayedScoreSheet.imageUrl}
            alt={displayedScoreSheet.title}
            className="block max-w-full max-h-full min-h-0 m-0 object-contain rounded-lg border bg-muted"
          />

          {highlightedSection && (
            <div
              id="section-highlight-container"
              className="absolute"
              style={{
                left: highlightRect.offsetX,
                top: highlightRect.offsetY,
                width: highlightRect.width,
                height: highlightRect.height,
              }}
            >
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
