/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomMetadataDto;

public record GeneralRoomMetadataUpdatedEvent(RoomMetadataDto room) {

  public EventDto<GeneralRoomMetadataUpdatedEvent> asDto() {
    return new EventDto<>("room-metadata-updated", this);
  }
}
