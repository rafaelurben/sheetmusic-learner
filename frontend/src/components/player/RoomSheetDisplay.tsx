/*
 * (C) 2026. - Rafael Urben
 */
import type { PieceDto } from "@/api/generated/openapi";
import { useSorted } from "@/service/hooks.ts";

interface RoomSheetDisplayProps {
  piece: PieceDto;
  currentSectionId?: string;
}

const toPercent = (value: number) => String(value * 100) + "%";

export default function RoomSheetDisplay({
  piece,
  currentSectionId,
}: Readonly<RoomSheetDisplayProps>) {
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
                className="pointer-events-none absolute rounded-md border-2 border-section-highlight bg-section-highlight/10 shadow-sm"
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
              ></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
