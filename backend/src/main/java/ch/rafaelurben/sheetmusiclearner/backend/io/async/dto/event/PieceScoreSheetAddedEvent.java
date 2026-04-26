/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;

public record PieceScoreSheetAddedEvent(ScoreSheetDto scoreSheet) {

  public static final String TYPE_DISCRIMINATOR = "score-sheet-added";

  public EventDto<PieceScoreSheetAddedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
