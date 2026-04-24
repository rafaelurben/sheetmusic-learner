/*
 * (C) 2026. - Rafael Urben
 */
import type { ScoreSheetDto, SectionDto } from "@/api/generated/openapi";
import {
  buildSectionPayloadFromForm,
  type SectionFormState,
  UNASSIGNED_SCORE_SHEET_VALUE,
} from "@/pages/piece/sections/PieceSectionFormUtils.ts";
import PieceSectionTimeSelector from "@/pages/piece/sections/PieceSectionTimeSelector.tsx";
import { stompPublishingService } from "@/service/stompPublishingService.ts";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import { cn } from "@/shadcn/lib/utils.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select.tsx";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import {
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import type { Dispatch, DragEvent, SetStateAction } from "react";
import { toast } from "sonner";
import { parseNullableNumberFromInput } from "@/service/utils.ts";

interface PieceSectionItemProps {
  section: SectionDto;
  canEdit: boolean;
  isEditing: boolean;
  isNewSection?: boolean;
  sectionForm: SectionFormState | null;
  scoreSheets: ScoreSheetDto[];
  setSectionForm: Dispatch<SetStateAction<SectionFormState | null>>;
  isDraggable?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onSaveCreate?: (form: SectionFormState) => void;
  onStartEdit?: (section: SectionDto) => void;
  onCancelEdit: () => void;
}

export default function PieceSectionItem({
  section,
  canEdit,
  isEditing,
  isNewSection = false,
  sectionForm,
  scoreSheets,
  setSectionForm,
  isDraggable = false,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onSaveCreate,
  onStartEdit,
  onCancelEdit,
}: Readonly<PieceSectionItemProps>) {
  const pieceId = usePieceStore((state) => state.piece.id);

  const updateEditingForm = (patch: Partial<SectionFormState>) => {
    if (!sectionForm) return;
    setSectionForm({
      ...sectionForm,
      ...patch,
    });
  };

  const handleSaveEditedSection = () => {
    if (!sectionForm) return;

    if (isNewSection) {
      onSaveCreate?.(sectionForm);
      return;
    }

    if (!section.id) return;

    const sectionPayload = buildSectionPayloadFromForm(sectionForm);
    if (!sectionPayload) return;

    stompPublishingService.pieceSectionUpdate(pieceId, {
      sectionId: section.id,
      ...sectionPayload,
    });
    onCancelEdit();
  };

  const handleConfirmDeleteSection = () => {
    if (isNewSection) return;
    if (!section.id) return;

    toast.error("Delete this section?", {
      description: "This action cannot be undone.",
      closeButton: false,
      action: {
        label: "Delete",
        onClick: () => {
          stompPublishingService.pieceSectionRemove(pieceId, {
            sectionId: section.id,
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

  const sheetTitle = section.scoreSheetId
    ? (scoreSheets.find((scoreSheet) => scoreSheet.id === section.scoreSheetId)
        ?.title ?? "Assigned")
    : "Unassigned";

  const timeLabel = `${String(section.timeSignatureNumerator)}/${String(
    section.timeSignatureDenominator,
  )}`;

  return (
    <Card
      className={cn(
        "border-2 transition-colors",
        isDragging && "bg-muted/50 opacity-75",
        isDropTarget && "border-primary bg-primary/5 ring-1 ring-primary/20",
        "py-4",
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="space-y-2 px-5">
        {canEdit && isEditing && sectionForm ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  #{section.position + 1}
                </div>
                <Input
                  value={sectionForm.name}
                  onChange={(event) => {
                    updateEditingForm({ name: event.target.value });
                  }}
                  placeholder={isNewSection ? "Section" : "Section name"}
                  className="h-8"
                  autoFocus={true}
                />
              </div>
              <Select
                value={sectionForm.scoreSheetId}
                onValueChange={(value) => {
                  updateEditingForm({ scoreSheetId: value });
                }}
              >
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_SCORE_SHEET_VALUE}>
                    Unassigned
                  </SelectItem>
                  {scoreSheets.map((scoreSheet) => (
                    <SelectItem key={scoreSheet.id} value={scoreSheet.id}>
                      #{scoreSheet.position + 1} {scoreSheet.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <PieceSectionTimeSelector
                  numerator={sectionForm.timeSignatureNumerator}
                  denominator={sectionForm.timeSignatureDenominator}
                  onSignatureChange={(value) => {
                    updateEditingForm({
                      timeSignatureNumerator:
                        value.numerator ?? sectionForm.timeSignatureNumerator,
                      timeSignatureDenominator:
                        value.denominator ??
                        sectionForm.timeSignatureDenominator,
                    });
                  }}
                />
              </div>

              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Bars</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  className="mt-1"
                  value={sectionForm.barCount ?? ""}
                  onChange={(event) => {
                    updateEditingForm({
                      barCount: parseNullableNumberFromInput(
                        event.target.value,
                      ),
                    });
                  }}
                />
              </div>

              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">BPM</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={sectionForm.bpm ?? ""}
                  onChange={(event) => {
                    updateEditingForm({
                      bpm: parseNullableNumberFromInput(event.target.value),
                    });
                  }}
                />
              </div>

              <div className="flex gap-1 self-end">
                <Button variant="outline" size="icon-sm" onClick={onCancelEdit}>
                  <XIcon />
                </Button>
                {!isNewSection && (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={handleConfirmDeleteSection}
                  >
                    <Trash2Icon />
                  </Button>
                )}
                <Button size="icon-sm" onClick={handleSaveEditedSection}>
                  <CheckIcon />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  #{section.position + 1}
                </div>
                <div className="min-w-0 text-sm font-semibold">
                  {section.name}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{sheetTitle}</div>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Time</Label>
                <div className="mt-1 font-medium">{timeLabel}</div>
              </div>

              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Bars</Label>
                <div className="mt-1 font-medium">
                  {String(section.barCount)}
                </div>
              </div>

              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">BPM</Label>
                <div className="mt-1 font-medium">{String(section.bpm)}</div>
              </div>

              {canEdit && (
                <div className="flex gap-1 self-end">
                  {isDraggable && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-grab active:cursor-grabbing"
                      aria-label="Drag section"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", section.id);
                        onDragStart?.(event);
                      }}
                      onDragEnd={() => {
                        onDragEnd?.();
                      }}
                    >
                      <GripVerticalIcon />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => {
                      onStartEdit?.(section);
                    }}
                  >
                    <PencilIcon />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
