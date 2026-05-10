/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import java.util.List;
import org.mapstruct.*;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {ScoreSheetMapper.class, SectionMapper.class, PiecePermissionMapper.class})
public interface PieceMapper {

  PieceDto toDto(Piece piece);

  PieceMetadataDto toMetadataDto(Piece piece);

  List<PieceMetadataDto> toMetadataDtoList(List<Piece> pieces);

  Piece toEntityFromCreateRequest(PieceCreateRequestDto createRequestDto);

  void updateEntityFromUpdateRequest(
      @MappingTarget Piece piece, PieceUpdateRequestDto updateRequestDto);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "isPublic", ignore = true)
  @Mapping(target = "scoreSheets", ignore = true)
  @Mapping(target = "sections", ignore = true)
  @Mapping(target = "permissions", ignore = true)
  @Mapping(target = "timestampCreated", ignore = true)
  @Mapping(target = "timestampUpdated", ignore = true)
  void updateFromHistoricalVersion(@MappingTarget Piece piece, Piece historicalPiece);
}
