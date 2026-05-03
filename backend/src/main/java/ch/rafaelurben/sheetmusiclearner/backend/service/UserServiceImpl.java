/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import static ch.rafaelurben.sheetmusiclearner.backend.utils.JwtUtils.extractUserId;
import static ch.rafaelurben.sheetmusiclearner.backend.utils.JwtUtils.getJwtPrincipal;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.UserMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
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

  /**
   * Get or create a user entity from the given token.
   *
   * @param principal the token that is used as a source for the user data
   * @param update enforce updating the data even if the user already exists.
   * @return the user
   */
  @Transactional(isolation = Isolation.READ_COMMITTED)
  @Retryable(
      includes = {SQLException.class},
      maxRetries = 3)
  protected User getOrCreateUserEntity(Jwt principal, boolean update) {
    UUID uuid = extractUserId(principal);

    Optional<User> userOptional = userRepository.findById(uuid);
    if (!update && userOptional.isPresent()) {
      return userOptional.get();
    }

    User user = userOptional.orElseGet(() -> User.builder().id(uuid).build());

    user.setFirstName(principal.getClaimAsString(StandardClaimNames.GIVEN_NAME));
    user.setLastName(principal.getClaimAsString(StandardClaimNames.NAME));
    user.setEmail(principal.getClaimAsString(StandardClaimNames.EMAIL));
    user.setAvatarUrl(principal.getClaimAsString(StandardClaimNames.PICTURE));

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
  public UserDto getUserDtoByEmail(String email) {
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
