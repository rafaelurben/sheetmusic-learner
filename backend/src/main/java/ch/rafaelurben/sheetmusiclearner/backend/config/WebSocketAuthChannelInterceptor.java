/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.service.PieceService;
import ch.rafaelurben.sheetmusiclearner.backend.service.RoomUserService;
import ch.rafaelurben.sheetmusiclearner.backend.service.UserService;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.stereotype.Component;

/** This interceptor intercepts STOMP requests in order to authenticate and authorize them. */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

  private static final String TOKEN_HEADER = "Authorization";
  private static final String TOKEN_HEADER_PREFIX = "Bearer ";

  private final JwtDecoder jwtDecoder;
  private final JwtAuthenticationConverter jwtAuthenticationConverter =
      new JwtAuthenticationConverter();

  @Lazy private final PieceService pieceService;
  @Lazy private final RoomUserService roomUserService;
  @Lazy private final UserService userService;

  private final ConcurrentMap<String, RoomUser.RoomUserId> roomUserIdsBySubscription =
      new ConcurrentHashMap<>();

  private Optional<String> getSubscriptionKey(StompHeaderAccessor accessor) {
    String sessionId = accessor.getSessionId();
    String subscriptionId = accessor.getSubscriptionId();
    if (sessionId == null || subscriptionId == null) {
      return Optional.empty();
    }
    return Optional.of(sessionId + ":" + subscriptionId);
  }

  private void handleRoomJoin(User user, UUID roomId, StompHeaderAccessor accessor) {
    roomUserService.createRoomUser(roomId, user);
    getSubscriptionKey(accessor)
        .ifPresent(
            key ->
                roomUserIdsBySubscription.put(key, new RoomUser.RoomUserId(roomId, user.getId())));
  }

  private void handleRoomLeave(RoomUser.RoomUserId roomUserId) {
    roomUserService.deleteRoomUser(roomUserId);
  }

  /** Basic handler for any STOMP SUBSCRIBE frame. */
  private void handleSubscribe(StompHeaderAccessor accessor) {
    if (!(accessor.getUser() instanceof Authentication authentication)) {
      throw new BadCredentialsException("Missing authentication for STOMP frame");
    }
    String destination = accessor.getDestination();

    // Authorize /topic/piece.xxxx
    Optional<UUID> optionalPieceId =
        Destinations.extractPieceIdFromTopicPieceDestination(destination);
    if (optionalPieceId.isPresent()) {
      User user = userService.getUserEntity(authentication);
      pieceService.ensureReadableByUser(user, optionalPieceId.get());
      return;
    }

    // Handle /topic/room.xxx
    Optional<UUID> optionalRoomId = Destinations.extractRoomIdFromTopicRoomDestination(destination);
    if (optionalRoomId.isPresent()) {
      User user = userService.getUserEntity(authentication);
      handleRoomJoin(user, optionalRoomId.get(), accessor);
    }
  }

  /** Basic handler for any STOMP UNSUBSCRIBE frame. */
  private void handleUnsubscribe(StompHeaderAccessor accessor) {
    // Handle /topic/room.xxx
    getSubscriptionKey(accessor)
        .map(roomUserIdsBySubscription::remove)
        .ifPresent(this::handleRoomLeave);
  }

  /**
   * Actual handler that gets called from the framework. The following STOMP commands are handled:
   * </br> - {@link StompCommand#CONNECT}: Authenticates session and stores user in session.</br> -
   * {@link StompCommand#SUBSCRIBE}: Delegates to {@link #handleSubscribe} for authorization or
   * other tasks.</br> - {@link StompCommand#UNSUBSCRIBE}: Delegates to {@link #handleUnsubscribe}
   * for cleanup tasks.</br> For other commands, no special handling is done in this interceptor.
   */
  @Override
  public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor == null) {
      log.warn("Could not get accessor from message, wrapping instead");
      accessor = StompHeaderAccessor.wrap(message);
    }

    StompCommand command = accessor.getCommand();

    if (StompCommand.CONNECT.equals(command)) {
      log.debug("Authenticating STOMP CONNECT command.");
      String authHeader = accessor.getFirstNativeHeader(TOKEN_HEADER);

      if (authHeader == null || !authHeader.startsWith(TOKEN_HEADER_PREFIX)) {
        log.error("Missing or invalid Authorization header in WebSocket CONNECT");
        throw new BadCredentialsException("Missing Authorization header");
      }

      String token = authHeader.substring(TOKEN_HEADER_PREFIX.length());

      try {
        Jwt jwt = jwtDecoder.decode(token);
        Authentication authentication = jwtAuthenticationConverter.convert(jwt);

        log.debug(
            "Authenticated - JWT Claims: {} | Authorities: {}",
            jwt.getClaims(),
            authentication.getAuthorities());

        // Make accessor mutable and set the user
        if (!accessor.isMutable()) {
          log.warn("Accessor is not mutable, wrapping message to create a mutable accessor");
          accessor = StompHeaderAccessor.wrap(message);
        }
        accessor.setUser(authentication);

        // Return a new message with the modified accessor to persist changes
        return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
      } catch (JwtValidationException e) {
        log.warn("Invalid JWT Token: {}", e.getMessage());
        throw new BadCredentialsException("Invalid JWT Token", e);
      } catch (Exception e) {
        log.error("Failed to authenticate WebSocket CONNECT!", e);
        throw new BadCredentialsException("Failed to authenticate!", e);
      }
    } else if (StompCommand.SUBSCRIBE.equals(command)) {
      handleSubscribe(accessor);
    } else if (StompCommand.UNSUBSCRIBE.equals(command)) {
      handleUnsubscribe(accessor);
    }

    return message;
  }

  /** Handler that gets called after completion. Used only for logging purposes. */
  @Override
  public void afterSendCompletion(
      @NonNull Message<?> message, @NonNull MessageChannel channel, boolean sent, Exception ex) {
    if (ex != null) {
      log.error("Exception after sending message", ex);
    }
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      log.info(
          "CONNECT message processing completed. Sent: {}, Exception: {}",
          sent,
          ex != null ? ex.getMessage() : "none");
    }
  }
}
