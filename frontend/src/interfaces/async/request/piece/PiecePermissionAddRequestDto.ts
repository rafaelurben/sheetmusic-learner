/*
 * (C) 2026. - Rafael Urben
 */

import type { PermissionType } from "@/api/generated/openapi/models/PermissionType.ts";

export default interface PiecePermissionAddRequestDto {
  userId: string;
  permissionType: PermissionType;
}
