# sheetmusic-learner

An application for collaboratively learning sheetmusic.

## Repository structure

- `backend`: Spring Boot backend (Port: 8080)
- `frontend`: Angular frontend (Port: 5173)
- [`docs`](./docs/README.md): Documentation

## Local setup

### Devcontainer

This repository contains a fully configured devcontainer setup.
The [devcontainer config](./.devcontainer/devcontainer.json) handles all configurations, installations and running of
the application.

### Dependencies

- Docker including Docker Compose
- JDK 25+
- Maven 3.9+
- Node.js 24+

### Services

The [docker-compose.yml](docker-compose.yml) configuration contains two services for easy local development:

1. A postgres database running on port 5433
    - Warning: This is not the default port for postgres!
2. A simple mock OIDC server running on port 4011
    - **Important**: Does **not** work on ARM
      architectures! ([Issue](https://github.com/Soluto/oidc-server-mock/issues/165))
    - Mock users: (username = password)
      - `rafael`
      - `rick`
      - `bart`

### Commands

- **Services**:
  - Start: `docker compose up -d --wait`
  - Stop: `docker compose down`
- **Backend**:
  - Install: `cd backend && mvn verify -DskipTests`
  - Run: `cd backend && mvn spring-boot:start`
- **Frontend**:
  - Install: `cd frontend && npm ci && npm run generate:openapi`
  - Run: `cd frontend && npm run dev`
