# sheetmusic-learner requirements

## Overview grouped by category

- Auth
    - [FR-01 — OAuth sign-in](#fr-01--oauth-sign-in)
- Piece-management
    - [FR-02 — Upload piece](#fr-02--upload-piece)
    - [FR-03 — Access control (ACL)](#fr-03--access-control-acl)
    - [FR-04 — Timing/metronome info](#fr-04--timingmetronome-info)
    - [OFR-02 — Track selection](#ofr-02--track-management)
- Player
    - [FR-05 — Page navigation](#fr-05--page-navigation)
    - [FR-06 — Playback with tempo multiplier](#fr-06--playback-with-tempo-multiplier)
    - [FR-07 — Visual cursor](#fr-07--visual-cursor)
    - [OFR-03 — Persist track preferences](#ofr-03--track-view)
    - [OFR-04 — Visual metronome](#ofr-04--visual-metronome)
    - [OFR-05 — Audio metronome](#ofr-05--audio-metronome)
- Rooms
    - [FR-08 — Create room](#fr-08--create-room)
    - [FR-09 — Share piece to room](#fr-09--share-piece-to-room)
    - [FR-10 — Join and list rooms](#fr-10--join-and-list-rooms)
    - [FR-11 — Room chat](#fr-11--room-chat)
    - [FR-12 — Owner control & sync](#fr-12--owner-control--sync)
    - [OFR-01 — Change room visibility](#ofr-01--change-room-visibility)
- Data
    - [NFR-01 — S3 storage](#nfr-01--s3-storage)
    - [NFR-02 — Relational metadata](#nfr-02--relational-metadata)
- Communication
    - [NFR-03 — WebSockets for sync/chat](#nfr-03--websockets-for-syncchat)
- UI
    - [ONFR-01 — User avatars via Gravatar](#onfr-01--user-avatars-via-gravatar)

## Requirements

### Functional requirements (FR)

#### FR-01 — OAuth sign-in

Categories: Auth

A user can sign in using OAuth2/OIDC using a predefined external IdP.

#### FR-02 — Upload piece

Categories: Piece-management

A signed-in user can upload sheet music pieces as a PDF. The piece is uploaded to the server and stored for later
download. The user can also provide metadata about the piece, such as title, composer and instruments/voices. The user
is the owner of the piece and has full permission to manage it. By default, the piece is private and only visible to the
owner.

#### FR-03 — Access control (ACL)

Categories: Piece-management / Auth

The owner of a piece can define which users can view, edit and manage its uploaded sheet music (Access Control List).
The owner can also make the piece public, which allows any authenticated user to view it, but only the owner can edit
and manage it.

#### FR-04 — Timing/metronome info

Categories: Piece-management

An authorized user can add timing/metronome information to a piece, defining the separate sections of the piece with
their respective tempo.

#### FR-05 — Page navigation

Categories: Player

An authorized user can view pieces page by page and navigate between pages.

#### FR-06 — Playback with tempo multiplier

Categories: Player

An authorized user can "play" a piece with a selected tempo multiplier, which starts displaying the current position in
the piece and automatically turns pages.

#### FR-07 — Visual cursor

Categories: Player

The player can enable a visual cursor that shows the current position in the piece.

#### FR-08 — Create room

Categories: Rooms

A user can create rooms with public visibility.

#### FR-09 — Share piece to room

Categories: Rooms

The owner of a room can select a piece they have access to that is shared with the room.

#### FR-10 — Join and list rooms

Categories: Rooms

Any user can join and leave a room. All currently available rooms are displayed and immediately updated when new rooms
are created or deleted.

#### FR-11 — Room chat

Categories: Rooms

Players in the same room can chat with each other.

#### FR-12 — Owner control & sync

Categories: Rooms

The owner can navigate the selected piece or start automatic playback. The current position in the piece is synchronized
for all users in the same room.

### Non-functional requirements (NFR)

#### NFR-01 — S3 storage

Categories: Data

Uploaded pieces are stored in an S3-compatible bucket.

#### NFR-02 — Relational metadata

Categories: Data

Metadata about pieces, rooms and users is stored in a relational database (PostgreSQL).

#### NFR-03 — WebSockets for sync/chat

Categories: Communication

The player uses WebSockets for chatting and synchronizing the current position in the piece between players in the same
room.

## Optional requirements

### Optional functional requirements (OFR)

#### OFR-01 — Change room visibility

Categories: Rooms

A user can select and change the visibility of a room.

#### OFR-02 — Track management

Categories: Piece-management

Separate tracks of a piece (on the same sheet) can be separately managed. For example, a piece with a
voice and a piano track can be displayed with only the voice track, only the piano track or both tracks.

#### OFR-03 — Track view

Categories: Player

Every user can select the track(s) they want to see for a specific piece. The selected tracks are stored in the user's
preferences and applied whenever the user views that piece.

#### OFR-04 — Visual metronome

Categories: Player

The user can enable a visual metronome that shows the current beat and tempo.

#### OFR-05 — Audio metronome

Categories: Player

The user can enable an audio metronome that plays a click sound on the current beat.

### Optional non-functional requirements (ONFR)

#### ONFR-01 — User avatars via Gravatar

Categories: UI

Users see avatars of other users in the same room. The avatars are provided by Gravatar based on the users' email
addresses.
