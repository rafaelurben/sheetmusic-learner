/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.UserMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserMapper userMapper;
  private final UserRepository userRepository;

  private Jwt getPrincipal() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null) {
      throw new AuthenticationServiceException("No authentication found");
    }
    Jwt principal = (Jwt) authentication.getPrincipal();
    if (principal == null) {
      throw new AuthenticationServiceException("No principal found");
    }
    return principal;
  }

  @Override
  public User getCurrentUserEntity(boolean update) {
    Jwt principal = getPrincipal();
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

    return userRepository.save(user);
  }

  @Override
  public UserDto getCurrentUserDto(boolean update) {
    return userMapper.toDto(getCurrentUserEntity(update));
  }
}
