# sheetmusic-learner project overview

## Project description

sheetmusic-learner is a web application that allows musicians to upload sheet music pieces and practice them with others
using synchronized playback (page turner) and chat in "rooms". They can also practice alone with a metronome and
tempo control. The application is designed to make collaborative music practice and learning easier.

## Technology

- Frontend:
    - React
    - TypeScript
    - Tailwind CSS
    - ShadCN UI (design components)
    - Zustand (state management)
    - PDF.js (PDF rendering)
    - STOMP.js (WebSocket communication)
- Backend:
    - Spring Boot
        - STOMP (over WebSocket)
        - Spring Security
            - OAuth2/OIDC Authentication/authorization
        - PostgreSQL (metadata storage)
    - S3 client
    - Hibernate (ORM) including Hibernate Envers (auditing)
    - Liquibase (database migrations)
- External services:
    - S3-compatible storage
    - External IdP for OAuth2/OIDC authentication
- Other:
    - Docker (containerization)
    - GitLab CI/CD (continuous integration and deployment)
    - Git (version control)
    - PlantUML (diagrams)
    - OpenAPI Generator

## Technology decisions

Some technologies were already (wrongly) defined as part of the project requirements (S3, PostgreSQL, OIDC, STOMP).

- **Frontend**: React was chosen because I wanted to use ShadCN UI, which is a component library built on top of
  Tailwind CSS. ShadCN UI provides a great set of pre-built components that are easy to customize and integrate into a
  React application.
    - Tailwind CSS came with this decision. It helps to quickly and responsively style the application without writing
      custom CSS.
    - TypeScript was chosen for type safety and better developer experience.
    - Zustand was chosen for state management because of its simplicity and minimal boilerplate.
    - PDF.js was chosen for PDF rendering because it is a well-known library for this purpose and there are not
      really any good alternatives.
- **Backend**: Spring Boot was chosen for the backend because of its ease of use and extensive ecosystem.
    - STOMP (already in the requirements) was chosen for WebSocket communication because it provides a very simple
      abstraction over WebSocket and is well-supported in Spring Boot.
    - Hibernate was chosen for ORM because of its maturity and good integration with Spring Boot. Also, it includes
      Hibernate Envers, which provides auditing capabilities out of the box, allowing us to track changes to entities.
    - Liquibase was chosen for database migrations because of its simplicity.
- Docker was chosen for containerization to ensure consistency across different environments and to simplify deployment.
- GitLab CI/CD was chosen for continuous integration and deployment because GitLab is a prerequirement for the project.
- OpenAPI Generator was chosen for an easy way to use an API-first approach and to generate API documentation and
  client code.
- PlantUML was chosen for diagrams because of its simplicity and ease of use, especially for sequence diagrams and
  architecture diagrams.
