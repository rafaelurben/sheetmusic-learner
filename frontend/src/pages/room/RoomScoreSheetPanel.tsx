/*
 * (C) 2026. - Rafael Urben
 */
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { useMemo } from "react";
import { stompService } from "@/service/stompService.ts";
import type RoomControlPositionRequestDto from "@/interfaces/async/request/room/RoomControlPositionRequestDto.ts";
import type { PieceDto, RoomDto } from "@/api/generated/openapi";

interface RoomScoreSheetPanelProps {
  room: RoomDto;
  piece: PieceDto;
  canEditRoom: boolean;
}

export default function RoomScoreSheetPanel({
  room,
  piece,
  canEditRoom,
}: Readonly<RoomScoreSheetPanelProps>) {
  const sortedSections = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      [...(piece.sections ?? [])].sort(
        (left, right) => left.position - right.position,
      ),
    [piece.sections],
  );
  const sortedScoreSheets = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      [...(piece.scoreSheets ?? [])].sort(
        (left, right) => left.position - right.position,
      ),
    [piece.scoreSheets],
  );

  const firstSectionPosition = sortedSections[0]?.position ?? 0;
  const currentSectionPosition =
    room.lastPlaySectionPosition ?? firstSectionPosition;
  const currentSection = sortedSections.find(
    (section) => section.position === currentSectionPosition,
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
  const toPercent = (value: number) => String(value * 100) + "%";

  const minSectionPosition = sortedSections[0]?.position ?? 0;
  const maxSectionPosition =
    sortedSections.at(-1)?.position ?? minSectionPosition;
  const sectionPositionText =
    sortedSections.length > 0
      ? `Section ${String(currentSectionPosition + 1)} of ${String(maxSectionPosition + 1)} (${currentSection?.name ?? "unknown"})`
      : "No sections available";

  const isPreviousDisabled =
    sortedSections.length === 0 || currentSectionPosition <= minSectionPosition;
  const isNextDisabled =
    sortedSections.length === 0 || currentSectionPosition >= maxSectionPosition;

  const publishSectionPosition = (nextSectionPosition: number) => {
    if (!canEditRoom) {
      return;
    }

    stompService.publish(`/app/room.${room.id}/control/position`, {
      currentSectionPosition: nextSectionPosition,
    } satisfies RoomControlPositionRequestDto);
  };

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
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

        {canEditRoom && (
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t pt-4">
            <Button
              variant="outline"
              size="icon"
              disabled={isPreviousDisabled}
              onClick={() => {
                publishSectionPosition(currentSectionPosition - 1);
              }}
            >
              <ChevronLeftIcon />
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {sectionPositionText}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={isNextDisabled}
              onClick={() => {
                publishSectionPosition(currentSectionPosition + 1);
              }}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
