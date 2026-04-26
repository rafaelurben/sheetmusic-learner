/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record PieceDeletedEvent() {

  public static final String TYPE_DISCRIMINATOR = "piece-deleted";

  public EventDto<PieceDeletedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
