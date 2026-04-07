/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.sync.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.UsersApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UsersController implements UsersApi {

  private final UserService userService;

  @Override
  public UserDto getCurrentUser() {
    return userService.getCurrentUserDto(true);
  }

  @Override
  public UserDto getUserByEmail(String email) {
    return userService.getUserByEmailDto(email);
  }
}
