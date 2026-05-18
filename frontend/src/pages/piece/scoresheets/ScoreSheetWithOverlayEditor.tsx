/*
 * (C) 2026. - Rafael Urben
 */

import type { ScoreSheetDto } from "@/api/generated/openapi";
import { useEffect, useRef, useState } from "react";
import type SectionCoordinates from "@/interfaces/SectionCoordinates.ts";

type DragCorner = "top-left" | "bottom-right";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

interface ScoreSheetWithOverlayEditorProps {
  scoreSheet: ScoreSheetDto;
  sectionOverlayCoordinates: SectionCoordinates | null;
  onSectionOverlayCoordinatesChange: (nextOverlay: SectionCoordinates) => void;
}

export default function ScoreSheetWithOverlayEditor({
  scoreSheet,
  sectionOverlayCoordinates,
  onSectionOverlayCoordinatesChange,
}: Readonly<ScoreSheetWithOverlayEditorProps>) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [draggingCorner, setDraggingCorner] = useState<DragCorner | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (imageRef.current) {
      setAspectRatio(
        imageRef.current.naturalWidth / imageRef.current.naturalHeight,
      );
    }
  }, []);

  useEffect(() => {
    if (!draggingCorner || !sectionOverlayCoordinates) return;

    const handlePointerMove = (event: PointerEvent) => {
      const img = imageRef.current;
      if (!img) return;

      const rect = img.getBoundingClientRect();
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
    <div
      style={{
        aspectRatio: aspectRatio,
      }}
      className={
        sectionOverlayCoordinates
          ? "relative inline-block touch-none"
          : "relative inline-block"
      }
    >
      <img
        ref={imageRef}
        src={scoreSheet.imageUrl}
        alt={scoreSheet.title}
        className="max-h-full max-w-full rounded-md border bg-muted"
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
  );
}
