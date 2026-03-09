/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.RoomMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

  private final RoomRepository roomRepository;
  private final RoomMapper roomMapper;

  @Override
  public List<RoomDto> getAllAvailableRooms(final User user) {
    return roomMapper.toDtoList(roomRepository.findAll());
  }

  @Override
  public RoomDto createRoom(final User user, final RoomCreateRequestDto createRequestDto) {
    Room room = roomMapper.toEntityFromCreateRequest(createRequestDto);
    room.setOwner(user);
    // TODO: get and set piece if pieceId is provided
    room = roomRepository.save(room);

    // TODO: send event to general topic

    return roomMapper.toDto(room);
  }

  private Room getRoomById(final UUID roomId) {
    return roomRepository
        .findById(roomId)
        .orElseThrow(() -> new ObjectNotFoundException("Room not found"));
  }

  @Override
  public RoomDto getRoomById(final User user, final UUID roomId) {
    Room room = getRoomById(roomId);
    return roomMapper.toDto(room);
  }

  @Override
  public void deleteRoom(final User user, final UUID roomId) {
    Room room = getRoomById(roomId);

    if (!room.getOwner().getId().equals(user.getId())) {
      throw new InsufficientPermissionException("Only the owner can delete the room");
    }

    roomRepository.delete(room);

    // TODO: send event to general topic
    // TODO: send event to room topic
  }
}
