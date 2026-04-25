/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import java.util.UUID;

public record PiecePermissionUpdatedEvent(UUID userId, PermissionType permissionType) {

  public static final String TYPE_DISCRIMINATOR = "permission-updated";

  public EventDto<PiecePermissionUpdatedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
