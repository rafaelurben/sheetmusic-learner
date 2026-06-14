# sheetmusic-learner

An application for collaboratively learning sheetmusic.

## Repository structure

- `backend`: Spring Boot backend (Port: 8080)
- `frontend`: React frontend (Port: 5173)
- [`docs`](./docs/README.md): Documentation

## Local setup

### Devcontainer

This repository contains a fully configured devcontainer setup.
The [devcontainer config](./.devcontainer/devcontainer.json) handles all configurations and installation of
the application. VS Code works best: Just run the action "Dev Containers: Clone Repository in Container Volume" and
select this repository.

After the container is built, manually starting the application is required via the following commands: (run in two
separate terminal windows)

```bash
cd backend && mvn spring-boot:run
cd frontend && npm run dev
```

The frontend should be available on http://localhost:5173. You can log in using one of the mock users below.

**Known bug**: The application will show internal server errors after the first login. This is caused by a race
condition in the backend. It will not impact the functionality.

### Dependencies

- Docker including Docker Compose
- JDK 25+
- Maven 3.9+
- Node.js 24+

### Services

The [docker-compose.yml](docker-compose.yml) configuration contains three services for easy local development:

1. A postgres database running on port 5433
    - Warning: This is not the default port for postgres!
2. A simple mock OIDC server running on port 4011
    - **Important**: Newer image versions than the one fixed do **not** work on ARM
      architectures! ([Issue](https://github.com/Soluto/oidc-server-mock/issues/165))
    - Mock users: (username = password)
        - `rafael` (rafael.urben@dummy.tpto.ch)
        - `rick` (rick.astley@dummy.tpto.ch)
        - `bart` (bart.simpson@dummy.tpto.ch)
        - `donald` (donald.duck@dummy.tpto.ch)
3. A local minio instance running on port 9000 for object storage
    - Web console available on port 9090: http://localhost:9090
    - Username: `minio-admin`
    - Password: `minio-admin`

### Commands

- **Services**:
    - Start: `docker compose up -d --wait`
    - Stop: `docker compose down`
- **Backend**:
    - Install: `cd backend && mvn verify -DskipTests`
  - Run: `cd backend && mvn spring-boot:run`
- **Frontend**:
    - Install: `cd frontend && npm ci && npm run generate:openapi`
    - Run: `cd frontend && npm run dev`

#### Other scripts

**Full local docker setup**: This builds the entire application as docker containers and runs it with all services.

```bash
cd frontend && npm ci && npm run build && cd ..
cd backend && mvn verify -DskipTests && cd ..
docker compose -f docker-compose-full.yml up --build --wait --detach
```

Depending on your OS, you may need to add `host.docker.internal` to your host file, pointing to `127.0.0.1`.
