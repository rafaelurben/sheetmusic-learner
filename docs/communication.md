# sheetmusic-learner communication

This document contains a general overview of the communication protocols and endpoints used.

A detailed description of the API endpoints and WebSocket messages can be found in the specifications:

- [OpenAPI specification (REST)](../openapi.yml)
- [AsyncAPI specification (WebSocket)](../asyncapi.yml)

## Synchronous communication

Available as REST endpoints.

Endpoint base: `/api/v1/`

| Method | Endpoint                   | Description                |
|--------|----------------------------|----------------------------|
| GET    | `users/me`                 | Get the current user.      |
| GET    | `pieces`                   | Get all accessible pieces. |
| POST   | `pieces`                   | Create a new piece.        |
| GET    | `pieces/{id}`              | Get a specific piece.      |
| POST   | `pieces/{id}/score/upload` | Upload new score sheets.   |
| GET    | `rooms`                    | Get all accessible rooms   |
| POST   | `rooms`                    | Create a new room.         |
| GET    | `rooms/{id}`               | Get a specific room.       |

## Asynchronous communication

Protocol: STOMP over WebSockets.

WebSocket-Endpoint: `/ws`

### Topics

Topics are used for broadcasting messages from the server clients.

| Destination                 | Description                                                       |
|-----------------------------|-------------------------------------------------------------------|
| `/topic/general`            | General messages (e.g. room created, public piece deleted)        |
| `/topic/piece.{id}`         | Changes made to a piece                                           | 
| `/topic/room.{id}`          | Messages for people in a room: state changes, chat messages, etc. |
| `/user/queue/notifications` | Per-user queue for messages only for specific users [1]           |

### Application destinations

Application destinations are used for sending messages from clients to the server.

| Destination                         | Description                                                              |
|-------------------------------------|--------------------------------------------------------------------------|
| `/app/piece.{id}/update`            | Edit piece metadata (title, composer)                                    |
| `/app/piece.{id}/section/add`       | Add a section to a piece                                                 |
| `/app/piece.{id}/section/update`    | Edit/update an existing section                                          |
| `/app/piece.{id}/section/remove`    | Remove a section from a piece                                            |
| `/app/piece.{id}/permission/update` | Update piece ACL / toggle public status / add or remove user permissions |
| `/app/room.{id}/update`             | Update room metadata (visibility, title, etc.) (owner action)            |
| `/app/room.{id}/change-piece`       | Change selected piece for the room (owner action)                        |
| `/app/room.{id}/control/play`       | Start playback in the room (owner action)                                |
| `/app/room.{id}/control/pause`      | Pause playback in the room (owner action)                                |
| `/app/room.{id}/control/position`   | Change current position / select page (owner action)                     |
| `/app/room.{id}/chat`               | Send a chat message to a room                                            |

**Room join** and **leave** actions are handled by subscribing and unsubscribing to the room topic, so there are no
specific application destinations for that. A session disconnect event is also considered a leave action and handled
accordingly.

Every message sent to an application destination is validated on the server. If the message is...

- ... well-formed and the user has permission to perform the action, the message is processed and an appropriate
  response is sent to all affected clients (e.g. all clients in a room if a piece is changed).
- ... well-formed but the user doesn't have permission to perform the action, an error message is sent to the user via
  the special user queue ([1]).
- ... not well-formed, an error message is sent to the user via the special user queue ([1]) and the message is
  discarded without any further processing.

[1]: https://docs.spring.io/spring-framework/reference/web/websocket/stomp/user-destination.html
