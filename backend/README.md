# HabitSync Backend

Small Express API for syncing local-first habit data to MongoDB.

## Setup

```bash
cd backend
npm install
npm run dev
```

## Endpoints

`GET /health`

Checks that the API is running.

`POST /sync`

Creates or updates the latest habit snapshot for a user.

```json
{
  "userId": "local-device-user",
  "habits": [],
  "syncedAt": "2026-05-30T00:00:00.000Z"
}
```
