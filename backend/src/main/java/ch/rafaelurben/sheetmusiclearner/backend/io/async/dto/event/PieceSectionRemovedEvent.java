/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record PieceSectionRemovedEvent(UUID sectionId) {

  public static final String TYPE_DISCRIMINATOR = "section-removed";

  public EventDto<PieceSectionRemovedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
