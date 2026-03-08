/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {HelperMapper.class})
public interface RoomMapper {

  @Mapping(source = "owner.id", target = "ownerId")
  @Mapping(source = "piece.id", target = "pieceId")
  RoomDto toDto(Room room);

  List<RoomDto> toDtoList(List<Room> rooms);

  @Mapping(source = "pieceId", target = "piece.id")
  Room toEntityFromCreateRequest(RoomCreateRequestDto createRequestDto);
}
