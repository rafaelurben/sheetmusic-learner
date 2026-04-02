/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.PieceMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValueMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {ScoreSheetMapper.class, SectionMapper.class, PiecePermissionMapper.class})
public interface PieceMapper {

  PieceDto toDto(Piece piece);

  PieceMetadataDto toMetadataDto(Piece piece);

  List<PieceDto> toDtoList(List<Piece> pieces);

  Piece toEntityFromCreateRequest(PieceCreateRequestDto createRequestDto);

  void updateEntityFromUpdateRequest(
      @MappingTarget Piece piece, PieceUpdateRequestDto updateRequestDto);
}
