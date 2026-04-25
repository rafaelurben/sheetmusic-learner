/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import static org.junit.jupiter.api.Assertions.assertEquals;

import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.service.UserService;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TestUsersTest extends BaseSpringBootTest {

  @Autowired private UserService userService;

  @AfterEach
  void cleanup() {
    TestUsers.clearCurrentUser();
  }

  @Test
  void runAsAllowsSwitchingBetweenDifferentUsers() {
    User firstUser = TestUsers.createUser(UUID.randomUUID());
    User secondUser = TestUsers.createUser(UUID.randomUUID());

    User resolvedFirstUser =
        TestUsers.runAs(firstUser, () -> userService.getCurrentUserEntity(true));
    User resolvedSecondUser =
        TestUsers.runAs(secondUser, () -> userService.getCurrentUserEntity(true));

    assertEquals(firstUser.getId(), resolvedFirstUser.getId());
    assertEquals(secondUser.getId(), resolvedSecondUser.getId());
  }
}
