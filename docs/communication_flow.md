# communication flow

The backend and frontend communicate using a synchronous REST API and an asynchronous STOMP over WebSocket protocol, as defined in the [communication protocol](communication.md) documentation.

When opening the frontend, it sends a request to the "frontend-config" endpoint to retrieve the necessary configuration for initiating the authentication via OIDC. After successful authentication, the client receives an access token, which is used for subsequent requests to the server.

After the authentication library finished the authentication process, the following steps occur:
- The client sends a request to the "user-info" endpoint, which ensures the user information in the database is up to date with the user information from the JWT token.
- The client opens a STOMP session and adds two STOMP subscriptions:
    - One for the general topic "/topic/general" to receive general updates and notifications from the server.
    - One for the user-specific topic "/user/queue/updates" to receive user-specific updates and notifications.

All requests that require a response (e.g. fetching data) are sent via the REST API, while real-time updates and notifications are received through the STOMP over WebSocket protocol.

The frontend uses the "zustand" library for state management, which allows it to manage the application state 
efficiently and reactively. Events sent from the server are applied to the state using zustand's "set" function, which triggers re-rendering of the relevant components in the frontend to reflect the updated state.
