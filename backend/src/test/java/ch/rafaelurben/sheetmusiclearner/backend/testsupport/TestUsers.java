/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

/** Testing utility providing helpers for testing with users. */
public final class TestUsers {

  private TestUsers() {}

  public static User createUser(UUID userId) {
    return User.builder()
        .id(userId)
        .firstName(RandomUtils.string(10, 30))
        .lastName(RandomUtils.string(10, 30))
        .email("%s@example.test".formatted(userId))
        .avatarUrl("https://example.test/avatar/%s".formatted(userId))
        .build();
  }

  public static Authentication authentication(User user) {
    Jwt jwt =
        Jwt.withTokenValue("test-token-%s".formatted(user.getId()))
            .header("alg", "none")
            .claim("sub", user.getId().toString())
            .claim("given_name", user.getFirstName())
            .claim("name", user.getLastName())
            .claim("email", user.getEmail())
            .claim("picture", user.getAvatarUrl())
            .build();

    return new UsernamePasswordAuthenticationToken(jwt, null, List.of());
  }

  public static void setCurrentUser(User user) {
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication(user));
    SecurityContextHolder.setContext(context);
  }

  public static void clearCurrentUser() {
    SecurityContextHolder.clearContext();
  }

  public static <T> T runAs(User user, Supplier<T> supplier) {
    SecurityContext previousContext = SecurityContextHolder.getContext();
    try {
      setCurrentUser(user);
      return supplier.get();
    } finally {
      SecurityContextHolder.setContext(previousContext);
    }
  }
}
