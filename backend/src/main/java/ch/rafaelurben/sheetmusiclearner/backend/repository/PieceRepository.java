/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.repository;

import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PieceRepository extends JpaRepository<Piece, UUID> {

  /**
   * Find all pieces a user may read. This includes all public pieces and all pieces for which the
   * user has explicit permissions.
   */
  @Query(
      "SELECT p FROM Piece p WHERE p.isPublic = true OR EXISTS (SELECT pp FROM PiecePermission pp"
          + " WHERE pp.piece.id = p.id AND pp.user.id = :userId)")
  List<Piece> findAccessibleByUserId(@Param("userId") UUID userId);
}
