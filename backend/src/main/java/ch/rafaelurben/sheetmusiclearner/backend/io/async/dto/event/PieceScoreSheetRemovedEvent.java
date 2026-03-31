/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record PieceScoreSheetRemovedEvent(UUID scoreSheetId) {

  public EventDto<PieceScoreSheetRemovedEvent> asDto() {
    return new EventDto<>("score-sheet-removed", this);
  }
}
