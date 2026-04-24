/*
 * (C) 2026. - Rafael Urben
 */
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import type { SectionDto } from "@/api/generated/openapi";
import type PieceSectionAddRequestDto from "@/interfaces/async/request/piece/PieceSectionAddRequestDto.ts";
import type PieceSectionUpdateRequestDto from "@/interfaces/async/request/piece/PieceSectionUpdateRequestDto.ts";
import { PlusIcon, SquarePlusIcon } from "lucide-react";
import type { DragEvent } from "react";
import { useState } from "react";
import PieceSectionItem from "@/pages/piece/sections/PieceSectionItem.tsx";
import {
  buildSectionPayloadFromForm,
  type SectionFormState,
  UNASSIGNED_SCORE_SHEET_VALUE,
} from "@/pages/piece/sections/PieceSectionFormUtils.ts";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import { stompPublishingService } from "@/service/stompPublishingService.ts";

interface PieceSectionsCardProps {
  sections: SectionDto[];
  canEdit: boolean;
}

export default function PieceSectionsCard({
  sections,
  canEdit,
}: Readonly<PieceSectionsCardProps>) {
  const [isCreating, setIsCreating] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    sectionId: string;
  } | null>(null);
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
  const canReorder = canEdit && sectionForm === null;
  const maxPosition = Math.max(
    -1,
    ...sections.map((section) => section.position),
  );

  const createDefaultForm = (): SectionFormState => ({
    position: maxPosition + 1,
    name: "Section",
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    barCount: null,
    bpm: null,
    scoreSheetId: UNASSIGNED_SCORE_SHEET_VALUE,
    posX1: 0,
    posY1: 0,
    posX2: 1,
    posY2: 1,
  });

  const publishSectionAdd = (payload: PieceSectionAddRequestDto) => {
    stompPublishingService.pieceSectionAdd(piece.id, payload);
  };

  const publishSectionUpdate = (
    section: SectionDto,
    position: number,
  ): void => {
    const payload: PieceSectionUpdateRequestDto = {
      sectionId: section.id,
      ...section,
      position,
    };

    stompPublishingService.pieceSectionUpdate(piece.id, payload);
  };

  const clearDragState = () => {
    setDraggedSectionId(null);
    setDropTarget(null);
  };

  const handleDragStart = (section: SectionDto) => {
    if (!canReorder) return;

    setDraggedSectionId(section.id);
    setDropTarget(null);
  };

  const handleDragOver = (
    section: SectionDto,
    event: DragEvent<HTMLDivElement>,
  ) => {
    if (!canReorder || !draggedSectionId || draggedSectionId === section.id) {
      return;
    }

    event.preventDefault();
    setDropTarget({ sectionId: section.id });
  };

  const handleDrop = (
    section: SectionDto,
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    if (!canReorder || !draggedSectionId || draggedSectionId === section.id) {
      clearDragState();
      return;
    }

    const draggedIndex = sortedSections.findIndex(
      (currentSection) => currentSection.id === draggedSectionId,
    );
    const targetIndex = sortedSections.findIndex(
      (currentSection) => currentSection.id === section.id,
    );

    if (draggedIndex < 0 || targetIndex < 0) {
      clearDragState();
      return;
    }

    publishSectionUpdate(sortedSections[draggedIndex], targetIndex);
    clearDragState();
  };

  const handleSaveNewSection = () => {
    if (!sectionForm) return;

    const sectionPayload = buildSectionPayloadFromForm(sectionForm);
    if (!sectionPayload) return;

    publishSectionAdd(sectionPayload);
    setSectionForm(null);
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    clearEditingSectionId();
    setSectionForm(createDefaultForm());
  };

  const newSectionDraft: SectionDto | null = sectionForm
    ? {
        id: "__new__",
        position: sectionForm.position,
        name: sectionForm.name,
        timeSignatureNumerator: sectionForm.timeSignatureNumerator ?? 4,
        timeSignatureDenominator: sectionForm.timeSignatureDenominator ?? 4,
        barCount: sectionForm.barCount ?? 0,
        bpm: sectionForm.bpm ?? 120,
        scoreSheetId:
          sectionForm.scoreSheetId === UNASSIGNED_SCORE_SHEET_VALUE
            ? ""
            : sectionForm.scoreSheetId,
        posX1: sectionForm.posX1,
        posY1: sectionForm.posY1,
        posX2: sectionForm.posX2,
        posY2: sectionForm.posY2,
      }
    : null;

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle>Sections</CardTitle>
        {canEdit && (
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={startCreating}
              disabled={sectionForm !== null}
            >
              <PlusIcon />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5 px-3">
        {sections.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No sections available.
          </div>
        )}

        {sortedSections.map((section) => (
          <PieceSectionItem
            key={section.id}
            section={section}
            canEdit={canEdit}
            isEditing={editingSectionId === section.id}
            sectionForm={sectionForm}
            isDraggable={canReorder}
            isDragging={draggedSectionId === section.id}
            isDropTarget={dropTarget?.sectionId === section.id}
            onDragStart={() => {
              handleDragStart(section);
            }}
            onDragEnd={() => {
              globalThis.setTimeout(clearDragState, 0);
            }}
            onDragOver={(event) => {
              handleDragOver(section, event);
            }}
            onDrop={(event) => {
              handleDrop(section, event);
            }}
            scoreSheets={piece.scoreSheets
              .slice()
              .sort((left, right) => left.position - right.position)}
            setSectionForm={setSectionForm}
            onStartEdit={(selectedSection) => {
              if (selectedSection.id) {
                setIsCreating(false);
                setEditingSectionId(selectedSection.id);
                setSectionForm({
                  position: selectedSection.position,
                  name: selectedSection.name,
                  timeSignatureNumerator:
                    selectedSection.timeSignatureNumerator,
                  timeSignatureDenominator:
                    selectedSection.timeSignatureDenominator,
                  barCount: selectedSection.barCount,
                  bpm: selectedSection.bpm,
                  scoreSheetId:
                    selectedSection.scoreSheetId ??
                    UNASSIGNED_SCORE_SHEET_VALUE,
                  posX1: selectedSection.posX1,
                  posY1: selectedSection.posY1,
                  posX2: selectedSection.posX2,
                  posY2: selectedSection.posY2,
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
            onSaveCreate={handleSaveNewSection}
            onCancelEdit={() => {
              setSectionForm(null);
              setIsCreating(false);
            }}
          />
        )}
      </CardContent>
      {canEdit && (
        <CardFooter>
          <Button
            className="w-full gap-2 mt-3"
            disabled={sectionForm !== null}
            onClick={startCreating}
          >
            <SquarePlusIcon className="size-4" />
            Add section
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
