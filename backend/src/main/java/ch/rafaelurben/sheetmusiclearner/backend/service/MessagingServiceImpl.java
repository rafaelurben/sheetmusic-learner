/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.EventDto;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destination;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessagingServiceImpl implements MessagingService {
  private final SimpMessagingTemplate template;

  @Override
  public <T> void send(Destination destination, EventDto<T> eventDto) {
    template.convertAndSend(destination.destination(), eventDto);
  }

  @Override
  public <T> void sendToUser(UUID userId, EventDto<T> eventDto) {
    template.convertAndSendToUser(
        userId.toString(), Destinations.USER_QUEUE_NOTIFICATIONS, eventDto);
  }

  @Override
  public <T> void sendToUsers(Iterable<UUID> userIds, EventDto<T> eventDto) {
    userIds.forEach(userId -> sendToUser(userId, eventDto));
  }
}
