/*
 * (C) 2026. - Rafael Urben
 */
import { useEffect, useState } from "react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Switch } from "@/shadcn/components/ui/switch.tsx";
import { stompService } from "@/service/stompService.ts";
import type PieceUpdateRequestDto from "@/interfaces/async/request/piece/PieceUpdateRequestDto.ts";
import type { PieceDto } from "@/api/generated/openapi";

interface EditPieceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  piece: PieceDto;
}

export default function EditPieceDialog({
  open,
  onOpenChange,
  piece,
}: Readonly<EditPieceDialogProps>) {
  const [values, setValues] = useState({
    title: piece.title,
    composer: piece.composer,
    year: piece.year,
    description: piece.description,
    difficulty: piece.difficulty,
    bpmRange: piece.bpmRange,
    isPublic: piece.isPublic,
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({
        title: piece.title,
        composer: piece.composer,
        year: piece.year,
        description: piece.description,
        difficulty: piece.difficulty,
        bpmRange: piece.bpmRange,
        isPublic: piece.isPublic,
      });
    }
  }, [open, piece]);

  const trimmedValues = {
    ...values,
    title: values.title.trim(),
    composer: values.composer.trim(),
    year: values.year.trim(),
    description: values.description.trim(),
    difficulty: values.difficulty.trim(),
    bpmRange: values.bpmRange.trim(),
  };

  const canSave =
    trimmedValues.title &&
    trimmedValues.composer &&
    trimmedValues.year &&
    trimmedValues.description &&
    trimmedValues.difficulty &&
    trimmedValues.bpmRange;

  const handleSave = () => {
    if (!canSave) return;

    onOpenChange(false);

    try {
      stompService.publish(`/app/piece.${piece.id}/update`, {
        title: trimmedValues.title,
        composer: trimmedValues.composer,
        year: trimmedValues.year,
        description: trimmedValues.description,
        difficulty: trimmedValues.difficulty,
        bpmRange: trimmedValues.bpmRange,
        isPublic: trimmedValues.isPublic,
      } satisfies PieceUpdateRequestDto);
    } catch (error) {
      console.error(
        `Failed to send piece update for piece ${piece.id}:`,
        error,
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setValues({
      title: piece.title,
      composer: piece.composer,
      year: piece.year,
      description: piece.description,
      difficulty: piece.difficulty,
      bpmRange: piece.bpmRange,
      isPublic: piece.isPublic,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Piece</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="piece-title">Title</Label>
            <Input
              id="piece-title"
              value={values.title}
              onChange={(e) => {
                setValues((current) => ({ ...current, title: e.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-composer">Composer</Label>
            <Input
              id="piece-composer"
              value={values.composer}
              onChange={(e) => {
                setValues((current) => ({
                  ...current,
                  composer: e.target.value,
                }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-year">Year</Label>
            <Input
              id="piece-year"
              value={values.year}
              onChange={(e) => {
                setValues((current) => ({ ...current, year: e.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-description">Description</Label>
            <Input
              id="piece-description"
              value={values.description}
              onChange={(e) => {
                setValues((current) => ({
                  ...current,
                  description: e.target.value,
                }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-difficulty">Difficulty</Label>
            <Input
              id="piece-difficulty"
              value={values.difficulty}
              onChange={(e) => {
                setValues((current) => ({
                  ...current,
                  difficulty: e.target.value,
                }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-bpm-range">BPM Range</Label>
            <Input
              id="piece-bpm-range"
              value={values.bpmRange}
              onChange={(e) => {
                setValues((current) => ({
                  ...current,
                  bpmRange: e.target.value,
                }));
              }}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="piece-public">Public Piece</Label>
            <Switch
              id="piece-public"
              checked={values.isPublic}
              onCheckedChange={(checked) => {
                setValues((current) => ({
                  ...current,
                  isPublic: checked,
                }));
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
