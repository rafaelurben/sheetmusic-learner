/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.sync.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.RoomsApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.service.RoomService;
import ch.rafaelurben.sheetmusiclearner.backend.service.UserService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class RoomsController implements RoomsApi {

  private final RoomService roomService;
  private final UserService userService;

  @Override
  public List<RoomDto> getRooms() {
    User user = userService.getCurrentUserEntity();
    return roomService.getAllAvailableRooms(user);
  }

  @Override
  public RoomDto createRoom(RoomCreateRequestDto roomCreateRequestDto) {
    User user = userService.getCurrentUserEntity();
    return roomService.createRoom(user, roomCreateRequestDto);
  }

  @Override
  public RoomDto getRoom(UUID id) {
    User user = userService.getCurrentUserEntity();
    return roomService.getRoomById(user, id);
  }

  @Override
  public void deleteRoom(UUID id) {
    User user = userService.getCurrentUserEntity();
    roomService.deleteRoom(user, id);
  }
}
