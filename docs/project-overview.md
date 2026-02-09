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
    - STOMP support
    - ACL and authentication/authorization
    - S3 client
    - PostgreSQL (metadata storage)
- External services:
  - S3-compatible storage
  - External IdP for OAuth2/OIDC authentication
