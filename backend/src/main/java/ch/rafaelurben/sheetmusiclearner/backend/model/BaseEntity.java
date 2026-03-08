/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @CreationTimestamp
  @Column(name = "timestamp_created", nullable = false, updatable = false)
  private Instant timestampCreated;

  @UpdateTimestamp
  @Column(name = "timestamp_updated", nullable = false)
  private Instant timestampUpdated;
}
