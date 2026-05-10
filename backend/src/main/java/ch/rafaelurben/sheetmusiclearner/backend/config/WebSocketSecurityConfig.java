/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import static org.springframework.messaging.simp.SimpMessageType.*;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/** Security-specific WebSocket config. */
@Configuration
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

  @Bean
  MessageMatcherDelegatingAuthorizationManager.Builder
      messageMatcherDelegatingAuthorizationManagerBuilder() {
    return new MessageMatcherDelegatingAuthorizationManager.Builder();
  }

  @Bean
  AuthorizationManager<Message<?>> messageAuthorizationManager(
      MessageMatcherDelegatingAuthorizationManager.Builder messages) {
    messages
        // CONNECT and DISCONNECT must be first to ensure they pass through
        // The WebSocketAuthChannelInterceptor will handle actual authentication for CONNECT
        .simpTypeMatchers(CONNECT, DISCONNECT, UNSUBSCRIBE, HEARTBEAT)
        .permitAll()
        // MESSAGE to application destinations
        .simpMessageDestMatchers("/app/**")
        .authenticated()
        // SUBSCRIBE to user and topic destinations
        // Authorization happens in WebSocketAuthChannelInterceptor
        .simpSubscribeDestMatchers("/user/**", "/topic/**")
        .authenticated()
        // Everything else is denied
        .anyMessage()
        .denyAll();

    return messages.build();
  }
}
