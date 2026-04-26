/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;

public record GeneralPieceMetadataUpdatedEvent(PieceMetadataDto piece) {

  public static final String TYPE_DISCRIMINATOR = "piece-metadata-updated";

  public EventDto<GeneralPieceMetadataUpdatedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
