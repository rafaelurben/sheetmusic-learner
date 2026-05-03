/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "pieces")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Piece extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Metadata

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "composer")
  private String composer;

  @Column(name = "year", nullable = false)
  private String year;

  @Column(name = "description", nullable = false)
  private String description;

  @Column(name = "difficulty")
  private String difficulty;

  @Column(name = "bpm_range")
  private String bpmRange;

  // Access Control

  @Column(name = "is_public", nullable = false)
  @Builder.Default
  private Boolean isPublic = false;

  // Relationships

  @OneToMany(mappedBy = "piece", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("position ASC")
  private List<ScoreSheet> scoreSheets;

  @OneToMany(mappedBy = "piece", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("position ASC")
  private List<Section> sections;

  @OneToMany(mappedBy = "piece", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<PiecePermission> permissions;

  // Helpers

  public boolean isPublic() {
    return Boolean.TRUE.equals(isPublic);
  }
}
