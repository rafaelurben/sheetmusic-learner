/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.invocation.HandlerMethodArgumentResolver;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.security.authorization.AuthorizationEventPublisher;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.SpringAuthorizationEventPublisher;
import org.springframework.security.messaging.access.intercept.AuthorizationChannelInterceptor;
import org.springframework.security.messaging.context.AuthenticationPrincipalArgumentResolver;
import org.springframework.security.messaging.context.SecurityContextChannelInterceptor;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * CSRF-specific WebSocket config. Because all STOMP sessions are authenticated by using a JWT token
 * in the Authorization header, there is no need for CSRF. </br> Disabling CSRF currently not
 * possible with @EnableWebSocketSecurity </br> <a
 * href="https://docs.spring.io/spring-security/reference/servlet/integrations/websocket.html#websocket-sameorigin-disable">Docs</a>
 */
@Configuration
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketCsrfConfig implements WebSocketMessageBrokerConfigurer {

  private final ApplicationContext applicationContext;
  private final AuthorizationManager<Message<?>> authorizationManager;
  private final WebSocketAuthChannelInterceptor customAuthChannelInterceptor;

  @Override
  public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
    argumentResolvers.add(new AuthenticationPrincipalArgumentResolver());
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    AuthorizationChannelInterceptor authz =
        new AuthorizationChannelInterceptor(authorizationManager);
    AuthorizationEventPublisher publisher =
        new SpringAuthorizationEventPublisher(applicationContext);
    authz.setAuthorizationEventPublisher(publisher);
    // Order matters: custom auth interceptor -> security context -> authorization
    registration.interceptors(
        customAuthChannelInterceptor, new SecurityContextChannelInterceptor(), authz);
  }
}
