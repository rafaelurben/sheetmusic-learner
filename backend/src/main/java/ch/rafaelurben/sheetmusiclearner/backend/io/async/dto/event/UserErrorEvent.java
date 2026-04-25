/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record UserErrorEvent(String error, String message) {

  public static final String TYPE_DISCRIMINATOR = "error";

  public EventDto<UserErrorEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
