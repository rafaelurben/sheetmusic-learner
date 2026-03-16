/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import java.util.UUID;

public record PiecePermissionAddRequestDto(UUID userId, PermissionType permissionType) {}
