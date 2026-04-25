/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.RoomUserJoinedEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.RoomUserLeftEvent;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomUserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.BaseSpringBootTest;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.TestUsers;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class RoomUserServiceTest extends BaseSpringBootTest {

  @MockitoBean private RoomRepository roomRepository;
  @MockitoBean private RoomUserRepository roomUserRepository;
  @MockitoBean private UserRepository userRepository;

  @Autowired private RoomUserServiceImpl roomUserService;

  @Test
  void testCreateRoomUser() {
    UUID roomId = UUID.randomUUID();
    User user = TestUsers.createUser(UUID.randomUUID());

    when(roomRepository.findById(roomId))
        .thenReturn(Optional.of(Room.builder().id(roomId).build()));

    roomUserService.createRoomUser(roomId, user);

    var payload = assertSingleMessage(Destinations.topicRoom(roomId), RoomUserJoinedEvent.class);
    assertEquals(user.getId(), payload.user().getId());
  }

  @Test
  void testDeleteRoomUser() {
    UUID roomId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    RoomUser.RoomUserId roomUserId = new RoomUser.RoomUserId(roomId, userId);

    when(userRepository.findById(userId)).thenReturn(Optional.of(TestUsers.createUser(userId)));

    roomUserService.deleteRoomUser(roomUserId);

    var payload = assertSingleMessage(Destinations.topicRoom(roomId), RoomUserLeftEvent.class);
    assertEquals(userId, payload.userId());
  }
}
