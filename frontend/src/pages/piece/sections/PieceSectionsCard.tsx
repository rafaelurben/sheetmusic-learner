/*
 * (C) 2026. - Rafael Urben
 */
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import type { SectionDto } from "@/api/generated/openapi";
import type PieceSectionAddRequestDto from "@/interfaces/async/request/piece/PieceSectionAddRequestDto.ts";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import PieceSectionItem from "@/pages/piece/sections/PieceSectionItem.tsx";
import {
  type SectionFormState,
  UNASSIGNED_SCORE_SHEET_VALUE,
} from "@/pages/piece/sections/PieceSectionFormUtils.ts";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import { stompService } from "@/service/stompService.ts";
import { toast } from "sonner";

interface PieceSectionsCardProps {
  sections: SectionDto[];
  canEdit: boolean;
}

export default function PieceSectionsCard({
  sections,
  canEdit,
}: Readonly<PieceSectionsCardProps>) {
  const [isCreating, setIsCreating] = useState(false);
  const piece = usePieceStore((state) => state.piece);
  const editingSectionId = usePieceStore((state) => state.editingSectionId);
  const setEditingSectionId = usePieceStore(
    (state) => state.setEditingSectionId,
  );
  const clearEditingSectionId = usePieceStore(
    (state) => state.clearEditingSectionId,
  );
  const sectionForm = usePieceStore((state) => state.sectionForm);
  const setSectionForm = usePieceStore((state) => state.setSectionForm);

  const sortedSections = [...sections].sort(
    (left, right) => left.position - right.position,
  );
  const maxPosition = Math.max(
    -1,
    ...sections.map((section) => section.position),
  );

  const createDefaultForm = (): SectionFormState => ({
    position: maxPosition + 1,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    barCount: null,
    bpm: null,
    scoreSheetId: UNASSIGNED_SCORE_SHEET_VALUE,
  });

  const publishSectionAdd = (payload: PieceSectionAddRequestDto) => {
    stompService.publish(`/app/piece.${piece.id}/section/add`, payload);
  };

  const buildSectionPayloadFromForm = (
    form: SectionFormState,
    currentSection?: SectionDto,
  ): PieceSectionAddRequestDto | null => {
    if (
      !form.timeSignatureNumerator ||
      !form.timeSignatureDenominator ||
      !form.barCount ||
      !form.bpm
    ) {
      toast.error("Time signature, bars, and BPM are required.");
      return null;
    }

    return {
      position: form.position,
      timeSignatureNumerator: form.timeSignatureNumerator,
      timeSignatureDenominator: form.timeSignatureDenominator,
      barCount: form.barCount,
      bpm: form.bpm,
      scoreSheetId:
        form.scoreSheetId === UNASSIGNED_SCORE_SHEET_VALUE
          ? null
          : form.scoreSheetId,
      // Coordinates are intentionally not editable in this UI yet.
      posX1: currentSection?.posX1 ?? null,
      posY1: currentSection?.posY1 ?? null,
      posX2: currentSection?.posX2 ?? null,
      posY2: currentSection?.posY2 ?? null,
    };
  };

  const handleSaveNewSection = () => {
    if (!sectionForm) return;

    const sectionPayload = buildSectionPayloadFromForm(sectionForm);
    if (!sectionPayload) return;

    publishSectionAdd(sectionPayload);
    setSectionForm(null);
    setIsCreating(false);
  };

  const newSectionDraft: SectionDto | null = sectionForm
    ? {
        id: "__new__",
        position: sectionForm.position,
        timeSignatureNumerator: sectionForm.timeSignatureNumerator ?? 4,
        timeSignatureDenominator: sectionForm.timeSignatureDenominator ?? 4,
        barCount: sectionForm.barCount ?? 0,
        bpm: sectionForm.bpm ?? 120,
        scoreSheetId:
          sectionForm.scoreSheetId === UNASSIGNED_SCORE_SHEET_VALUE
            ? ""
            : sectionForm.scoreSheetId,
        posX1: 0,
        posY1: 0,
        posX2: 0,
        posY2: 0,
      }
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sections</CardTitle>
        {canEdit && (
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setIsCreating(true);
                clearEditingSectionId();
                setSectionForm(createDefaultForm());
              }}
              disabled={sectionForm !== null}
            >
              <PlusIcon />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No sections available.
          </div>
        )}

        {isCreating && sectionForm && newSectionDraft && (
          <PieceSectionItem
            section={newSectionDraft}
            canEdit={canEdit}
            isEditing
            isNewSection
            sectionForm={sectionForm}
            scoreSheets={piece.scoreSheets
              .slice()
              .sort((left, right) => left.position - right.position)}
            setSectionForm={setSectionForm}
            buildSectionPayloadFromForm={buildSectionPayloadFromForm}
            onSaveCreate={handleSaveNewSection}
            onCancelEdit={() => {
              setSectionForm(null);
              setIsCreating(false);
            }}
          />
        )}

        {sortedSections.map((section) => (
          <PieceSectionItem
            key={section.id}
            section={section}
            canEdit={canEdit}
            isEditing={editingSectionId === section.id}
            sectionForm={sectionForm}
            scoreSheets={piece.scoreSheets
              .slice()
              .sort((left, right) => left.position - right.position)}
            setSectionForm={setSectionForm}
            buildSectionPayloadFromForm={buildSectionPayloadFromForm}
            onStartEdit={(selectedSection) => {
              if (selectedSection.id) {
                setIsCreating(false);
                setEditingSectionId(selectedSection.id);
                setSectionForm({
                  position: selectedSection.position,
                  timeSignatureNumerator:
                    selectedSection.timeSignatureNumerator,
                  timeSignatureDenominator:
                    selectedSection.timeSignatureDenominator,
                  barCount: selectedSection.barCount,
                  bpm: selectedSection.bpm,
                  scoreSheetId:
                    selectedSection.scoreSheetId ??
                    UNASSIGNED_SCORE_SHEET_VALUE,
                });
              }
            }}
            onCancelEdit={() => {
              clearEditingSectionId();
              setSectionForm(null);
              setIsCreating(false);
            }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
