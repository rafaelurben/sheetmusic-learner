/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.BaseSpringBootTest;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.TestUsers;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class UserServiceTest extends BaseSpringBootTest {

  @Autowired private UserRepository userRepository;

  @Autowired private UserService userService;

  @Test
  void testGetCurrentUserDtoNewUserUpdateFalse() {
    UUID user1Id = UUID.randomUUID();
    User user1a = TestUsers.createUser(user1Id);
    TestUsers.setCurrentUser(user1a);

    UserDto userResult = userService.getCurrentUserDto(false);
    assertEquals(user1a.getId(), userResult.getId());
    assertEquals(user1a.getFirstName(), userResult.getFirstName());
  }

  @Test
  void testGetCurrentUserDtoNewUserUpdateTrue() {
    UUID user1Id = UUID.randomUUID();
    User user1a = TestUsers.createUser(user1Id);
    TestUsers.setCurrentUser(user1a);

    UserDto userResult = userService.getCurrentUserDto(true);
    assertEquals(user1a.getId(), userResult.getId());
    assertEquals(user1a.getFirstName(), userResult.getFirstName());
  }

  @Test
  void testGetCurrentUserDtoExistingUserUpdateFalse() {
    UUID user1Id = UUID.randomUUID();
    User user1a = TestUsers.createUser(user1Id);
    User user1b = TestUsers.createUser(user1Id);

    userRepository.save(user1a);

    TestUsers.setCurrentUser(user1b);

    UserDto userResult = userService.getCurrentUserDto(false);
    assertEquals(user1a.getId(), userResult.getId());
    assertEquals(user1a.getFirstName(), userResult.getFirstName());
  }

  @Test
  void testGetCurrentUserDtoExistingUserUpdateTrue() {
    UUID user1Id = UUID.randomUUID();
    User user1a = TestUsers.createUser(user1Id);
    User user1b = TestUsers.createUser(user1Id);

    userRepository.save(user1a);

    TestUsers.setCurrentUser(user1b);

    UserDto userResult = userService.getCurrentUserDto(true);
    assertEquals(user1b.getId(), userResult.getId());
    assertEquals(user1b.getFirstName(), userResult.getFirstName());
  }

  @Test
  void testGetUserByEmailDtoExists() {
    UUID user1Id = UUID.randomUUID();
    User user1 = TestUsers.createUser(user1Id);

    userRepository.save(user1);

    UserDto userResult = userService.getUserByEmailDto(user1.getEmail());
    assertEquals(user1.getId(), userResult.getId());
    assertEquals(user1.getFirstName(), userResult.getFirstName());
  }

  @Test
  void testGetUserByEmailDtoDoesNotExist() {
    assertThrows(ObjectNotFoundException.class, () -> userService.getUserByEmailDto("nonexistent"));
  }
}
