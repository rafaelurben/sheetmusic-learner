/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.SectionDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Section;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SectionMapper {

  @Mapping(source = "scoreSheet.id", target = "scoreSheetId")
  SectionDto toDto(Section section);

  List<SectionDto> toDtoList(List<Section> sections);
}
