# sheetmusic-learner

An open-source web application for collaboratively learning sheet music, featuring synchronized score sheet viewing,
real-time audio and metronome playback, room-based practice sessions, and versioned piece management.

## Project Structure

This repository is organized as a monorepo containing a Spring Boot backend, a React frontend, a contract-first OpenAPI
specification, and shared documentation:

- **`./backend/`**
  Spring Boot 4 / Java 25 service providing REST APIs (`/api/v1`) and real-time STOMP messaging over WebSockets (`/ws`).
  > See `backend/AGENTS.md` for backend architecture, development commands, Spring best
  > practices, testing guidelines, and conventions.
- **`./frontend/`**
  React 19 + Vite + TypeScript single-page application built with Zustand, Tailwind CSS, and shadcn UI.
  > See `frontend/AGENTS.md` for frontend architecture, development commands, React 19 best
  > practices, store patterns, and conventions.
- **`./openapi.yml`**
  Contract-first OpenAPI 3.0 specification serving as the single source of truth for all REST endpoints and DTO schemas
  across backend and frontend.
- **`./docs/`**
  Technical specifications, architecture diagrams, and domain documentation:
    - `./docs/architecture.md`: Overall system design and component interactions.
    - `./docs/communication.md`: REST and STOMP destination semantics, payloads, and protocols.
    - `./docs/communication_flow.md`: Real-time collaboration workflows and sequence flows.
    - `./docs/data-structure.md`: Database entity model and Hibernate Envers audit design.
    - `./docs/music_timing.md`: Metronome synchronization, BPM definitions, and timing accuracy.
    - `./docs/security.md`: OIDC authentication, authorization, and WebSocket session security.
- **`./docker-compose.yml`**
  Local development dependencies (`docker compose up -d --wait`):
    - **PostgreSQL**: port `5433` (note: non-default port)
    - **Mock OIDC Server**: port `4011` (`http://localhost:4011`)
    - **MinIO S3 Storage**: API port `9000`, Web console `9090` (`http://localhost:9090`)
- **`./docker-compose-full.yml`**
  Full containerized stack including frontend and backend containers for end-to-end integration testing.
- **`./deploy`**
  Deployment compose files and configuration for Coolify hosting.
