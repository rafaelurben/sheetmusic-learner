/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.repository;

import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, RoomUser.RoomUserId> {

  @Query(
      """
        select count(ru) > 0 from RoomUser ru
        where ru.user.id = :userId
        and ru.room.piece.id = :pieceId
      """)
  boolean existsByUserIdAndRoomPieceId(
      @Param("userId") UUID userId, @Param("pieceId") UUID pieceId);
}
