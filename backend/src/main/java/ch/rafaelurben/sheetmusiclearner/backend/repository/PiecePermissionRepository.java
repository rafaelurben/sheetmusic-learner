/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.repository;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import ch.rafaelurben.sheetmusiclearner.backend.model.PiecePermission;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PiecePermissionRepository
    extends JpaRepository<PiecePermission, PiecePermission.PiecePermissionId> {

  boolean existsByPieceIdAndUserId(UUID pieceId, UUID userId);

  boolean existsByPieceIdAndUserIdAndPermissionTypeIn(
      UUID pieceId, UUID userId, Set<PermissionType> permissionTypes);

  Optional<PiecePermission> findByPieceIdAndUserId(UUID pieceId, UUID userId);

  long countByPieceIdAndPermissionType(UUID pieceId, PermissionType permissionType);
}
