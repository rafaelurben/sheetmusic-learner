import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shadcn/components/ui/empty.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { CloudAlertIcon, RefreshCcwIcon } from "lucide-react";

interface ErrorPageProps {
  title: string;
  description: string;
  refreshAction?: () => void;
}

export default function ErrorPage({
  title,
  description,
  refreshAction = () => {
    globalThis.location.reload();
  },
}: Readonly<ErrorPageProps>) {
  return (
    <Empty className="bg-muted/30 h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={refreshAction}>
          <RefreshCcwIcon />
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  );
}
