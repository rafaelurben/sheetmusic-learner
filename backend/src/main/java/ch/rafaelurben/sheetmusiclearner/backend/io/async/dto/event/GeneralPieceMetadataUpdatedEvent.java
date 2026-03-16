/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.PieceMetadataDto;

public record GeneralPieceMetadataUpdatedEvent(PieceMetadataDto piece) {

  public EventDto<GeneralPieceMetadataUpdatedEvent> asDto() {
    return new EventDto<>("piece-metadata-updated", this);
  }
}
