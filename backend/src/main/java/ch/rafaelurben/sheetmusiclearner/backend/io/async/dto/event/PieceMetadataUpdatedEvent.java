/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.PieceMetadataDto;

public record PieceMetadataUpdatedEvent(PieceMetadataDto piece) {

  public EventDto<PieceMetadataUpdatedEvent> asDto() {
    return new EventDto<>("metadata-updated", this);
  }
}
