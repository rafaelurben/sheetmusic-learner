/*
 * (C) 2026. - Rafael Urben
 */
import {
  PermissionType,
  type PiecePermissionDto,
} from "@/api/generated/openapi";
import PiecePermissionCard from "@/pages/piece/PiecePermissionCard.tsx";
import { useMainStore } from "@/zustand/mainStore.ts";

interface PiecePermissionsCardProps {
  permissions: PiecePermissionDto[];
  isPublic: boolean;
}

export default function PiecePermissions({
  permissions,
  isPublic,
}: Readonly<PiecePermissionsCardProps>) {
  const currentUserId = useMainStore((state) => state.currentUser?.id);
  const isOwner =
    permissions.find((e) => e.user.id === currentUserId)?.permissionType ===
    PermissionType.Owner;

  return (
    <div className="space-y-2 px-4">
      {isPublic && (
        <div className="text-sm text-muted-foreground">
          This piece is public and can be read by anyone.
        </div>
      )}
      {permissions.map((permission) => (
        <PiecePermissionCard
          key={permission.user.id}
          permission={permission}
          editable={isOwner && permission.user.id !== currentUserId}
        />
      ))}
    </div>
  );
}
