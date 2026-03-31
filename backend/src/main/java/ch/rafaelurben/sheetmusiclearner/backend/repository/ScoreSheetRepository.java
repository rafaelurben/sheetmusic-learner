/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.repository;

import ch.rafaelurben.sheetmusiclearner.backend.model.ScoreSheet;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScoreSheetRepository extends JpaRepository<ScoreSheet, UUID> {

  @Query("SELECT MAX(ss.position) FROM ScoreSheet ss WHERE ss.piece.id = :pieceId")
  Optional<Integer> findMaxPositionByPieceId(@Param("pieceId") UUID pieceId);
}
