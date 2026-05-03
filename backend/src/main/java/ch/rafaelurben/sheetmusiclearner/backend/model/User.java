/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.model;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "users")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

  @Id private UUID id;

  // Metadata

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "email")
  private String email;

  @Column(name = "avatar_url")
  private String avatarUrl;
}
