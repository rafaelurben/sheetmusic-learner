/*
 * (C) 2026. - Rafael Urben
 */
import {
  PermissionType,
  type PiecePermissionDto,
  ResponseError,
  type UserDto,
} from "@/api/generated/openapi";
import { useUsersApi } from "@/api/useAuthenticatedApiClient.ts";
import PiecePermissionCard from "@/pages/piece/PiecePermissionCard.tsx";
import type PiecePermissionAddRequestDto from "@/interfaces/async/request/piece/PiecePermissionAddRequestDto.ts";
import type { PiecePermissionUpdateRequestDto } from "@/interfaces/async/request/piece/PiecePermissionUpdateRequestDto.ts";
import type { PiecePermissionRemoveRequestDto } from "@/interfaces/async/request/piece/PiecePermissionRemoveRequestDto.ts";
import { stompPublishingService } from "@/service/stompPublishingService.ts";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select.tsx";
import { useMainStore } from "@/zustand/mainStore.ts";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PiecePermissionsCardProps {
  permissions: PiecePermissionDto[];
  isPublic: boolean;
}

export default function PiecePermissions({
  permissions,
  isPublic,
}: Readonly<PiecePermissionsCardProps>) {
  const currentUserId = useMainStore((state) => state.currentUser?.id);
  const pieceId = usePieceStore((state) => state.piece.id);
  const usersApi = useUsersApi();

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<PermissionType | null>(null);
  const [searchResult, setSearchResult] = useState<UserDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const isOwner =
    permissions.find((e) => e.user.id === currentUserId)?.permissionType ===
    PermissionType.Owner;

  const searchedUserAlreadyAdded =
    searchResult != null &&
    permissions.some((permission) => permission.user.id === searchResult.id);

  const handleSearchByEmail = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.warning("Enter an email address first.");
      return;
    }

    setIsSearching(true);
    try {
      const user = await usersApi.getUserByEmail({ email: trimmedEmail });
      setSearchResult(user);
      if (permissions.some((permission) => permission.user.id === user.id)) {
        toast.info("User found but already has access.");
      } else {
        toast.success("User found.");
      }
    } catch (error: unknown) {
      setSearchResult(null);
      if (error instanceof ResponseError && error.response.status === 404) {
        toast.error("No user found with that email address.");
      } else {
        console.error("Failed to search user by email:", error);
        toast.error("Failed to search user.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPermission = () => {
    if (!searchResult || !selectedRole) {
      return;
    }

    const request: PiecePermissionAddRequestDto = {
      userId: searchResult.id,
      permissionType: selectedRole,
    };

    try {
      stompPublishingService.piecePermissionAdd(pieceId, request);
      toast.success("Permission add request sent.");
      setEmail("");
      setSearchResult(null);
      setSelectedRole(null);
    } catch (error) {
      console.error("Failed to publish add permission request:", error);
      toast.error("Failed to send add permission request.");
    }
  };

  const handlePermissionTypeChange = (
    userId: string,
    permissionType: PermissionType,
  ) => {
    const request: PiecePermissionUpdateRequestDto = {
      userId,
      permissionType,
    };

    try {
      stompPublishingService.piecePermissionUpdate(pieceId, request);
      toast.success("Permission update request sent.");
    } catch (error) {
      console.error("Failed to publish update permission request:", error);
      toast.error("Failed to send permission update request.");
    }
  };

  const handleRemovePermission = (userId: string) => {
    const request: PiecePermissionRemoveRequestDto = { userId };

    try {
      stompPublishingService.piecePermissionRemove(pieceId, request);
      toast.success("Permission remove request sent.");
    } catch (error) {
      console.error("Failed to publish remove permission request:", error);
      toast.error("Failed to send permission remove request.");
    }
  };

  return (
    <div className="space-y-2 px-4">
      {isPublic && (
        <div className="text-sm text-muted-foreground">
          This piece is public and can be read by anyone.
        </div>
      )}
      {isOwner && (
        <div className="space-y-3 rounded-md border p-3">
          <div className="text-sm font-medium">Add member</div>
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              placeholder="name@example.com"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSearchByEmail();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isSearching}
              onClick={() => {
                void handleSearchByEmail();
              }}
            >
              <SearchIcon className="mr-2 size-4" />
              Search
            </Button>
          </div>

          {searchResult && (
            <div className="space-y-2 rounded-md bg-muted p-3">
              <div className="text-sm">
                {searchResult.firstName} {searchResult.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {searchResult.email}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedRole ?? undefined}
                  onValueChange={(value) => {
                    setSelectedRole(value as PermissionType);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PermissionType.Owner}>Owner</SelectItem>
                    <SelectItem value={PermissionType.Editor}>
                      Editor
                    </SelectItem>
                    <SelectItem value={PermissionType.Reader}>
                      Reader
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  disabled={selectedRole == null || searchedUserAlreadyAdded}
                  onClick={handleAddPermission}
                >
                  Confirm
                </Button>
              </div>
              {searchedUserAlreadyAdded && (
                <div className="text-xs text-muted-foreground">
                  This user already has a role on this piece.
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {permissions.map((permission) => (
        <PiecePermissionCard
          key={permission.user.id}
          permission={permission}
          editable={isOwner && permission.user.id !== currentUserId}
          onPermissionTypeChange={handlePermissionTypeChange}
          onRemove={handleRemovePermission}
        />
      ))}
    </div>
  );
}
