/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import ch.rafaelurben.sheetmusiclearner.backend.utils.WithId;
import ch.rafaelurben.sheetmusiclearner.backend.utils.WithPosition;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.UUID;
import lombok.*;
import lombok.experimental.FieldNameConstants;
import org.hibernate.envers.Audited;
import org.hibernate.validator.constraints.Length;

@Entity
@Table(name = "sections")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
@Builder
public class Section extends BaseEntity implements WithId<UUID>, WithPosition {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Metadata

  @Column(name = "positions", nullable = false)
  private Integer position;

  @Column(name = "name", nullable = false)
  @Length(max = 25)
  private String name;

  @Column(name = "time_signature_numerator")
  private Integer timeSignatureNumerator;

  @Column(name = "time_signature_denominator")
  private Integer timeSignatureDenominator;

  @Column(name = "bar_count")
  private Integer barCount;

  @Column(name = "bpm")
  private Integer bpm;

  @Column(name = "pos_x1")
  @Min(0)
  @Max(1)
  private Float posX1;

  @Column(name = "pos_y1")
  @Min(0)
  @Max(1)
  private Float posY1;

  @Column(name = "pos_x2")
  @Min(0)
  @Max(1)
  private Float posX2;

  @Column(name = "pos_y2")
  @Min(0)
  @Max(1)
  private Float posY2;

  // Relationships

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "piece_id", nullable = false)
  private Piece piece;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "score_sheet_id")
  private ScoreSheet scoreSheet;
}
