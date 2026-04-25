/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.EventDto;
import ch.rafaelurben.sheetmusiclearner.backend.service.MessagingService;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destination;
import org.mockito.ArgumentCaptor;

final class MessagingAssertions {

  private MessagingAssertions() {}

  private static String getTypeDiscriminator(Class<?> eventType) {
    try {
      return (String) eventType.getField("TYPE_DISCRIMINATOR").get(null);
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(
          "Failed to get TYPE_DISCRIMINATOR from event type: " + eventType.getName(), e);
    }
  }

  public static <T> T assertSingleSend(
      MessagingService messagingService, Destination expectedDestination, Class<T> expectedType) {
    ArgumentCaptor<Destination> destinationCaptor = ArgumentCaptor.forClass(Destination.class);
    ArgumentCaptor<EventDto<?>> eventCaptor = ArgumentCaptor.forClass(EventDto.class);

    verify(messagingService).send(destinationCaptor.capture(), eventCaptor.capture());
    verifyNoMoreInteractions(messagingService);

    Destination capturedDestination = destinationCaptor.getValue();
    EventDto<?> capturedEvent = eventCaptor.getValue();

    assertEquals(expectedDestination.destination(), capturedDestination.destination());
    assertEquals(getTypeDiscriminator(expectedType), capturedEvent.type());

    return assertInstanceOf(expectedType, capturedEvent.payload());
  }
}
