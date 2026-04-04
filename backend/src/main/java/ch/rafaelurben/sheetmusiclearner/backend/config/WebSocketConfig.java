/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws").setAllowedOrigins("*");
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.setApplicationDestinationPrefixes("/app");
    config
        .enableSimpleBroker("/topic", "/queue")
        .setTaskScheduler(heartBeatScheduler())
        .setHeartbeatValue(new long[] {25_000, 25_000});
    config.setUserDestinationPrefix("/user/");
  }

  @Bean
  public TaskScheduler heartBeatScheduler() {
    return new ThreadPoolTaskScheduler();
  }
}
