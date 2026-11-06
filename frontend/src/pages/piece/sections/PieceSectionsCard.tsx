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
import { Switch } from "@/shadcn/components/ui/switch.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import type { SectionDto } from "@/api/generated/openapi";
import type PieceSectionAddRequestDto from "@/interfaces/async/request/piece/PieceSectionAddRequestDto.ts";
import type PieceSectionUpdateRequestDto from "@/interfaces/async/request/piece/PieceSectionUpdateRequestDto.ts";
import { SquarePlusIcon } from "lucide-react";
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
import { ScrollArea } from "@/shadcn/components/ui/scroll-area.tsx";

interface PieceSectionsCardProps {
  sections: SectionDto[];
  canEdit: boolean;
}

export default function PieceSectionsCard({
  sections,
  canEdit,
}: Readonly<PieceSectionsCardProps>) {
  const [isEditMode, setIsEditMode] = useState(false);
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
  const sectionForm = usePieceStore((state) => state.sectionForm);
  const setSectionForm = usePieceStore((state) => state.setSectionForm);

  const sortedSections = [...sections].sort(
    (left, right) => left.position - right.position,
  );
  const canReorder = canEdit && isEditMode && sectionForm === null;
  const showAddButton = canEdit && (isEditMode || sections.length === 0);
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
    repeatCount: 1,
    scoreSheetId: UNASSIGNED_SCORE_SHEET_VALUE,
    posX1: 0,
    posY1: 0,
    posX2: 1,
    posY2: 1,
  });

  const publishSectionAdd = (payload: PieceSectionAddRequestDto) => {
    stompPublishingService.pieceSectionAdd(piece.id, payload);
  };

  const handleDuplicateSection = (section: SectionDto) => {
    setEditingSectionId(null);
    setSectionForm(null);
    setIsCreating(false);

    publishSectionAdd({
      position: section.position + 1,
      name: `${section.name} copy`,
      timeSignatureNumerator: section.timeSignatureNumerator,
      timeSignatureDenominator: section.timeSignatureDenominator,
      barCount: section.barCount,
      bpm: section.bpm,
      repeatCount: section.repeatCount,
      scoreSheetId: section.scoreSheetId ?? null,
      posX1: section.posX1,
      posY1: section.posY1,
      posX2: section.posX2,
      posY2: section.posY2,
    });
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
    setEditingSectionId(null);
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
        repeatCount: sectionForm.repeatCount ?? 1,
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
        {canEdit && sections.length > 0 && (
          <CardAction>
            <div className="flex items-center gap-2">
              <Label
                className="text-sm text-muted-foreground"
                htmlFor="piece-sections-edit-mode"
              >
                Edit
              </Label>
              <Switch
                id="piece-sections-edit-mode"
                checked={isEditMode}
                onCheckedChange={(nextEditMode) => {
                  setIsEditMode(nextEditMode);
                  if (!nextEditMode) {
                    setEditingSectionId(null);
                    setSectionForm(null);
                    setIsCreating(false);
                  }
                }}
              />
            </div>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-3">
        <ScrollArea
          className={
            showAddButton
              ? "h-fit lg:h-[calc(100vh-18.5rem)]"
              : "h-fit lg:h-[calc(100vh-15rem)]"
          }
        >
          <div className="flex flex-col gap-1.5">
            {sections.length === 0 && (
              <div className="flex h-full min-h-60 flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed text-sm text-muted-foreground">
                <span>No sections available.</span>
                {showAddButton && (
                  <Button
                    className="gap-2"
                    onClick={startCreating}
                    disabled={sectionForm !== null}
                  >
                    <SquarePlusIcon className="size-4" />
                    Add section
                  </Button>
                )}
              </div>
            )}

            {sortedSections.map((section) => (
              <PieceSectionItem
                key={section.id}
                section={section}
                canEdit={canEdit}
                isEditMode={isEditMode}
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
                onStartEdit={() => {
                  setIsCreating(false);
                  setEditingSectionId(section.id);
                  setSectionForm({
                    position: section.position,
                    name: section.name,
                    timeSignatureNumerator: section.timeSignatureNumerator,
                    timeSignatureDenominator: section.timeSignatureDenominator,
                    barCount: section.barCount,
                    bpm: section.bpm,
                    repeatCount: section.repeatCount,
                    scoreSheetId:
                      section.scoreSheetId ?? UNASSIGNED_SCORE_SHEET_VALUE,
                    posX1: section.posX1,
                    posY1: section.posY1,
                    posX2: section.posX2,
                    posY2: section.posY2,
                  });
                }}
                onCancelEdit={() => {
                  setEditingSectionId(null);
                  setSectionForm(null);
                  setIsCreating(false);
                }}
                onDuplicate={() => {
                  handleDuplicateSection(section);
                }}
              />
            ))}

            {isCreating && sectionForm && newSectionDraft && (
              <PieceSectionItem
                section={newSectionDraft}
                canEdit={canEdit}
                isEditMode={isEditMode}
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
          </div>
        </ScrollArea>
      </CardContent>
      {showAddButton && (
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
