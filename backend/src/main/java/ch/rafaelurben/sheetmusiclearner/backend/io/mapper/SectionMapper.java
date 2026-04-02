/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.SectionDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Section;
import java.util.List;
import org.mapstruct.*;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT,
    unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SectionMapper {

  @Mapping(source = "scoreSheet.id", target = "scoreSheetId")
  SectionDto toDto(Section section);

  List<SectionDto> toDtoList(List<Section> sections);

  Section toEntityFromCreateRequest(PieceSectionAddRequestDto createRequestDto);

  void updateEntityFromUpdateRequest(
      @MappingTarget Section section, PieceSectionUpdateRequestDto updateRequestDto);
}
