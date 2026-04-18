/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.EventDto;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destination;
import java.util.UUID;

public interface MessagingService {
  <T> void send(Destination destination, EventDto<T> eventDto);

  <T> void sendToUser(UUID userId, EventDto<T> eventDto);

  <T> void sendToUsers(Iterable<UUID> userIds, EventDto<T> eventDto);
}
