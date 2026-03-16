/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record GeneralRoomNowUnavailableEvent(UUID roomId) {

  public EventDto<GeneralRoomNowUnavailableEvent> asDto() {
    return new EventDto<>("room-now-unavailable", this);
  }
}
