/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model.auditing;

import ch.rafaelurben.sheetmusiclearner.backend.config.auditing.AuditRevisionListener;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Objects;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionMapping;

@Entity
@Table(name = "revinfo")
@RevisionEntity(AuditRevisionListener.class)
@Getter
@Setter
public class AuditRevisionEntry extends RevisionMapping {

  @Column(nullable = false)
  private UUID userId;

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    if (!super.equals(o)) return false;
    AuditRevisionEntry that = (AuditRevisionEntry) o;
    return Objects.equals(userId, that.userId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(super.hashCode(), userId);
  }
}
