/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.EventDto;
import ch.rafaelurben.sheetmusiclearner.backend.service.MessagingService;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destination;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.mockito.ArgumentMatcher;

@RequiredArgsConstructor
public final class MessageAsserter {

  private final MessagingService messagingService;

  private static String getTypeDiscriminator(Class<?> eventType) {
    try {
      Field f = eventType.getField("TYPE_DISCRIMINATOR");
      return (String) f.get(null);
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(
          "Failed to get TYPE_DISCRIMINATOR from event type: " + eventType.getName(), e);
    }
  }

  private static ArgumentMatcher<Collection<UUID>> matchUserIds(
      final Collection<UUID> expectedUserIds) {
    return actualUserIds ->
        actualUserIds != null
            && actualUserIds.size() == expectedUserIds.size()
            && expectedUserIds.containsAll(actualUserIds);
  }

  private static <T> ArgumentMatcher<EventDto<T>> matchEventEntry(
      final Class<T> expectedType, final Consumer<T> assertions) {
    return eventDto -> {
      if (getTypeDiscriminator(expectedType).equals(eventDto.type())) {
        T payload = assertInstanceOf(expectedType, eventDto.payload());
        if (assertions != null) {
          assertions.accept(payload);
        }
        return true;
      } else {
        return false;
      }
    };
  }

  public <T> void assertSend(
      final Destination expectedDestination,
      final Class<T> expectedType,
      final Consumer<T> assertions) {
    verify(messagingService)
        .send(
            argThat(expectedDestination::equals),
            argThat(matchEventEntry(expectedType, assertions)));
  }

  public <T> void assertSendToUser(
      final UUID expectedUserId, final Class<T> expectedType, final Consumer<T> assertions) {
    verify(messagingService)
        .sendToUser(eq(expectedUserId), argThat(matchEventEntry(expectedType, assertions)));
  }

  public <T> void assertSendToUsers(
      final Set<UUID> expectedUserIds, final Class<T> expectedType, final Consumer<T> assertions) {
    verify(messagingService)
        .sendToUsers(
            argThat(matchUserIds(expectedUserIds)),
            argThat(matchEventEntry(expectedType, assertions)));
  }

  /** Assert that no more messages have been sent */
  public void assertNoMore() {
    verifyNoMoreInteractions(messagingService);
  }
}
