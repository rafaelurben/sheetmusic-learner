/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record UserErrorEvent(String error, String message) {

  public EventDto<UserErrorEvent> asDto() {
    return new EventDto<>("error", this);
  }
}
