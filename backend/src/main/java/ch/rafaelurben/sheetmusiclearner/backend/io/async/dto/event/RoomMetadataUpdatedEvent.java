/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;

public record RoomMetadataUpdatedEvent(RoomDto room) {

  public EventDto<RoomMetadataUpdatedEvent> asDto() {
    return new EventDto<>("metadata-updated", this);
  }
}
