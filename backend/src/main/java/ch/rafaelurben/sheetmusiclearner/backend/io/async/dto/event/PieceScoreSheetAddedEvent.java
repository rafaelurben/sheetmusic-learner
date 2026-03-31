/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;

public record PieceScoreSheetAddedEvent(ScoreSheetDto scoreSheet) {

  public EventDto<PieceScoreSheetAddedEvent> asDto() {
    return new EventDto<>("score-sheet-added", this);
  }
}
