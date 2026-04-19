/*
 * (C) 2026. - Rafael Urben
 */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { ScoreSheetDto } from "@/api/generated/openapi";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type DragCorner = "top-left" | "bottom-right";

interface SectionCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PieceScoreSheetItemProps {
  scoreSheet: ScoreSheetDto;
  canEditActions: boolean;
  sectionOverlayCoordinates: SectionCoordinates | null;
  onSectionOverlayCoordinatesChange: (nextOverlay: SectionCoordinates) => void;
  onRename: (scoreSheetId: string, currentTitle: string) => void;
  onDelete: (scoreSheetId: string) => void;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export default function PieceScoreSheetItem({
  scoreSheet,
  canEditActions,
  sectionOverlayCoordinates,
  onSectionOverlayCoordinatesChange,
  onRename,
  onDelete,
}: Readonly<PieceScoreSheetItemProps>) {
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const [draggingCorner, setDraggingCorner] = useState<DragCorner | null>(null);

  useEffect(() => {
    if (!draggingCorner || !sectionOverlayCoordinates) return;

    const handlePointerMove = (event: PointerEvent) => {
      const wrapper = imageWrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const relativePosition = {
        x: clamp01((event.clientX - rect.left) / rect.width),
        y: clamp01((event.clientY - rect.top) / rect.height),
      };

      onSectionOverlayCoordinatesChange({
        ...sectionOverlayCoordinates,
        ...(draggingCorner === "top-left"
          ? {
              x1: Math.min(relativePosition.x, sectionOverlayCoordinates.x2),
              y1: Math.min(relativePosition.y, sectionOverlayCoordinates.y2),
            }
          : {
              x2: Math.max(relativePosition.x, sectionOverlayCoordinates.x1),
              y2: Math.max(relativePosition.y, sectionOverlayCoordinates.y1),
            }),
      });
    };

    const handlePointerUp = () => {
      setDraggingCorner(null);
    };

    globalThis.addEventListener("pointermove", handlePointerMove);
    globalThis.addEventListener("pointerup", handlePointerUp);

    return () => {
      globalThis.removeEventListener("pointermove", handlePointerMove);
      globalThis.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    draggingCorner,
    onSectionOverlayCoordinatesChange,
    sectionOverlayCoordinates,
  ]);

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex justify-center">
        <div ref={imageWrapperRef} className="relative inline-block">
          <img
            src={scoreSheet.imageUrl}
            alt={scoreSheet.title}
            className="max-h-72 max-w-full rounded-md border bg-muted"
          />

          {sectionOverlayCoordinates && (
            <>
              <div
                className="pointer-events-none absolute border-2 border-section-highlight bg-section-highlight/30"
                style={{
                  left: `${sectionOverlayCoordinates.x1 * 100}%`,
                  top: `${sectionOverlayCoordinates.y1 * 100}%`,
                  width: `${(sectionOverlayCoordinates.x2 - sectionOverlayCoordinates.x1) * 100}%`,
                  height: `${(sectionOverlayCoordinates.y2 - sectionOverlayCoordinates.y1) * 100}%`,
                }}
              />
              <button
                type="button"
                className="absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-full border border-section-highlight bg-section-highlight shadow"
                style={{
                  left: `${sectionOverlayCoordinates.x1 * 100}%`,
                  top: `${sectionOverlayCoordinates.y1 * 100}%`,
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setDraggingCorner("top-left");
                }}
                aria-label="Move top-left corner"
              />
              <button
                type="button"
                className="absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 cursor-se-resize rounded-full border border-section-highlight bg-section-highlight shadow"
                style={{
                  left: `${sectionOverlayCoordinates.x2 * 100}%`,
                  top: `${sectionOverlayCoordinates.y2 * 100}%`,
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setDraggingCorner("bottom-right");
                }}
                aria-label="Move bottom-right corner"
              />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{scoreSheet.title}</div>
        {canEditActions && (
          <div className="flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive"
              onClick={() => {
                onDelete(scoreSheet.id);
              }}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
