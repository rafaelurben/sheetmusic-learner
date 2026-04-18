/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.UserMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserMapper userMapper;
  private final UserRepository userRepository;

  @Lazy private final UserServiceImpl thisProxy;

  private Jwt getJwtPrincipal(Authentication authentication) {
    if (authentication == null) {
      throw new AuthenticationServiceException("No authentication found");
    }
    Jwt principal = (Jwt) authentication.getPrincipal();
    if (principal == null) {
      throw new AuthenticationServiceException("No principal found");
    }
    return principal;
  }

  /**
   * Get or create a user entity from the given token.
   *
   * @param principal the token that is used as a source for the user data
   * @param update enforce updating the data even if the user already exists.
   * @return the user
   */
  @Transactional(isolation = Isolation.READ_COMMITTED)
  @Retryable(
      includes = {DataIntegrityViolationException.class},
      maxRetries = 3)
  protected User getOrCreateUserEntity(Jwt principal, boolean update) {
    UUID uuid = UUID.fromString(principal.getSubject());

    Optional<User> userOptional = userRepository.findById(uuid);
    if (!update && userOptional.isPresent()) {
      return userOptional.get();
    }

    User user = userOptional.orElseGet(() -> User.builder().id(uuid).build());

    user.setFirstName(principal.getClaimAsString("given_name"));
    user.setLastName(principal.getClaimAsString("name"));
    user.setEmail(principal.getClaimAsString("email"));
    user.setAvatarUrl(principal.getClaimAsString("picture"));

    return userRepository.saveAndFlush(user);
  }

  @Override
  public User getUserEntity(Authentication authentication, boolean update) {
    Jwt principal = getJwtPrincipal(authentication);
    return thisProxy.getOrCreateUserEntity(principal, update);
  }

  @Override
  public User getCurrentUserEntity(boolean update) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return getUserEntity(authentication, update);
  }

  @Override
  @Transactional
  public UserDto getCurrentUserDto(boolean update) {
    return userMapper.toDto(getCurrentUserEntity(update));
  }

  @Override
  @Transactional(readOnly = true)
  public UserDto getUserByEmailDto(String email) {
    if (email == null || email.isBlank()) {
      throw new BadRequestException("Email must not be blank");
    }

    User user =
        userRepository
            .findByEmailIgnoreCase(email.trim())
            .orElseThrow(() -> new ObjectNotFoundException("User not found"));

    return userMapper.toDto(user);
  }
}
