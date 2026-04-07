/*
 * (C) 2026. - Rafael Urben
 */
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import {
  PermissionType,
  type PiecePermissionDto,
} from "@/api/generated/openapi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select.tsx";
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Trash2Icon } from "lucide-react";

interface PiecePermissionCardProps {
  permission: PiecePermissionDto;
  editable: boolean;
  onPermissionTypeChange?: (
    userId: string,
    permissionType: PermissionType,
  ) => void;
  onRemove?: (userId: string) => void;
}

const getInitials = (firstName?: string, lastName?: string) => {
  return `${firstName?.[0] ?? "?"}${lastName?.[0] ?? "?"}`;
};

export default function PiecePermissionCard({
  permission,
  editable,
  onPermissionTypeChange,
  onRemove,
}: Readonly<PiecePermissionCardProps>) {
  return (
    <Card key={permission.user.id} className="border-2">
      <CardContent className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarImage src={permission.user.avatarUrl} />
          <AvatarFallback>
            {getInitials(permission.user.firstName, permission.user.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <div className="font-medium">
            {permission.user.firstName} {permission.user.lastName}
          </div>
          <div className="text-muted-foreground">{permission.user.email}</div>
        </div>
        <Select
          value={permission.permissionType}
          disabled={!editable}
          onValueChange={(value) => {
            onPermissionTypeChange?.(
              permission.user.id,
              value as PermissionType,
            );
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PermissionType.Owner}>Owner</SelectItem>
            <SelectItem value={PermissionType.Editor}>Editor</SelectItem>
            <SelectItem value={PermissionType.Reader}>Reader</SelectItem>
          </SelectContent>
        </Select>
        {editable && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => {
              onRemove?.(permission.user.id);
            }}
          >
            <Trash2Icon className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
