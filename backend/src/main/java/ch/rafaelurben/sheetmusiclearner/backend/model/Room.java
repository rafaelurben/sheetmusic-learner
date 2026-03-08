/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "rooms")
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

  @Column(name = "tempo_multiplier", nullable = false)
  @Builder.Default
  private Float tempoMultiplier = 1.0f;

  // Playback state

  @Column(name = "playing", nullable = false)
  @Builder.Default
  private Boolean playing = false;

  @Column(name = "last_play_section_position")
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
}
