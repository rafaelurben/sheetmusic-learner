---
applyTo: "backend/src/test/**/*.java"
---

# Backend Testing Guidelines

- Keep test classes and test methods package-private.
- Name methods annotated with `@Test` as `test` + target method name (optionally followed by scenario details).
- Never mock mappers (`*Mapper`); use real mapper implementations.
- For Spring integration-style tests in this codebase, prefer extending `BaseSpringBootTest`.
- Mock collaborators with `@MockitoBean` when needed, and keep assertions focused on observable behavior.
