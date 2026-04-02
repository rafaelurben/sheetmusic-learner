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

interface PiecePermissionsCardProps {
  permission: PiecePermissionDto;
  editable: boolean;
}

const getInitials = (firstName?: string, lastName?: string) => {
  return `${firstName?.[0] ?? "?"}${lastName?.[0] ?? "?"}`;
};

export default function PiecePermissionCard({
  permission,
  editable,
}: Readonly<PiecePermissionsCardProps>) {
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
        <Select defaultValue={permission.permissionType} disabled={!editable}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PermissionType.Owner}>Owner</SelectItem>
            <SelectItem value={PermissionType.Editor}>Editor</SelectItem>
            <SelectItem value={PermissionType.Reader}>Reader</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
