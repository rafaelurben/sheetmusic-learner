/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record GeneralRoomNowUnavailableEvent(UUID roomId) {

  public static final String TYPE_DISCRIMINATOR = "room-now-unavailable";

  public EventDto<GeneralRoomNowUnavailableEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
