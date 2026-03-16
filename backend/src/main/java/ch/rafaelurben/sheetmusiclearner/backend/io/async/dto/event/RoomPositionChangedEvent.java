/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record RoomPositionChangedEvent(Integer currentSectionPosition) {

  public EventDto<RoomPositionChangedEvent> asDto() {
    return new EventDto<>("position-changed", this);
  }
}
