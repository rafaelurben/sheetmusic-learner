/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomMetadataDto;

public record RoomMetadataUpdatedEvent(RoomMetadataDto room) {

  public EventDto<RoomMetadataUpdatedEvent> asDto() {
    return new EventDto<>("metadata-updated", this);
  }
}
