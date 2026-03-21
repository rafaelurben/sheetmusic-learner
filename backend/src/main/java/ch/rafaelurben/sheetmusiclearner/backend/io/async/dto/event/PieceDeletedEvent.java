/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record PieceDeletedEvent() {

  public EventDto<PieceDeletedEvent> asDto() {
    return new EventDto<>("piece-deleted", this);
  }
}
