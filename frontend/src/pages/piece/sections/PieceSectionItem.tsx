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
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shadcn/components/ui/popover.tsx";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import {
  CheckIcon,
  CopyIcon,
  GripVerticalIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RepeatIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import type { Dispatch, DragEvent, SetStateAction } from "react";
import { parseNullableNumberFromInput } from "@/service/utils.ts";
import { ButtonGroup } from "@/shadcn/components/ui/button-group.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu.tsx";

interface PieceSectionItemProps {
  section: SectionDto;
  canEdit: boolean;
  isEditMode?: boolean;
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
  onStartEdit?: () => void;
  onDuplicate?: () => void;
  onCancelEdit: () => void;
}

export default function PieceSectionItem({
  section,
  canEdit,
  isEditMode = false,
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
  onDuplicate,
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

  const handleDeleteSection = () => {
    if (!section.id) return;
    stompPublishingService.pieceSectionRemove(pieceId, {
      sectionId: section.id,
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

            <div className="flex items-end gap-2 flex-wrap">
              <div className="basis-20 grow-3">
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

              <div className="basis-12 grow-2">
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

              <div className="basis-12 grow-2">
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
                <Button size="icon-sm" onClick={handleSaveEditedSection}>
                  <CheckIcon />
                </Button>
                <Button variant="outline" size="icon-sm" onClick={onCancelEdit}>
                  <XIcon />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Section options"
                    >
                      <SlidersHorizontalIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 space-y-3">
                    <PopoverHeader>
                      <PopoverTitle>Section options</PopoverTitle>
                      <PopoverDescription>
                        Configure repetitions and section settings.
                      </PopoverDescription>
                    </PopoverHeader>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Repeat count
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={sectionForm.repeatCount ?? 1}
                        onChange={(event) => {
                          const value = parseNullableNumberFromInput(
                            event.target.value,
                          );
                          updateEditingForm({
                            repeatCount:
                              value !== null ? Math.max(1, value) : 1,
                          });
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
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

              {section.repeatCount > 1 && (
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">
                    Repeats
                  </Label>
                  <div className="mt-1 font-medium flex items-center gap-1">
                    <RepeatIcon className="size-3.5 text-muted-foreground" />
                    <span>{String(section.repeatCount)}x</span>
                  </div>
                </div>
              )}

              {canEdit && isEditMode && (
                <div className="flex gap-1 self-end">
                  {isDraggable ? (
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
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={true}
                      size="icon-sm"
                      aria-label="Drag section"
                    >
                      <GripVerticalIcon />
                    </Button>
                  )}
                  <ButtonGroup>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => {
                        onStartEdit?.();
                      }}
                    >
                      <PencilIcon />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="More options"
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={onDuplicate}>
                            <CopyIcon />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={handleDeleteSection}
                          >
                            <Trash2Icon />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </ButtonGroup>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
