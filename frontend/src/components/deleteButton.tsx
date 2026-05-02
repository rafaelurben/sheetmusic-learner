/*
 * (C) 2026. - Rafael Urben
 */

import { Trash2Icon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shadcn/components/ui/popover.tsx";

interface Props {
  title: string;
  description?: string;
  action: () => void;
  disabled?: boolean;
  variant?: "outline" | "destructive" | "ghost";
  size?: "small" | "normal";
}

export default function DeleteButton({
  title,
  description = "This action cannot be undone.",
  action,
  disabled = false,
  variant = "outline",
  size = "small",
}: Readonly<Props>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size == "small" ? "icon-sm" : "icon"}
          disabled={disabled}
          className={
            variant == "outline" || variant == "ghost"
              ? "text-destructive"
              : undefined
          }
        >
          <Trash2Icon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>{description}.</PopoverDescription>
        </PopoverHeader>

        <Button
          variant="destructive"
          onClick={action}
          size="sm"
          className="mt-2"
        >
          <Trash2Icon />
          <span>Delete</span>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
