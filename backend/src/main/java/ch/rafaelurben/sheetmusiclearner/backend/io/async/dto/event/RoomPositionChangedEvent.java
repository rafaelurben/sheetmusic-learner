/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RoomPositionChangedEvent(
    @JsonProperty("current_section_position") Integer currentSectionPosition) {

  public EventDto<RoomPositionChangedEvent> asDto() {
    return new EventDto<>("position-changed", this);
  }
}
