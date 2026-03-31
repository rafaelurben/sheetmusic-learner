/*
 * (C) 2026. - Rafael Urben
 */
import { Card } from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";
import type { ScoreSheetDto } from "@/api/generated/openapi";
import { PencilIcon, Trash2Icon, UploadIcon } from "lucide-react";
import UploadScoreSheetsDialog from "@/pages/piece/UploadScoreSheetsDialog.tsx";
import { useState } from "react";
import { toast } from "sonner";
import { stompService } from "@/service/stompService.ts";
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

    try {
      stompService.publish(`/app/piece.${piece.id}/score-sheet/update`, {
        scoreSheetId,
        title: trimmedTitle,
      });
    } catch (error) {
      console.error("Failed to rename score sheet:", error);
      toast.error("Failed to rename score sheet.");
    }
  };

  const handleConfirmDeleteScoreSheet = (scoreSheetId: string) => {
    toast.error("Delete this score sheet?", {
      description: "This action cannot be undone.",
      closeButton: false,
      action: {
        label: "Delete",
        onClick: () => {
          try {
            stompService.publish(`/app/piece.${piece.id}/score-sheet/delete`, {
              scoreSheetId,
            });
          } catch (error) {
            console.error("Failed to delete score sheet:", error);
            toast.error("Failed to delete score sheet.");
          }
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
              <div
                key={scoreSheet.id}
                className="space-y-2 rounded-md border p-3"
              >
                <img
                  src={scoreSheet.imageUrl}
                  alt={scoreSheet.title}
                  className="max-h-72 w-full rounded-md border bg-muted object-contain"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{scoreSheet.title}</div>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                          handleRenameScoreSheet(
                            scoreSheet.id,
                            scoreSheet.title,
                          );
                        }}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => {
                          handleConfirmDeleteScoreSheet(scoreSheet.id);
                        }}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
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
