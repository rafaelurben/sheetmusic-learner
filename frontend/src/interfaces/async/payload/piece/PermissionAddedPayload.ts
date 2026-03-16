/*
 * (C) 2026. - Rafael Urben
 */
import type { PermissionType } from "@/api/generated/openapi/models/PermissionType.ts";
import type { UserDto } from "@/api/generated/openapi/models/UserDto.ts";

export default interface PermissionAddedPayload {
  user: UserDto;
  permissionType: PermissionType;
}
