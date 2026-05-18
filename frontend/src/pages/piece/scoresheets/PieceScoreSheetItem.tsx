/*
 * (C) 2026. - Rafael Urben
 */

import type { ScoreSheetDto } from "@/api/generated/openapi";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { CircleCheckIcon, CircleIcon, EyeIcon, PencilIcon } from "lucide-react";
import DeleteButton from "@/components/deleteButton.tsx";
import ScoreSheetWithOverlayEditor from "@/pages/piece/scoresheets/ScoreSheetWithOverlayEditor.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog.tsx";
import type SectionCoordinates from "@/interfaces/SectionCoordinates.ts";

interface PieceScoreSheetItemProps {
  scoreSheet: ScoreSheetDto;
  showEditDeleteActions: boolean;
  showSelectActions: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isPreview: boolean;
  onPreview: () => void;
  onPreviewClose: () => void;
  sectionOverlayCoordinates: SectionCoordinates | null;
  onSectionOverlayCoordinatesChange: (nextOverlay: SectionCoordinates) => void;
  onRename: (scoreSheetId: string, currentTitle: string) => void;
  onDelete: (scoreSheetId: string) => void;
}

export default function PieceScoreSheetItem({
  scoreSheet,
  showEditDeleteActions,
  showSelectActions,
  isSelected,
  onSelect,
  isPreview,
  onPreview,
  onPreviewClose,
  sectionOverlayCoordinates,
  onSectionOverlayCoordinatesChange,
  onRename,
  onDelete,
}: Readonly<PieceScoreSheetItemProps>) {
  return (
    <div className="space-y-2 rounded-md shadow-sm border-2 p-3 bg-card text-card-foreground flex flex-col">
      <div className="flex justify-center max-h-72">
        <ScoreSheetWithOverlayEditor
          scoreSheet={scoreSheet}
          sectionOverlayCoordinates={sectionOverlayCoordinates}
          onSectionOverlayCoordinatesChange={onSectionOverlayCoordinatesChange}
        />
      </div>

      <div
        className="flex items-center justify-between gap-2 mt-auto"
        id={`score-sheet-item-${scoreSheet.id}`}
      >
        <div className="text-sm font-medium">{scoreSheet.title}</div>
        <div className="flex items-center gap-1">
          {showEditDeleteActions && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => {
                  onRename(scoreSheet.id, scoreSheet.title);
                }}
              >
                <PencilIcon className="size-4" />
              </Button>
              <DeleteButton
                variant="ghost"
                title="Delete this score sheet?"
                action={() => {
                  onDelete(scoreSheet.id);
                }}
              />
            </>
          )}
          {showSelectActions && (
            <Button
              variant={isSelected ? "default" : "outline"}
              size="icon-xs"
              disabled={isSelected}
              onClick={onSelect}
            >
              {isSelected ? <CircleCheckIcon /> : <CircleIcon />}
            </Button>
          )}
          <Button variant="default" size="icon-xs" onClick={onPreview}>
            <EyeIcon className="size-4" />
          </Button>
        </div>
      </div>

      {isPreview && (
        <Dialog open={true} onOpenChange={onPreviewClose}>
          <DialogContent className="flex h-screen w-screen flex-col overflow-scroll p-4 max-w-[unset] sm:max-w-[unset]">
            <DialogHeader>
              <DialogTitle>Score sheet: {scoreSheet.title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-1 justify-center min-h-0">
              <ScoreSheetWithOverlayEditor
                scoreSheet={scoreSheet}
                sectionOverlayCoordinates={sectionOverlayCoordinates}
                onSectionOverlayCoordinatesChange={
                  onSectionOverlayCoordinatesChange
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
