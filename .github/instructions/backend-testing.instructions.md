---
applyTo: "backend/src/test/**/*.java"
---

# Backend Testing Guidelines

- Keep test classes and test methods package-private.
- Name methods annotated with `@Test` as `test` + target method name (optionally followed by scenario details).
- Never mock mappers (`*Mapper`); use real mapper implementations.
- For Spring integration-style tests in this codebase, prefer extending `BaseSpringBootTest`.
- Never mock repositories (`*Repository`) in integration tests; use real repository implementations.
- Mock collaborators with `@MockitoBean` when needed, and keep assertions focused on observable behavior.
- Use the getMessageAsserter() method from `BaseSpringBootTest` for asserting messages in tests.
