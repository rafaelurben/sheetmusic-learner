# sheetmusic-learner communication

This document contains a general overview of the communication protocols and endpoints used.

## Synchronous communication

Available as REST endpoints.

Endpoint base: `/api/v1/`

| Method | Endpoint                   | Description                |
|--------|----------------------------|----------------------------|
| GET    | `users/me`                 | Get the current user.      |
| GET    | `users/by-email?email=...` | Get a user by email.       |
| GET    | `pieces`                   | Get all accessible pieces. |
| POST   | `pieces`                   | Create a new piece.        |
| GET    | `pieces/{id}`              | Get a specific piece.      |
| DELETE | `pieces/{id}`              | Delete a specific piece.   |
| POST   | `pieces/{id}/score/upload` | Upload new score sheets.   |
| GET    | `rooms`                    | Get all accessible rooms   |
| POST   | `rooms`                    | Create a new room.         |
| GET    | `rooms/{id}`               | Get a specific room.       |
| DELETE | `rooms/{id}`               | Delete a specific room.    |

A detailed description of the REST API endpoints can be found in the [OpenAPI document](../openapi.yml).

## Asynchronous communication

Protocol: STOMP over WebSockets.

WebSocket-Endpoint: `/ws`

### Topics

Topics are used for broadcasting messages from the server to clients.

| Name                      | Destination                 | Description                                                       |
|---------------------------|-----------------------------|-------------------------------------------------------------------|
| [General](#topic-general) | `/topic/general`            | General messages (e.g. room created, public piece deleted)        |
| [Piece](#topic-piece)     | `/topic/piece.{id}`         | Changes made to a piece                                           | 
| [Room](#topic-room)       | `/topic/room.{id}`          | Messages for people in a room: state changes, chat messages, etc. |
| [User](#topic-user)       | `/user/queue/notifications` | Per-user queue for messages only for specific users [1]           |

Messages sent to topics are sent in JSON and have the following format:

```json5
{
  "type": "string",
  "payload": {
    /* message specific content */
  }
}
```

#### Topic: General

- `type`: `piece-now-available`
    - Description: A new piece was created or an existing piece was made public. Clients should add it to their lists.
    - Payload:
      ```json5
      {
        "piece": {/* PieceMetadata */}
      }
      ```
- `type`: `piece-metadata-updated`
    - Description: A piece's metadata (title, composer) was updated. Clients should update the piece in their lists.
    - Payload:
      ```json5
      {
        "piece": {/* PieceMetadata */}
      }
      ```
- `type`: `piece-now-unavailable`
    - Description: A piece was deleted or made private. Clients should remove it from their lists.
    - Payload:
      ```json5
      {
        "pieceId": "string"
      }
      ```
- `type`: `room-now-available`
    - Description: A new room was created. Clients should add it to their lists.
    - Payload:
      ```json5
      {
        "room": {/* RoomMetadata */}
      }
      ```
- `type`: `room-metadata-updated`
    - Description: A room's metadata was updated. Clients should update the room in their lists.
    - Payload:
      ```json5
      {
        "room": {/* RoomMetadata */}
      }
      ```
- `type`: `room-now-unavailable`
    - Description: A room was deleted. Clients should remove it from their lists.
    - Payload:
      ```json5
      {
        "roomId": "string"
      }
      ```

#### Topic: Piece

Only users that are currently viewing this piece (e.g. in a piece editor) will subscribe to this topic, so messages here
are relevant only for those users.

- `type`: `metadata-updated`: see `piece-metadata-updated` in the general topic.
- `type`: `section-added`
    - Description: A new section was added to the piece.
    - Payload:
      ```json5
      {
        "section": {/* SectionDto */}
      }
      ```
- `type`: `section-updated`
    - Description: An existing section was updated.
    - Payload:
      ```json5
      {
        "section": {/* SectionDto */}
      }
      ```
- `type`: `section-removed`
    - Description: A section was removed from the piece.
    - Payload:
      ```json5
      {
        "sectionId": "uuid"
      }
      ```
- `type`: `score-sheet-added`
    - Description: A new score sheet was added to the piece.
    - Payload:
      ```json5
      {
        "scoreSheet": {/* ScoreSheetDto */}
      }
      ```
- `type`: `score-sheet-updated`
    - Description: A score sheet title or position was updated.
    - Payload:
      ```json5
      {
        "scoreSheet": {/* ScoreSheetDto */}
      }
      ```
- `type`: `score-sheet-removed`
    - Description: A score sheet was deleted from the piece.
    - Payload:
      ```json5
      {
        "scoreSheetId": "uuid"
      }
      ```
- `type`: `permission-added`
    - Description: A user permission was added to the piece.
    - Payload:
      ```json5
      {
        "user": {/* UserDto */},
        "permissionType": "<PermissionType>"
      }
      ```
- `type`: `permission-updated`
    - Description: A user permission was updated.
    - Payload:
      ```json5
      {
        "userId": "uuid",
        "permissionType": "<PermissionType>"
      }
      ```
- `type`: `permission-removed`
    - Description: A user permission was removed from the piece.
    - Payload:
      ```json5
      {
        "userId": "uuid"
      }
      ```
- `type`: `piece-deleted`
    - Description: The piece was deleted.
    - Payload: *none*

#### Topic: Room

Only users that are currently in this room are subscribed to this topic, so messages here are relevant only for those
users.

- `type`: `metadata-updated`
    - Description: A room's metadata (title, visibility) was updated.
    - Payload:
      ```json5
      {
        "room": {/* RoomMetadata */}
      }
      ```
- `type`: `piece-changed`
    - Description: The selected piece for the room was changed.
    - Payload:
      ```json5
      {
        "piece": {/* PieceDto */}
      }
      ```
- `type`: `playback-started`
    - Description: Playback in the room was started.
    - Payload: *none*
- `type`: `playback-paused`
    - Description: Playback in the room was paused.
    - Payload: *none*
- `type`: `position-changed`
    - Description: The current playback position or selected page was changed.
    - Payload:
      ```json5
      {
        "currentSectionPosition": 5
      }
      ```
- `type`: `chat-message`
    - Description: A new chat message was sent in the room.
    - Payload:
      ```json5
      {
        "messageId": "uuid",
        "sender": {/* UserDto */},
        "content": "string",
        "timestamp": "2024-01-01T12:00:00Z"
      }
      ```
- `type`: `room-deleted`
    - Description: The room was deleted.
    - Payload: *none*

#### Topic: User

This is a special topic that is only subscribed to by a single user. It is used for sending messages that are only
relevant for a specific user, such as error messages or notifications about actions that the user performed. [1]

- `type`: `error`
    - Description: An error occurred while processing a message sent by the user. The payload contains details about the
      error.
    - Payload:
      ```json5
      {
        "error": "machine-readable-error-type",
        "message": "Human-readable error message",
      }
      ```
- `type`: `room-joined`
    - Description: The user successfully joined a room. The payload contains the room's metadata and the current state
      of the room (selected piece, playback position, etc.).
    - Payload:
      ```json5
      {
        "room": {/* Room including Piece */},
      }
      ```

### Application destinations

Application destinations are used for sending messages from clients to the server.

| Destination                          | Description                                                   | Payload                  |
|--------------------------------------|---------------------------------------------------------------|--------------------------|
| `/app/piece.{id}/update`             | Edit piece metadata                                           | Piece metadata           |
| `/app/piece.{id}/score-sheet/update` | Edit score sheet title and/or position                        | Score sheet id, updates  |
| `/app/piece.{id}/score-sheet/delete` | Delete a score sheet                                          | Score sheet id           |
| `/app/piece.{id}/section/add`        | Add a section to a piece                                      | Section object           |
| `/app/piece.{id}/section/update`     | Edit/update an existing section                               | Section object           |
| `/app/piece.{id}/section/remove`     | Remove a section from a piece                                 | Section id               |
| `/app/piece.{id}/permission/add`     | Add a user permission                                         | User id, permission type |
| `/app/piece.{id}/permission/update`  | Update a user permissions                                     | User id, permission type |
| `/app/piece.{id}/permission/remove`  | Remove a user permissions                                     | User id                  |
| `/app/room.{id}/update`              | Update room metadata (visibility, title, etc.) (owner action) | Room Metadata            |
| `/app/room.{id}/change-piece`        | Change selected piece for the room (owner action)             | Piece id                 |
| `/app/room.{id}/control/play`        | Start playback in the room (owner action)                     |                          |
| `/app/room.{id}/control/pause`       | Pause playback in the room (owner action)                     |                          |
| `/app/room.{id}/control/position`    | Change current position / select page (owner action)          | Current position         |
| `/app/room.{id}/chat`                | Send a chat message to a room                                 | Message                  |

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
