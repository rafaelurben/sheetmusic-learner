# security

## Authentication

The application uses OAuth2/OIDC for authentication. The authentication flow is handled entirely by the frontend using
the _react-oidc-context_ library. The frontend redirects the user to the external IdP for authentication and
receives an ID token and access token upon successful authentication.

The access token (JWT) is then included in the Authorization header of all REST API requests to the backend.
The JWT is also included in the initial STOMP CONNECT message to authenticate the WebSocket connection.
The backend validates the JWT for both REST API requests and WebSocket connections.

## Authorization

There is no global authorization like e.g. admin or user roles.
Every user can create pieces and rooms.
Pieces include an ACL (access control list) that defines which users have access to the piece and what permissions
they have (owner/editor/reader). Only users with access to a piece can add it to a room, but once a piece is added to a
room, all users in the room can see it and practice with it, regardless of their permissions on the piece itself.

### Piece permission table

| Action                          | Owner | Editor | Reader [1] |
|---------------------------------|-------|--------|------------|
| View metadata                   | ✅     | ✅      | ✅          |
| Edit metadata                   | ✅     | ✅      | ❌          |
| Switch public/private           | ✅     | ❌      | ❌          |
| View permissions                | ✅     | ✅      | ✅          |
| Edit permissions                | ✅     | ❌      | ❌          |
| View scoresheets                | ✅     | ✅      | ✅          |
| Upload/update/delete scoresheet | ✅     | ✅      | ❌          |
| View sections                   | ✅     | ✅      | ✅          |
| Create/update/delete section    | ✅     | ✅      | ❌          |
| View & preview history          | ✅     | ✅      | ❌          |
| Restore from history            | ✅     | ❌      | ❌          |
| Add piece to a room             | ✅     | ✅      | ✅          |
| Delete piece                    | ✅     | ❌      | ❌          |

[1]: Includes every user if a piece is set to `public`.

### Decision: STOMP sessions

When a user opens a piece, the frontend establishes a STOMP subscription to the piece's topic to receive real-time
updates about the piece (e.g. if it is updated or deleted). The authorization for this subscription is checked on the
initial STOMP SUBSCRIBE message. That means that a user could potentially keep the WebSocket connection alive and
receive updates about a piece even after their access to the piece has been revoked. The STOMP specification does not
provide any way for the server to close a specific subscription or to force the client to unsubscribe from a topic.
The only way to stop the user from receiving updates about a piece is to close the entire WebSocket connection,
which would also disconnect the user from all rooms and stop all real-time updates.

Decision: This is a low risk issue because readonly access to updates about a piece are not security critical. I
will not implement any backend workaround for this issue.
