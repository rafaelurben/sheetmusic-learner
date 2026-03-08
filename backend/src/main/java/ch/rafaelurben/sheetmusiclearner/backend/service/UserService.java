/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;

public interface UserService {

  /**
   * Gets the current user entity. Will be created from the JWT if it does not exist yet.
   *
   * @param update Force an update of the user entity from the JWT.
   */
  User getCurrentUserEntity(boolean update);

  /**
   * Shorthand for {@link #getCurrentUserEntity(boolean)} with {@code update} set to {@code false}.
   */
  default User getCurrentUserEntity() {
    return getCurrentUserEntity(false);
  }

  /**
   * Gets the current user DTO. Will be created from the JWT if it does not exist yet.
   *
   * @param update Force an update of the user entity from the JWT.
   */
  UserDto getCurrentUserDto(boolean update);

  /** Shorthand for {@link #getCurrentUserDto(boolean)} with {@code update} set to {@code false}. */
  default UserDto getCurrentUserDto() {
    return getCurrentUserDto(false);
  }
}
