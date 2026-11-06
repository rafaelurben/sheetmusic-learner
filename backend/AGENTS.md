# Backend Agent Guide

## Stack

- Java 25, Spring Boot 4.1.2 (Spring Framework 6.2+), Maven 3.9+
- Persistence: Spring Data JPA + Hibernate ORM, Hibernate Envers (`@Audited`), Liquibase migrations
  (`src/main/resources/db/changelog/`)
- Database: PostgreSQL 16+ (dev port `5433`), H2 in-memory (tests)
- Storage: MinIO / AWS S3 SDK (`software.amazon.awssdk:s3`, API port `9000`, console `9090`)
- Security: OAuth2 Resource Server (JWT verification against mock OIDC `http://localhost:4011`)
- Web:
  - REST (`/api/v1/**`): Spring WebMvc generated from `openapi.yml`
  - Realtime (`/ws`): Spring WebSocket + STOMP (inbound `/app/**`, broadcast `/topic/**`, user queue `/user/queue/**`)
- Code Generation & Tooling:
  - OpenAPI Generator Maven plugin (`target/generated-sources/openapi`)
  - Lombok (`@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@Builder`, `@Slf4j`)
  - MapStruct 1.6 (`@Mapper(componentModel = "spring")`, `lombok-mapstruct-binding`)
  - Spotless Maven plugin (Google Java Format + license header `/* (C) $YEAR - Rafael Urben */`)

## Commands (cwd: `backend/`)

- `mvn compile` - Compile and generate OpenAPI interfaces/DTOs in `target/generated-sources/openapi`
- `mvn spring-boot:run` - Start app on `http://localhost:8080`
- `mvn clean verify` - Run all tests and verifications (includes `spotless:check`)
- `mvn verify -DskipTests` - Fast build without tests
- `mvn spotless:check` - Check formatting compliance
- `mvn spotless:apply` - **REQUIRED after Java/YAML/XML changes**: formats code and applies license headers

## Architecture & Structure

Package root: `ch.rafaelurben.sheetmusiclearner.backend`

- `api/` (generated in `target/generated-sources/openapi/`): Generated controller interfaces and DTOs. **Never edit
  manually.** Modify root `openapi.yml` and run `mvn compile`.
- `config/`: Security, WebSocket, S3, Auditing configuration.
- `exceptions/`: Domain exceptions (`NotFoundException`, `ForbiddenException`). Handlers: `GlobalRestExceptionHandler`
  (REST), `GlobalMessagingExceptionHandler` (STOMP).
- `io/sync/`: REST controllers implementing generated OpenAPI interfaces (e.g. `PiecesController implements PiecesApi`).
- `io/async/`: STOMP controllers (`@MessageMapping` for `/app/**`) and event DTOs.
- `io/mapper/`: MapStruct mappers (`Entity <-> DTO`). Never expose JPA entities in REST/WS payloads.
- `model/`: JPA entities extending `BaseEntity` (UUID PK, `createdAt`, `updatedAt`). Use `@Audited` for entities needing
  Envers revision history.
- `repository/`: Spring Data JPA repositories (`JpaRepository<T, ID>`). Use derived queries or `@Query`.
- `service/`: Interfaces (`*Service`) and implementations (`*ServiceImpl`). Contains all business logic, transactions,
  and auth rules.
  - `MessagingService`: Encapsulates STOMP broadcasting to `/topic/**` and `/user/queue/**`.
- `utils/`: Helpers.

## Coding Conventions & Rules

- **Layering**:
  - Controllers: Thin. Extract user (`userService.getCurrentUserEntity()`), delegate to services, return DTOs. No direct
    repo access or business logic.
  - Services: Own business logic, authorization, transactions, and event publishing.
  - Repositories: Thin query interfaces only.
- **Dependency Injection**: Constructor injection with `private final` fields via Lombok `@RequiredArgsConstructor`.
  Never use `@Autowired` field injection.
- **Transactions**: Use `@Transactional` on mutating methods/classes; use `@Transactional(readOnly = true)` for
  query-only methods.
- **Database**: All schema changes must be in Liquibase changelogs (`src/main/resources/db/changelog/`). Never use
  `ddl-auto=update` in production (`validate` mode standard).
- **Entities**: Extend `BaseEntity`. Add `@Audited` where revision history is required (`Piece`, `Section`,
  `ScoreSheet`).

## Testing Guidelines

- **Visibility**: Package-private test classes and methods (no `public` modifier required in JUnit 5).
- **Naming**: `test<Method><Scenario>` (e.g. `testCreatePieceSuccess`, `testGetPieceNotFound`).
- **Base class**: Extend `BaseSpringBootTest` for integration tests (sets `test` profile, in-memory DB,
  `TestUsers.setCurrentUser(...)`, message asserter).
- **Mocking**:
  - **Never mock mappers (`*Mapper`)**: Always use real MapStruct implementations.
  - **Never mock repositories (`*Repository`)** in integration tests: Use real repositories with DB.
  - **Collaborators**: Use `@MockitoBean` (Spring Boot 3.4+ / 4.x standard; never use deprecated `@MockBean`).
- **STOMP testing**: Use `getMessageAsserter().assertMessage(destination, payloadType, payloadConsumer)`.
  `BaseSpringBootTest` checks `messageAsserter.assertNoMore()` in `@AfterEach`.

## Key Files

- API Contract: `../openapi.yml`
- Build: `pom.xml`
- Config: `config/SecurityConfig.java`, `config/WebSocketConfig.java`
- Error Handlers: `io/sync/GlobalRestExceptionHandler.java`, `io/async/GlobalMessagingExceptionHandler.java`
- Messaging: `service/MessagingService.java`
- Base Tests: `src/test/java/ch/rafaelurben/sheetmusiclearner/backend/testsupport/BaseSpringBootTest.java`,
  `MessageAsserter.java`
- Protocol Docs: `../docs/communication.md`
