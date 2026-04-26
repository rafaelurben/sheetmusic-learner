/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import ch.rafaelurben.sheetmusiclearner.backend.service.MessagingService;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destination;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestConfig.class)
@ExtendWith(MockitoExtension.class)
public abstract class BaseSpringBootTest {
  @MockitoBean private MessagingService messagingService;

  protected <T> T assertSingleMessage(final Destination destination, final Class<T> payloadType) {
    return MessagingAssertions.assertSingleSend(messagingService, destination, payloadType);
  }
}
