/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.Ordered;
import org.springframework.resilience.annotation.EnableResilientMethods;

@SpringBootApplication
@EnableResilientMethods(order = Ordered.LOWEST_PRECEDENCE) // enable @Retryable
public class BackendApplication {

  static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
  }
}
