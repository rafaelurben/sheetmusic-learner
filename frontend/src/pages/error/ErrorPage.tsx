/*
 * (C) 2026. - Rafael Urben
 */
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shadcn/components/ui/empty.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { HomeIcon, TriangleAlertIcon } from "lucide-react";
import React from "react";

interface ErrorPageProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  actionIcon?: React.ReactNode;
  actionLabel?: string;
}

export default function ErrorPage({
  icon = <TriangleAlertIcon />,
  title,
  description,
  action,
  actionIcon = <HomeIcon />,
  actionLabel = "Go home",
}: Readonly<ErrorPageProps>) {
  return (
    <Empty className="bg-muted/30 h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={action}>
          {actionIcon}
          {actionLabel}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
