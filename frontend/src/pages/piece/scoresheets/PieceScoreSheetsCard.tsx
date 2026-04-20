/*
 * (C) 2026. - Rafael Urben
 */
import { Card } from "@/shadcn/components/ui/card.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import type { ScoreSheetDto } from "@/api/generated/openapi";
import { UploadIcon } from "lucide-react";
import UploadScoreSheetsDialog from "@/pages/piece/scoresheets/UploadScoreSheetsDialog.tsx";
import PieceScoreSheetItem from "@/pages/piece/scoresheets/PieceScoreSheetItem.tsx";
import { UNASSIGNED_SCORE_SHEET_VALUE } from "@/pages/piece/sections/PieceSectionFormUtils.ts";
import { useState } from "react";
import { toast } from "sonner";
import { stompPublishingService } from "@/service/stompPublishingService.ts";
import { usePieceStore } from "@/zustand/pieceStore.ts";

interface PieceScoreSheetsCardProps {
  scoreSheets: ScoreSheetDto[];
  canEdit: boolean;
}

export default function PieceScoreSheetsCard({
  scoreSheets,
  canEdit,
}: Readonly<PieceScoreSheetsCardProps>) {
  const piece = usePieceStore((state) => state.piece);
  const sectionForm = usePieceStore((state) => state.sectionForm);
  const setSectionForm = usePieceStore((state) => state.setSectionForm);

  const [isUploadScoreSheetsOpen, setIsUploadScoreSheetsOpen] = useState(false);

  const handleRenameScoreSheet = (
    scoreSheetId: string,
    currentTitle: string,
  ) => {
    const nextTitle = globalThis.prompt("Rename score sheet", currentTitle);
    if (nextTitle === null) return;

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) {
      toast.error("Title cannot be empty.");
      return;
    }

    if (trimmedTitle === currentTitle) {
      return;
    }

    stompPublishingService.pieceScoreSheetUpdate(piece.id, {
      scoreSheetId,
      title: trimmedTitle,
    });
  };

  const handleConfirmDeleteScoreSheet = (scoreSheetId: string) => {
    toast.error("Delete this score sheet?", {
      description: "This action cannot be undone.",
      closeButton: false,
      action: {
        label: "Delete",
        onClick: () => {
          stompPublishingService.pieceScoreSheetDelete(piece.id, {
            scoreSheetId,
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss();
        },
      },
    });
  };

  const activeSectionScoreSheetId =
    sectionForm && sectionForm.scoreSheetId !== UNASSIGNED_SCORE_SHEET_VALUE
      ? sectionForm.scoreSheetId
      : null;
  const isSectionEditing = sectionForm !== null;

  return (
    <Card className="flex min-h-0 flex-1 flex-col p-4">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {scoreSheets.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed text-sm text-muted-foreground">
            No score sheets uploaded yet.
          </div>
        ) : (
          <div className="grid gap-3 pr-1 sm:grid-cols-2">
            {scoreSheets.map((scoreSheet) => (
              <PieceScoreSheetItem
                key={scoreSheet.id}
                scoreSheet={scoreSheet}
                canEditActions={canEdit && !isSectionEditing}
                sectionOverlayCoordinates={
                  sectionForm && scoreSheet.id === activeSectionScoreSheetId
                    ? {
                        x1: sectionForm.posX1,
                        y1: sectionForm.posY1,
                        x2: sectionForm.posX2,
                        y2: sectionForm.posY2,
                      }
                    : null
                }
                onSectionOverlayCoordinatesChange={(nextOverlay) => {
                  setSectionForm((currentSectionForm) => {
                    if (currentSectionForm?.scoreSheetId !== scoreSheet.id) {
                      return currentSectionForm;
                    }

                    return {
                      ...currentSectionForm,
                      posX1: nextOverlay.x1,
                      posY1: nextOverlay.y1,
                      posX2: nextOverlay.x2,
                      posY2: nextOverlay.y2,
                    };
                  });
                }}
                onRename={handleRenameScoreSheet}
                onDelete={handleConfirmDeleteScoreSheet}
              />
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <div className="mt-4 border-t pt-4">
          <Button
            className="w-full gap-2"
            onClick={() => {
              setIsUploadScoreSheetsOpen(true);
            }}
          >
            <UploadIcon className="size-4" />
            Upload score sheets
          </Button>
        </div>
      )}

      <UploadScoreSheetsDialog
        open={isUploadScoreSheetsOpen}
        onOpenChange={setIsUploadScoreSheetsOpen}
        pieceId={piece.id}
      />
    </Card>
  );
}
