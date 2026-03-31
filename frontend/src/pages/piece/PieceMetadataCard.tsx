/*
 * (C) 2026. - Rafael Urben
 */
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import type { PieceDto } from "@/api/generated/openapi";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { PencilIcon } from "lucide-react";

interface PieceMetadataCardProps {
  piece: PieceDto;
  canEdit: boolean;
  openEditDialog: () => void;
}

export default function PieceMetadataCard({
  piece,
  canEdit,
  openEditDialog,
}: Readonly<PieceMetadataCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        {canEdit && (
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                openEditDialog();
              }}
            >
              <PencilIcon />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
        <div>
          <span className="text-muted-foreground">Title:</span> {piece.title}
        </div>
        <div>
          <span className="text-muted-foreground">Composer:</span>{" "}
          {piece.composer}
        </div>
        <div>
          <span className="text-muted-foreground">Year:</span> {piece.year}
        </div>
        <div>
          <span className="text-muted-foreground">Description:</span>{" "}
          {piece.description}
        </div>
        <div>
          <span className="text-muted-foreground">Difficulty:</span>{" "}
          {piece.difficulty}
        </div>
        <div>
          <span className="text-muted-foreground">BPM Range:</span>{" "}
          {piece.bpmRange}
        </div>
      </CardContent>
    </Card>
  );
}
