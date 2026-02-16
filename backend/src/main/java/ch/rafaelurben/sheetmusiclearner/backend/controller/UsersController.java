/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.UsersApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UsersController implements UsersApi {

  private final UsersService usersService;

  @Override
  public UserDto getCurrentUser() {
    return usersService.getCurrentUser();
  }
}
