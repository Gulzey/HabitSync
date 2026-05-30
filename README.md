# HabitSync

HabitSync is a React Native / Expo habit tracker app. It is built around a local-first setup, so habits are saved on the device first and can be synced to a backend later if cloud backup is enabled.

## What it does

- Add and remove habits
- Tick habits off for the day
- Track current and longest streaks
- Show daily completion progress
- Show weekly progress in a small graph
- Switch between dark and light mode
- Store habit data locally with AsyncStorage
- Includes a basic Express/MongoDB backend for syncing

## Running the app

From the project root:

```bash
npm install
npx expo start --tunnel
```

Then scan the QR code with Expo Go.

If the app gets stuck with old cached code:

```bash
npx expo start --tunnel --clear
```

## Running the backend

The backend lives in the `backend` folder.

```bash
cd backend
npm install
npm run dev
```

The backend uses `MONGO_URI` from `backend/.env` and exposes:

```text
GET /health
POST /api/sync
```

## Notes

This project is currently set up for local development. The cloud sync endpoint in the mobile app should be changed to the real deployed backend URL before using sync outside your local machine.

Secrets should stay in `.env` files and should not be committed.
