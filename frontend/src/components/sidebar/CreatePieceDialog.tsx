/*
 * (C) 2026. - Rafael Urben
 */
import { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog";
import { Label } from "@/shadcn/components/ui/label";
import { Input } from "@/shadcn/components/ui/input";
import { Switch } from "@/shadcn/components/ui/switch";
import { usePiecesApi } from "@/api/useAuthenticatedApiClient.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CreatePieceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const initialValues = {
  title: "",
  composer: "",
  year: "",
  description: "",
  difficulty: "",
  bpmRange: "",
  isPublic: false,
};

export function CreatePieceDialog({
  open,
  onOpenChange,
}: Readonly<CreatePieceDialogProps>) {
  const navigate = useNavigate();
  const piecesApi = usePiecesApi();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  const canCreate =
    values.title.trim() &&
    values.composer.trim() &&
    values.year.trim() &&
    values.description.trim() &&
    values.difficulty.trim() &&
    values.bpmRange.trim();

  const updateField = (
    key: Exclude<keyof typeof initialValues, "isPublic">,
    value: string,
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const resetDialog = () => {
    setValues(initialValues);
  };

  const handleCreatePiece = async () => {
    if (!canCreate) return;

    setIsSubmitting(true);
    try {
      const newPiece = await piecesApi.createPiece({
        pieceCreateRequestDto: {
          title: values.title.trim(),
          composer: values.composer.trim(),
          year: values.year.trim(),
          description: values.description.trim(),
          difficulty: values.difficulty.trim(),
          bpmRange: values.bpmRange.trim(),
          isPublic: values.isPublic,
        },
      });

      onOpenChange(false);
      resetDialog();
      void navigate(`/pieces/${newPiece.id}`);
      toast.success("Successfully created new piece!");
    } catch (error) {
      console.error("Failed to create piece:", error);
      toast.error("Failed to create piece!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetDialog();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Piece</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="piece-title">Title</Label>
            <Input
              id="piece-title"
              value={values.title}
              onChange={(e) => {
                updateField("title", e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-composer">Composer</Label>
            <Input
              id="piece-composer"
              value={values.composer}
              onChange={(e) => {
                updateField("composer", e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-year">Year</Label>
            <Input
              id="piece-year"
              value={values.year}
              onChange={(e) => {
                updateField("year", e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-description">Description</Label>
            <Input
              id="piece-description"
              value={values.description}
              onChange={(e) => {
                updateField("description", e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-difficulty">Difficulty</Label>
            <Input
              id="piece-difficulty"
              value={values.difficulty}
              onChange={(e) => {
                updateField("difficulty", e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piece-bpm-range">BPM Range</Label>
            <Input
              id="piece-bpm-range"
              value={values.bpmRange}
              onChange={(e) => {
                updateField("bpmRange", e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="piece-is-public">Public Piece</Label>
            <Switch
              id="piece-is-public"
              checked={values.isPublic}
              onCheckedChange={(checked) => {
                setValues((current) => ({
                  ...current,
                  isPublic: checked,
                }));
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleCreatePiece();
            }}
            disabled={isSubmitting || !canCreate}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
