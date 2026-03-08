/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "score_sheets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreSheet extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Metadata

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "position", nullable = false)
  @Min(0)
  private Integer position;

  @Column(name = "image_url")
  private String imageUrl;

  // Relationships

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "piece_id", nullable = false)
  private Piece piece;
}
