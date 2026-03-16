/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record PiecePermissionRemovedEvent(UUID userId) {

  public EventDto<PiecePermissionRemovedEvent> asDto() {
    return new EventDto<>("permission-removed", this);
  }
}
