/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;

public record PiecePermissionAddedEvent(UserDto user, PermissionType permissionType) {

  public static final String TYPE_DISCRIMINATOR = "permission-added";

  public EventDto<PiecePermissionAddedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
