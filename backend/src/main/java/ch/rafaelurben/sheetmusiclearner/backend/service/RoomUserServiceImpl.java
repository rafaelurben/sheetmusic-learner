/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.RoomUserJoinedEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.RoomUserLeftEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.UserMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomUserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomUserServiceImpl implements RoomUserService {

  private final RoomRepository roomRepository;
  private final RoomUserRepository roomUserRepository;
  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final MessagingService messagingService;

  private Room getRoomEntityById(final UUID roomId) {
    return roomRepository
        .findById(roomId)
        .orElseThrow(() -> new ObjectNotFoundException("Room not found"));
  }

  private User getUserEntityById(final UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new ObjectNotFoundException("User not found"));
  }

  @Override
  @Transactional
  public void createRoomUser(final UUID roomId, final User user) {
    Room room = getRoomEntityById(roomId);
    RoomUser roomUser = RoomUser.builder().room(room).user(user).build();
    roomUserRepository.save(roomUser);
    log.info("Created RoomUser for user {} in room {}", user.getId(), room.getId());
    messagingService.send(
        Destinations.topicRoom(roomId), new RoomUserJoinedEvent(userMapper.toDto(user)).asDto());
  }

  @Override
  @Transactional
  public void deleteRoomUser(final RoomUser.RoomUserId roomUserId) {
    User user = getUserEntityById(roomUserId.getUser());
    roomUserRepository.deleteById(roomUserId);
    log.info("Deleted RoomUser for user {} in room {}", roomUserId.getUser(), roomUserId.getRoom());
    messagingService.send(
        Destinations.topicRoom(roomUserId.getRoom()), new RoomUserLeftEvent(user.getId()).asDto());
  }
}
