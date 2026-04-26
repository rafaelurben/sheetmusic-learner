/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.RoomChatMessageEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.RoomPlaybackStateChangedEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChatMessageRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomControlPlaybackConfigRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PiecePermissionRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PieceRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomRepository;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.BaseSpringBootTest;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.TestUsers;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class RoomServiceTest extends BaseSpringBootTest {

  @MockitoBean private RoomRepository roomRepository;
  @MockitoBean private PieceRepository pieceRepository;
  @MockitoBean private PiecePermissionRepository piecePermissionRepository;

  @Autowired private RoomServiceImpl roomService;

  @Test
  void testSendChatMessage() {
    UUID roomId = UUID.randomUUID();
    User user = TestUsers.createUser(UUID.randomUUID());

    when(roomRepository.findById(roomId))
        .thenReturn(Optional.of(Room.builder().id(roomId).build()));

    roomService.sendChatMessage(user, roomId, new RoomChatMessageRequestDto("hello room"));

    var payload = assertSingleMessage(Destinations.topicRoom(roomId), RoomChatMessageEvent.class);
    assertEquals("hello room", payload.content());
  }

  @Test
  void testControlPlaybackConfig() {
    UUID roomId = UUID.randomUUID();
    User owner = TestUsers.createUser(UUID.randomUUID());
    Room room = Room.builder().id(roomId).owner(owner).playing(false).tempoMultiplier(1.0f).build();

    when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
    when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

    roomService.controlPlaybackConfig(
        owner, roomId, new RoomControlPlaybackConfigRequestDto(1.25f));

    var payload =
        assertSingleMessage(Destinations.topicRoom(roomId), RoomPlaybackStateChangedEvent.class);
    assertEquals(1.25f, payload.tempoMultiplier());
  }
}
