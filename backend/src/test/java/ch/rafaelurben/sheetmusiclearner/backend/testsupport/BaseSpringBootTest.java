/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.service.MessagingService;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
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

  @Getter private static User defaultUser;

  @Getter(AccessLevel.PROTECTED)
  private MessageAsserter messageAsserter;

  @BeforeAll
  static void beforeAll() {
    defaultUser = TestUsers.createUser(UUID.fromString("00000000-0000-0000-0000-000000000000"));
    defaultUser.setFirstName("admin");
    defaultUser.setLastName("admin");
  }

  @BeforeEach
  void beforeEach() {
    TestUsers.setCurrentUser(defaultUser);
    messageAsserter = new MessageAsserter(messagingService);
  }

  @AfterEach
  void afterEach() {
    if (messageAsserter != null) {
      messageAsserter.assertNoMore();
    }
  }
}
