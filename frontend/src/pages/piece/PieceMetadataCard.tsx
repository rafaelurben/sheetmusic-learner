/*
 * (C) 2026. - Rafael Urben
 */
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import type { PieceDto } from "@/api/generated/openapi";
import { Button } from "@/shadcn/components/ui/button.tsx";
import {
  CalendarDaysIcon,
  GaugeIcon,
  MetronomeIcon,
  PencilIcon,
} from "lucide-react";

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
        <CardTitle>
          {piece.title} · {piece.composer}
        </CardTitle>
        <CardDescription>{piece.description}</CardDescription>
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
      <CardContent className="flex flex-wrap gap-4 text-sm">
        <div className="flex gap-1.5 items-center">
          <CalendarDaysIcon size="1rem" className="text-muted-foreground" />
          {piece.year}
        </div>
        <div className="flex gap-1.5 items-center">
          <GaugeIcon size="1rem" className="text-muted-foreground" />
          {piece.difficulty}
        </div>
        <div className="flex gap-1.5 items-center">
          <MetronomeIcon size="1rem" className="text-muted-foreground" />
          {piece.bpmRange}
        </div>
      </CardContent>
    </Card>
  );
}
