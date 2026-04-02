/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.repository;

import ch.rafaelurben.sheetmusiclearner.backend.model.Section;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SectionRepository extends JpaRepository<Section, UUID> {

  List<Section> findAllByPieceIdOrderByPositionAsc(UUID pieceId);

  Optional<Section> findByIdAndPieceId(UUID id, UUID pieceId);

  @Modifying
  @Query(
      "UPDATE Section s SET s.scoreSheet = null WHERE s.piece.id = :pieceId AND s.scoreSheet.id ="
          + " :scoreSheetId")
  void clearScoreSheetReferences(
      @Param("pieceId") UUID pieceId, @Param("scoreSheetId") UUID scoreSheetId);
}
