/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record RoomDeletedEvent() {

  public EventDto<RoomDeletedEvent> asDto() {
    return new EventDto<>("room-deleted", this);
  }
}
