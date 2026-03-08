/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.sync.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.RoomsApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class RoomsController implements RoomsApi {

  @Override
  public List<RoomDto> getRooms() {
    throw new UnsupportedOperationException("Not supported yet.");
  }

  @Override
  public RoomDto createRoom(RoomCreateRequestDto roomCreateRequestDto) {
    throw new UnsupportedOperationException("Not supported yet.");
  }

  @Override
  public RoomDto getRoom(UUID id) {
    throw new UnsupportedOperationException("Not supported yet.");
  }

  @Override
  public void deleteRoom(UUID id) {
    throw new UnsupportedOperationException("Not supported yet.");
  }
}
