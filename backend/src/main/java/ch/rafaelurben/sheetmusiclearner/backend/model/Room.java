/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.*;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

@Entity
@Table(name = "rooms")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Metadata

  @Column(name = "title", nullable = false)
  private String title;

  // Playback config

  @Column(name = "tempo_multiplier", nullable = false)
  @DecimalMin("0.01")
  @DecimalMax("10.0")
  @Builder.Default
  private Float tempoMultiplier = 1.0f;

  // Playback state

  @Column(name = "playing", nullable = false)
  @Builder.Default
  private Boolean playing = false;

  @Column(name = "last_play_section_position")
  @Min(0)
  private Integer lastPlaySectionPosition;

  @Column(name = "last_play_timestamp")
  private Instant lastPlayTimestamp;

  // Relationships

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private User owner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "piece_id")
  private Piece piece;

  @NotAudited
  @OneToMany(mappedBy = RoomUser.Fields.room, cascade = CascadeType.ALL, orphanRemoval = true)
  private List<RoomUser> roomUsers;

  // Helpers

  public boolean isPlaying() {
    return Boolean.TRUE.equals(playing);
  }
}
