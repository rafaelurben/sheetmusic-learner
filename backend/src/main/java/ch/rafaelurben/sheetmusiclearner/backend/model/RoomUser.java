/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.UUID;
import lombok.*;
import lombok.experimental.FieldNameConstants;

@Entity
@Table(name = "room_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
@Builder
@IdClass(RoomUser.RoomUserId.class)
public class RoomUser extends BaseEntity {

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "room_id", nullable = false)
  private Room room;

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  // Composite Key Class

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class RoomUserId implements Serializable {
    private UUID room;
    private UUID user;
  }
}
