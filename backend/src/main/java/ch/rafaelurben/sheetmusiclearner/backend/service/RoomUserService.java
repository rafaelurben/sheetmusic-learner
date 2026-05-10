/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import java.util.UUID;

/** Service for managing the currently present users in a room. */
public interface RoomUserService {

  void createRoomUser(UUID roomId, User user);

  void deleteRoomUser(RoomUser.RoomUserId roomUserId);
}
