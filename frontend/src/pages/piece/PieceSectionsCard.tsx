/*
 * (C) 2026. - Rafael Urben
 */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import type { SectionDto } from "@/api/generated/openapi";

interface PieceSectionsCardProps {
  sections: SectionDto[];
}

export default function PieceSectionsCard({
  sections,
}: Readonly<PieceSectionsCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No sections available.
          </div>
        )}
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <div className="text-sm font-medium">Section {index + 1}</div>
            <div className="text-xs text-muted-foreground">
              Score Sheet: {section.scoreSheetId}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
