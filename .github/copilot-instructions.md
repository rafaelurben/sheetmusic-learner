# Project Guidelines

## Build and Test
- Start local dependencies before app work: `docker compose up -d --wait` from the repo root. PostgreSQL runs on `localhost:5433`, not the default Postgres port.
- Backend commands: `cd backend && mvn clean verify`, `cd backend && mvn spring-boot:run`, `cd backend && mvn spotless:check`, and `cd backend && mvn spotless:apply`.
- Frontend commands: `cd frontend && npm ci`, `cd frontend && npm run generate:openapi`, `cd frontend && npm run lint`, `cd frontend && npm run build`, and `cd frontend && npm run dev`.
- Run `npm run generate:openapi` after changing the root `openapi.yml`. The frontend dev server does not regenerate the client automatically.

## Architecture
- Treat the root `openapi.yml` as the API contract source of truth for both backend and frontend.
- The backend is a Spring Boot application with a clear separation between sync REST controllers in `backend/src/main/java/.../io/sync`, async STOMP/WebSocket controllers in `backend/src/main/java/.../io/async`, business logic in `service`, persistence in `repository` and `model`, and DTO mapping in `io/mapper`.
- Backend REST controllers implement generated OpenAPI interfaces instead of defining endpoint contracts manually.
- The frontend is a React 19 + Vite + TypeScript app. Use generated API clients in `frontend/src/api/generated/openapi`, authenticated wrappers in `frontend/src/api/useAuthenticatedApiClient.ts`, Zustand stores in `frontend/src/zustand`, and `frontend/src/service/stompService.ts` for realtime messaging.
- For protocol details and event shapes, prefer `docs/communication.md` and `openapi.yml` over inference.

## Conventions
- Do not edit generated code in `backend/target/generated-sources/openapi` or `frontend/src/api/generated/openapi`. Change `openapi.yml` or generator configuration instead.
- Keep backend changes aligned with the existing Lombok + MapStruct style. Services own business logic, repositories stay thin, and controllers delegate rather than embed application logic.
- Keep the REST and WebSocket flows separate. HTTP endpoints live under `/api/v1`; realtime messaging uses `/ws`, `/app/**`, `/topic/**`, and `/user/queue/**`.
- Preserve existing frontend patterns: page containers handle route-scoped data loading and subscriptions, shared app state lives in Zustand stores, and shadcn UI primitives stay under `frontend/src/shadcn`.
- Follow the repo’s existing formatters instead of reformatting by hand: backend formatting is enforced by Spotless and the frontend by ESLint.

## Pitfalls
- Local auth depends on the mock OIDC server at `http://localhost:4011`; it does not work on ARM hosts.
- The frontend Vite proxy expects the backend on `localhost:8080` for both `/api` and `/ws` traffic.
- The frontend in this repo is React + Vite + TypeScript. It uses shadcn UI components but is not a pure shadcn app. These components must be installed and updated via shadcn CLI.
- When changing realtime behavior or event payloads, update both the backend publishers/consumers and the frontend event handling code.

## Key References
- See `README.md` for local setup commands.
- See `docs/communication.md` for REST and STOMP endpoint semantics.
- See `docs/project/overview.md` and `docs/project/requirements.md` for domain context and feature scope.
