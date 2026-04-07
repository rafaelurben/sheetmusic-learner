/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomUserRepository;
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

  private Room getRoomEntityById(final UUID roomId) {
    return roomRepository
        .findById(roomId)
        .orElseThrow(() -> new ObjectNotFoundException("Room not found"));
  }

  @Override
  @Transactional
  public void createRoomUser(final UUID roomId, final User user) {
    Room room = getRoomEntityById(roomId);
    RoomUser roomUser = RoomUser.builder().room(room).user(user).build();
    roomUserRepository.save(roomUser);
    log.info("Created RoomUser for user {} in room {}", user.getId(), room.getId());
  }

  @Override
  @Transactional
  public void deleteRoomUser(final RoomUser.RoomUserId roomUserId) {
    roomUserRepository.deleteById(roomUserId);
    log.info("Deleted RoomUser for user {} in room {}", roomUserId.getUser(), roomUserId.getRoom());
  }
}
