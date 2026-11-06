# Frontend Agent Guide

## Stack

- React 19 (`react`, `react-dom` 19.2+), TypeScript strict (~6.0), Vite 8 (`@vitejs/plugin-react`)
- Routing: React Router v7 (`react-router-dom`) | State: Zustand v5 (`zustand`)
- UI: shadcn UI (`src/shadcn/components/ui/`), Lucide React, Sonner toasts (`sonner`)
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`), `cn()` helper (`@/shadcn/lib/utils` via `clsx` + `tailwind-merge`)
- Auth: `react-oidc-context` + `oidc-client-ts` (mock OIDC: `http://localhost:4011`)
- API Client: Generated TS client via `@openapitools/openapi-generator-cli` from root `openapi.yml`
- Realtime: `@stomp/stompjs` (STOMP over WS: `/ws`)
- Tests: Vitest (`vitest`), `@testing-library/jest-dom`, `jsdom`
- Lint/Format: ESLint 10, Prettier (`eslint-plugin-react-hooks`, `eslint-plugin-react-x`, `typescript-eslint`)

## Commands (cwd: `frontend/`)

- `npm ci` - Install dependencies
- `npm run generate:openapi` - Regenerate client from root `openapi.yml` (**run after any `openapi.yml` edit**; Vite
  does not auto-regenerate)
- `npm run dev` - Dev server at `http://localhost:5173` (proxies `/api` and `/ws` to `http://localhost:8080`)
- `npm run fix` - Lint and fix formatting (**REQUIRED**; do NOT run `npm run lint`)
- `npm run typescript-check` - Type check
- `npm run test:unit` - Vitest unit tests
- `npm run test:ci` - Vitest with coverage
- `npm run build` - Full build (openapi generation, tsc, vite build)

## Architecture & Structure

Path alias `@/` resolves to `frontend/src`.

- `src/api/generated/openapi/`: Generated API client. **Never edit manually.**
- `src/api/useAuthenticatedApiClient.ts`: Authenticated hooks (`usePiecesApi()`, `useRoomsApi()`, `useUsersApi()`).
  Injects `Authorization: Bearer <token>` and handles base URL.
- `src/components/`: Shared feature and domain components.
- `src/config/`: App configuration and OIDC settings.
- `src/data/`: Static data and defaults.
- `src/interfaces/`: TypeScript models and WebSocket events (`EventDto.ts`).
- `src/pages/`: Container/Presentational pattern:
  - `*Container.tsx`: Handles `useParams()`, REST fetching via authenticated clients, STOMP lifecycle, Zustand
    dispatches, error/loading views (`ErrorPage`, `ForbiddenPage`).
  - Presentational (`*.tsx`): Pure layout, UI controls, props-driven event callbacks.
- `src/service/`:
  - `stompService.ts`: Subscribe via `const subId = stompService.addSubscription(dest, cb);`. Always unsubscribe in
    `useEffect` cleanup: `stompService.removeSubscription(subId);`.
  - `stompPublishingService.ts`: Publish actions to `/app/**`.
  - Metronome engine and audio utilities.
- `src/shadcn/`: Primitives in `components/ui/`. Add via `npx shadcn@latest add <name>`. Merge classes with `cn(...)`.
- `src/test/`: Setup and mocks (`src/test/setup.ts` resets mocks/timers in `afterEach`). Tests live alongside code
  (`*.test.ts`/`*.test.tsx`). Mock async/STOMP with `vi.fn()`/`vi.spyOn()`.
- `src/zustand/`: Domain stores:
  - `mainStore.ts`: Connection status, current user profile, room overview list.
  - `roomStore.ts`: Room state, joined users, chat history, piece selection.
  - `pieceStore.ts`: Active piece, score sheets, sections, collaborator permissions.
  - `pageTitleStore.ts`: Reactive document title.
  - **Selector rule**: Always use fine-grained selectors (`useMainStore(s => s.prop)`); never destructure the full store
    (`const { prop } = useMainStore()`).

## React 19 & TypeScript Conventions

- **Hooks**: Direct named imports only: `import { useState, useEffect, useMemo, useCallback, useRef } from "react";`.
  Never use `React.useState`. Keep `import * as React` only for types (`React.ReactNode`, `React.CSSProperties`) or JSX
  compatibility.
- **State**: Keep state local when possible; derive values during render or with `useMemo`.
- **Cleanups**: All `useEffect` listeners, intervals, timeouts, and STOMP subscriptions must return cleanup functions.
- **Typing**: Avoid `any`. Use OpenAPI DTOs (`PieceDto`, `RoomDto`), event interfaces (`RoomEventDto`), or strict
  generics.
- **Error handling**: Handle async API errors with `err instanceof ResponseError` from `@/api/generated/openapi` (e.g.
  `err.response.status === 404`).

## Key Files

- API Contract: `../openapi.yml`
- Dev Config: `vite.config.ts`, `tsconfig.json`
- Auth API Client: `src/api/useAuthenticatedApiClient.ts`
- STOMP: `src/service/stompService.ts`, `src/service/stompPublishingService.ts`
- Stores: `src/zustand/mainStore.ts`, `src/zustand/roomStore.ts`, `src/zustand/pieceStore.ts`
- Testing: `src/test/setup.ts`
- Protocol Docs: `../docs/communication.md`
