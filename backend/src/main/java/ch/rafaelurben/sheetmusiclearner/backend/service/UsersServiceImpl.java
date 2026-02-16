/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class UsersServiceImpl implements UsersService {

  @Override
  public UserDto getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null) {
      throw new AuthenticationServiceException("No authentication found");
    }
    Jwt principal = (Jwt) authentication.getPrincipal();
    if (principal == null) {
      throw new AuthenticationServiceException("No principal found");
    }

    // TODO: Replace with real logic and include database.
    return UserDto.builder()
        .firstName(principal.getClaimAsString("given_name"))
        .lastName(principal.getClaimAsString("name"))
        .email(principal.getClaimAsString("email"))
        .build();
  }
}
