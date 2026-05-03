/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.utils;

import java.util.UUID;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

/** Utils for working with {@link Jwt} */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class JwtUtils {
  public static Jwt getJwtPrincipal(final Authentication authentication) {
    if (authentication == null) {
      throw new AuthenticationServiceException("No authentication found");
    }
    Jwt principal = (Jwt) authentication.getPrincipal();
    if (principal == null) {
      throw new AuthenticationServiceException("No principal found");
    }
    return principal;
  }

  public static UUID extractUserId(final Jwt principal) {
    return UUID.fromString(principal.getSubject());
  }
}
