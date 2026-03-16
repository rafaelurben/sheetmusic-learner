/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.SectionDto;

public record PieceSectionAddedEvent(SectionDto section) {

  public EventDto<PieceSectionAddedEvent> asDto() {
    return new EventDto<>("section-added", this);
  }
}
