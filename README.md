# MediaLog

A personal media tracking web application for games, films, and series, built as a portfolio project at Holberton School Bordeaux.

MediaLog lets users maintain a unified list of the media they are playing, watching, planning to consume, or have finished, with per-entry metadata such as platform, dates, playtime, completion percentage, and personal ratings.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Application architecture](#application-architecture)
- [Database schema](#database-schema)
- [API endpoints](#api-endpoints)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Repository structure](#repository-structure)
- [Development Journal](#development-journal)

---

## Features

- Register and log in with JWT authentication
- Search games (IGDB), films, and series (TMDB) from a unified search interface
- Add any media to a personal list with one of three statuses: **Planned**, **In Progress**, or **Done**
- Track per-entry metadata:
  - Platform (sourced from IGDB for games, TMDB watch providers for films/series)
  - Start and end dates (labelled contextually per media type and status)
  - Playtime in hours and completion percentage (games only)
  - Whether the media was watched/played before
  - Personal note and half-star rating (0.5–5, Done entries only)
- Dashboard with stats, multi-axis filters (status + media type), per-section sorting
- Quick-add modal directly from the dashboard, with already-added detection
- Profile editing with inline field updates and case-insensitive username uniqueness

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS v4, Vite |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT (jsonwebtoken + bcrypt) |
| Game data | IGDB API (via Twitch OAuth2) |
| Film & series data | TMDB API |
| Testing | Jest + Supertest |

---

## Application architecture

<details>
  <summary>Architecture Diagram</summary>

  ![Architecture Diagram](docs/Architecture_Diagram.png)
</details>

The frontend never communicates with external APIs directly. All IGDB and TMDB calls are proxied through the Express backend, which handles authentication tokens and response formatting.

---

## Database schema

<details>
  <summary>Database Diagram</summary>

  ![Database Diagram](docs/DB_Diagram.png)
</details>

The `medias` table stores media metadata independently of users. When multiple users add the same title, the `medias` record is shared and `user_media` stores each user's personal state. The `ON CONFLICT DO UPDATE` pattern on `medias` ensures cover URLs and slugs stay fresh on re-insert.

---

## API endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user, returns JWT |
| POST | `/auth/login` | Log in, returns JWT |
| PUT | `/auth/profile` | Update username, email or password (JWT required) |

### Entries (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/entries` | Get all entries for the authenticated user |
| POST | `/entries` | Add a media entry to the user's list |
| PUT | `/entries/:id` | Update an existing entry |
| DELETE | `/entries/:id` | Remove an entry from the user's list |

### Search (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=&type=` | Search games, movies, series, or all |
| GET | `/search/game/:id` | Get platform list for a game from IGDB |
| GET | `/search/providers/:type/:id` | Get FR flatrate streaming providers from TMDB |

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A Twitch developer account (for IGDB)
- A TMDB API key

### 1. Clone the repository

```bash
git clone https://github.com/AGoutieras/MediaLog.git
cd MediaLog
```

### 2. Set up the database

```bash
psql -U postgres
CREATE DATABASE medialog;
\c medialog
\i backend/src/db/schema.sql
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/medialog
JWT_SECRET=your_jwt_secret
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TMDB_API_KEY=your_tmdb_bearer_token
```

```bash
npm install
npm run dev
```

### 4. Configure the frontend

```bash
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

---

## Running tests

```bash
# Run all tests (from project root)
npm test

# Backend only
cd backend && npm test

# Frontend only
cd frontend && npm test
```

**Backend** — 45 tests covering:
- Auth middleware (JWT validation)
- `POST /auth/register`, `POST /auth/login`, `PUT /auth/profile`
- `GET`, `POST`, `PUT`, `DELETE /entries`
- `GET /search` (game, movie, series, all)
- `GET /search/game/:id` and `GET /search/providers/:type/:id`

**Frontend** — 75 tests covering:
- `StatsBar`: entry counters and labels
- `FilterBar`: status and type filter interactions
- `SearchBar`: input, type filters, spinner
- `EntryDetailModal`: conditional fields per media type (game/movie/series)
- `EntryModal`: conditional fields per media type and status, rating, interactions

<details>
<summary>Test results</summary>

![Test results](docs/test-results.png)

</details>

---

## Repository structure

```
MediaLog/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js          # PostgreSQL connection
│   │   │   └── schema.sql        # Database schema
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js           # Register, login, profile
│   │   │   ├── entries.js        # CRUD for media entries
│   │   │   └── search.js         # IGDB and TMDB proxy routes
│   │   ├── services/
│   │   │   ├── igdb.js           # IGDB API integration
│   │   │   └── tmdb.js           # TMDB API integration
│   │   └── tests/
│   │       ├── auth.test.js      # Auth and profile endpoint tests
│   │       ├── entries.test.js   # Entries CRUD tests
│   │       ├── middleware.test.js # JWT middleware tests
│   │       └── search.test.js    # Search endpoint tests
│   └── index.js                  # Express app entry point
├── docs/
│   ├── architecture.png          # Application architecture diagram
│   ├── db-schema.webp            # Database schema diagram
│   └── test-results.png          # Test results screenshot
├── frontend/
│   └── src/
│       ├── components/           # Reusable React components
│       ├── context/
│       │   └── AuthContext.jsx   # JWT auth state management
│       ├── pages/                # Route-level page components
│       ├── tests/
│       │   ├── EntryDetailModal.test.jsx
│       │   ├── EntryModal.test.jsx
│       │   ├── FilterBar.test.jsx
│       │   ├── SearchBar.test.jsx
│       │   └── StatsBar.test.jsx
│       └── index.css             # Tailwind v4 design tokens
└── README.md
```

## Development Journal

The full development journal is available on the [GitHub Wiki](https://github.com/AGoutieras/MediaLog/wiki/MediaLog), documenting each sprint week by week — technical decisions, difficulties encountered, and what was learned along the way.
