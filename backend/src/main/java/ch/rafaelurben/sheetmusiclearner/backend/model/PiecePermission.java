/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.UUID;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "piece_permissions")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(PiecePermission.PiecePermissionId.class)
public class PiecePermission extends BaseEntity {

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "piece_id", nullable = false)
  private Piece piece;

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  // Permission

  @Enumerated(EnumType.STRING)
  @Column(name = "permission_type", nullable = false)
  private PermissionType permissionType;

  // Composite Key Class

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class PiecePermissionId implements Serializable {
    private UUID piece;
    private UUID user;
  }
}
