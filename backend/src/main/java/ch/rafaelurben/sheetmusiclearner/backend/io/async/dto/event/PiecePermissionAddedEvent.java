/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;

public record PiecePermissionAddedEvent(UserDto user, PermissionType permissionType) {

  public EventDto<PiecePermissionAddedEvent> asDto() {
    return new EventDto<>("permission-added", this);
  }
}
