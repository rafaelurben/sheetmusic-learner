/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record PiecePermissionRemovedEvent(UUID userId) {

  public static final String TYPE_DISCRIMINATOR = "permission-removed";

  public EventDto<PiecePermissionRemovedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
