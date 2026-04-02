/*
 * (C) 2026. - Rafael Urben
 */
import type { ScoreSheetDto, SectionDto } from "@/api/generated/openapi";
import type PieceSectionAddRequestDto from "@/interfaces/async/request/piece/PieceSectionAddRequestDto.ts";
import {
  type SectionFormState,
  UNASSIGNED_SCORE_SHEET_VALUE,
} from "@/pages/piece/sections/PieceSectionFormUtils.ts";
import PieceSectionTimeSelector from "@/pages/piece/sections/PieceSectionTimeSelector.tsx";
import { stompService } from "@/service/stompService.ts";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select.tsx";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
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
  buildSectionPayloadFromForm: (
    form: SectionFormState,
    currentSection?: SectionDto,
  ) => PieceSectionAddRequestDto | null;
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
  buildSectionPayloadFromForm,
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

    const sectionPayload = buildSectionPayloadFromForm(sectionForm, section);
    if (!sectionPayload) return;

    stompService.publish(`/app/piece.${pieceId}/section/update`, {
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
          stompService.publish(`/app/piece.${pieceId}/section/remove`, {
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
    <Card className="border-2">
      <CardContent className="space-y-3">
        {canEdit && isEditing && sectionForm ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">
                {isNewSection
                  ? `New section #${String(section.position + 1)}`
                  : `Section #${String(section.position + 1)}`}
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
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">
                Section #{section.position + 1}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
